
import os
import json
import logging
import base64
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from google.cloud import storage

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='dist')
CORS(app)

# Configure Gemini - API Key is sourced server-side via Secret Manager in Cloud Run
API_KEY = os.getenv('API_KEY') or os.getenv('GEMINI_API_KEY')

# GCS Persistence Configuration
# You must create this bucket in GCP or set the env var to an existing bucket
DNA_BUCKET_NAME = os.getenv('DNA_BUCKET', 'motokage-dna-storage')
DNA_FILENAME = 'shadow_config.json'

storage_client = None
try:
    storage_client = storage.Client()
    logger.info(f"STORAGE_STATUS: Connected to GCS. Target Bucket: {DNA_BUCKET_NAME}")
except Exception as e:
    logger.error(f"STORAGE_ERROR: Could not init GCS client. Persistence will fail. {e}")

# Cloud Assist Recommendation: Diagnostic logging for key verification
if API_KEY:
    # confirms the key is found and shows the first few chars for validation
    prefix = API_KEY[:6] if len(API_KEY) > 6 else "SHORT"
    logger.info(f"BRIDGE_STATUS: API_KEY detected (Prefix: {prefix}...). Initializing cognitive core.")
    genai.configure(api_key=API_KEY)
else:
    logger.error("CRITICAL_FAILURE: API_KEY missing. Check Secret Manager binding in Cloud Run.")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'nominal',
        'key_active': API_KEY is not None,
        'key_prefix': API_KEY[:4] if API_KEY else None,
        'persistence_mode': 'GCS' if storage_client else 'EPHEMERAL',
        'timestamp': time.time()
    })

@app.route('/shadow_config.json')
def serve_shadow_config():
    """
    Serves the persisted Persona DNA.
    Priority 1: Google Cloud Storage (The Truth)
    Priority 2: Local Container File (The Factory Default)
    """
    # 1. Try GCS
    if storage_client:
        try:
            bucket = storage_client.bucket(DNA_BUCKET_NAME)
            blob = bucket.blob(DNA_FILENAME)
            if blob.exists():
                logger.info("DNA_FETCH: Serving from GCS Bucket.")
                content = blob.download_as_text()
                return jsonify(json.loads(content))
        except Exception as e:
            logger.warning(f"DNA_FETCH_GCS_FAIL: {e}. Falling back to local.")

    # 2. Fallback to Local
    try:
        if os.path.exists('shadow_config.json'):
            logger.info("DNA_FETCH: Serving from Local Container.")
            return send_from_directory('.', 'shadow_config.json')
        return jsonify({}), 404
    except Exception as e:
        logger.error(f"CONFIG_SERVE_FAIL: {str(e)}")
        return jsonify({}), 404

@app.route('/api/save_dna', methods=['POST'])
def save_dna():
    """Writes the Persona DNA directly to Google Cloud Storage."""
    if not storage_client:
        return jsonify({'error': 'Storage subsystem unavailable. Cannot persist.'}), 503
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        bucket = storage_client.bucket(DNA_BUCKET_NAME)
        # Check if bucket exists, if not, try to create (requires admin perms)
        if not bucket.exists():
            try:
                bucket.create(location="US")
            except Exception as e:
                return jsonify({'error': f'Bucket {DNA_BUCKET_NAME} not found and cannot be created: {str(e)}'}), 500

        blob = bucket.blob(DNA_FILENAME)
        blob.upload_from_string(json.dumps(data, indent=2), content_type='application/json')
        
        logger.info("DNA_SAVE: Successfully wrote to GCS.")
        return jsonify({'status': 'success', 'location': f'gs://{DNA_BUCKET_NAME}/{DNA_FILENAME}'})

    except Exception as e:
        logger.error(f"DNA_SAVE_FAIL: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not API_KEY:
            return jsonify({'error': 'Cognitive bridge offline: API Key not found in environment.'}), 500

        data = request.json
        message = data.get('message')
        history = data.get('history', [])
        system_instruction = data.get('systemInstruction', '')
        model_name = data.get('model', 'gemini-3-flash-preview')

        model = genai.GenerativeModel(
            model_name=model_name, 
            system_instruction=system_instruction
        )
        
        formatted_contents = []
        for h in history:
            role = "user" if h['role'] == 'user' else "model"
            text_val = h['parts'][0]['text'] if 'parts' in h and h['parts'] else ""
            if text_val:
                formatted_contents.append({"role": role, "parts": [text_val]})
        
        formatted_contents.append({"role": "user", "parts": [message]})
        response = model.generate_content(formatted_contents)
        
        if not response.candidates or not response.candidates[0].content.parts:
            return jsonify({'text': '[SYSTEM_ALERT]: No cognitive response generated. Content may have been filtered.'})
            
        return jsonify({'text': response.text})

    except Exception as e:
        logger.error(f"BRIDGE_FAILURE: {str(e)}", exc_info=True)
        return jsonify({'error': f"Inference Interrupted: {str(e)}"}), 500

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
        prompt = "Analyze resume for DNA updates. Return JSON."
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
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
