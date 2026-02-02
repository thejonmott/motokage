
import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory
import google.generativeai as genai

# Setup logging for Cloud Run diagnostics
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='dist')

# Configure Gemini
# The API_KEY is now injected via Secret Manager as an environment variable
API_KEY = os.getenv('API_KEY') or os.getenv('GEMINI_API_KEY')
if API_KEY:
    logger.info("Cognitive key successfully detected in environment.")
    genai.configure(api_key=API_KEY)
else:
    logger.error("CRITICAL: API_KEY missing. Backend proxy will fail to authenticate with Google GenAI.")

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message')
        history = data.get('history', [])
        system_instruction = data.get('systemInstruction', '')
        
        # Initialize model using the latest Gemini 3 Pro for high-fidelity reasoning
        model = genai.GenerativeModel(
            model_name='gemini-3-pro-preview',
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
        logger.error(f"Chat Inference Failure: {str(e)}")
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
        
        # Use Gemini 3 Flash for efficient synthesis and JSON formatting
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        
        return jsonify(json.loads(response.text))
    except Exception as e:
        logger.error(f"Synthesis Failure: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Serve static files for React (Single Page Application support)
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
