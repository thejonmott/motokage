
import os
import json
from flask import Flask, request, jsonify, send_from_directory
import google.generativeai as genai

app = Flask(__name__, static_folder='dist')

# Configure Gemini
# Use API_KEY from environment (populated via Secret Manager or Cloud Run Env)
API_KEY = os.getenv('API_KEY') or os.getenv('GEMINI_API_KEY')
if API_KEY:
    genai.configure(api_key=API_KEY)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        history = data.get('history', [])
        system_instruction = data.get('systemInstruction', '')
        
        # Initialize model with system context
        model = genai.GenerativeModel(
            model_name='gemini-1.5-pro',
            system_instruction=system_instruction
        )
        
        # Transform history to match Python SDK format
        formatted_history = []
        for h in history:
            formatted_history.append({
                "role": "user" if h['role'] == 'user' else "model",
                "parts": [{"text": h['parts'][0]['text']}]
            })
            
        chat_session = model.start_chat(history=formatted_history)
        response = chat_session.send_message(message)
        
        return jsonify({'text': response.text})
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/synthesize', methods=['POST'])
def synthesize():
    try:
        data = request.json
        content = data.get('content', '')
        
        prompt = f"""Synthesize these artifacts into the MOSAIC of Jonathan Mott.
        Focus on professional strategic artifacts and evidence.
        Return a JSON object with a 'newShards' array. 
        Each shard MUST have: title, category (one of: axiom, chronos, echo, logos, ethos), content, and sensitivity (PRIVATE or PUBLIC).
        
        Content to synthesize: {content}"""
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        
        return jsonify(json.loads(response.text))
    except Exception as e:
        print(f"Synthesis Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Serve static files for React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
