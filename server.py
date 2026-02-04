
import os
import json
import logging
import base64
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

# Setup logging to see EVERYTHING in GCP Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='dist')
CORS(app) # Crucial for local development

# Configure Gemini
API_KEY = os.getenv('API_KEY') or os.getenv('GEMINI_API_KEY')
if API_KEY:
    logger.info("COGNITIVE_INFRASTRUCTURE: API_KEY detected and configured.")
    genai.configure(api_key=API_KEY)
else:
    logger.error("CRITICAL_FAILURE: API_KEY is missing. Bridge will hang.")

@app.route('/api/health', methods=['GET'])
def health():
    """Diagnostic endpoint to verify bridge integrity."""
    return jsonify({
        'status': 'nominal',
        'key_active': API_KEY is not None,
        'timestamp': time.time(),
        'version': 'v15.9.2-GOLD-LOCKED'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not API_KEY:
            return jsonify({'error': 'Infrastructure Error: API Key not bound to service.'}), 500

        data = request.json
        message = data.get('message')
        history = data.get('history', [])
        system_instruction = data.get('systemInstruction', '')
        model_name = data.get('model', 'gemini-3-flash-preview')

        logger.info(f"Synthesizing request for model {model_name}...")
        
        # We use the explicit model definition to ensure system instructions are baked in
        model = genai.GenerativeModel(
            model_name=model_name, 
            system_instruction=system_instruction
        )
        
        # Reformulate history into the specific format expected by the Python SDK
        # Format: [{'role': 'user', 'parts': ['text']}, {'role': 'model', 'parts': ['text']}]
        chat_history = []
        for h in history:
            role = "user" if h['role'] == 'user' else "model"
            text_part = h['parts'][0]['text'] if 'parts' in h and h['parts'] else ""
            if text_part:
                chat_history.append({"role": role, "parts": [text_part]})
        
        # Use a timeout context if possible, or just standard SDK call
        chat_session = model.start_chat(history=chat_history)
        response = chat_session.send_message(message)
        
        if not response.candidates:
            return jsonify({'text': '[SYSTEM_ALERT]: No response candidates generated. Safety filter may have triggered.'})
            
        return jsonify({'text': response.text})

    except Exception as e:
        logger.error(f"BRIDGE_EXECUTION_FAILURE: {str(e)}", exc_info=True)
        return jsonify({'error': f"Cognitive bridge interrupted: {str(e)}"}), 500

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    try:
        if not API_KEY: return jsonify({'error': 'Key Missing'}), 500
        data = request.json
        text_content = data.get('text', '')
        file_data = data.get('file')
        parts = []
        if file_data:
            parts.append({'mime_type': file_data['mimeType'], 'data': base64.b64decode(file_data['data'])})
        if text_content:
            parts.append(text_content)
        prompt = "Analyze resume for DNA updates (bio, coreValues, tone). Return JSON."
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content([prompt] + parts, generation_config={"response_mime_type": "application/json"})
        return jsonify(json.loads(response.text))
    except Exception as e:
        logger.error(f"RESUME_FAIL: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/synthesize', methods=['POST'])
def synthesize():
    try:
        if not API_KEY: return jsonify({'error': 'Key Missing'}), 500
        data = request.json
        content = data.get('content', '')
        file_data = data.get('file')
        parts = []
        if file_data:
            parts.append({'mime_type': file_data['mimeType'], 'data': base64.b64decode(file_data['data'])})
        if content:
            parts.append(content)
        prompt = "Synthesize artifact for mosaic. Return JSON {title, summary}."
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content([prompt] + parts, generation_config={"response_mime_type": "application/json"})
        return jsonify(json.loads(response.text))
    except Exception as e:
        logger.error(f"SYNTH_FAIL: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Local dev port 8080 matches the Vite proxy
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
