
# Motokage Digital Twin (元影) 

### An Enterprise Grade Architecture for Cognitive Legacy & Strategic Reflections

Motokage is a high-fidelity digital twin framework designed to scale professional judgment. This repository provides a production-ready "Recipe" for architecting, securing, and deploying a persistent AI persona using the Google Gemini API, Google Cloud Run, and Secret Manager.

---

## 🏗 The Architecture
This project implements the **"Gold Standard Security Matrix"**, which moves beyond simple client-side prompts to a robust, serverless proxy architecture.

### Cognitive Flow
1.  **Frontend (React/Vite)**: A sophisticated UI for interacting with the twin and calibrating its DNA.
2.  **Proxy Layer (Python/Flask)**: Acts as the "Guardrail." It intercepts requests, injects hardened system instructions, and manages conversation history.
3.  **Intelligence (Gemini 3 Pro)**: The reasoning engine that processes the twin's DNA and user queries.
4.  **Security (Secret Manager)**: API keys are never exposed to the browser. They are bound at the kernel level in Cloud Run.

---

## 🎨 The Tech Stack
- **Intelligence**: Gemini 3 Pro (Inference) & Gemini 3 Flash (Synthesis).
- **Frontend**: React 19, Tailwind CSS, TypeScript.
- **Backend**: Python 3.11, Flask.
- **Infrastructure**: Google Cloud Run (Serverless).
- **Security**: Google Secret Manager & Cloud IAM.
- **CI/CD**: Google Cloud Build & GitHub Actions.

---

## 📖 Setup Guide (Paint-by-Numbers)

### 1. Provision the Foundation (GCP)
1.  Create a new project in the [Google Cloud Console](https://console.cloud.google.com/).
2.  Enable the following APIs:
    - Cloud Run API
    - Cloud Build API
    - Secret Manager API
    - Generative AI API (Vertex AI)

### 2. Configure the Security Vault
The "Gold Standard" requires that your API key is never stored in code.
1.  Navigate to **Secret Manager**.
2.  Create a secret named `motokage-api-key`.
3.  Paste your Gemini API Key as the secret value.
4.  Grant the `Cloud Run Service Agent` role the `Secret Manager Secret Accessor` permission for this secret.

### 3. Identity Ingestion (How to Personalize Your Twin)
**IMPORTANT:** This repository is a baseline framework. To make it yours, you should rename the twin and replace all branding with your own identity.

**Identity Hotspots to Modify:**
*   **`App.tsx`**: Update the `INITIAL_PERSONA` object. Change the `name`, `profession`, `bio`, and `coreValues` to your own.
*   **`components/Header.tsx`**: Replace the text "MOTOKAGE" and the Kanji symbol `影` with your own brand name and identifier.
*   **`metadata.json`**: Update the app name and description to your specific project title.
*   **`components/ChatInterface.tsx`**: Adjust the `systemInstruction` template to use your twin's name and preferred deployment version.

### 4. Deploying the Matrix
This project uses an atomic deployment strategy via `cloudbuild.yaml`.

**To deploy via CLI:**
```bash
gcloud builds submit --config cloudbuild.yaml .
```

---

## 🛡 Security Pillar: The Proxy Logic
The Python backend (`server.py`) is the critical security boundary. It ensures:
- **Prompt Hardening**: Users cannot "jailbreak" the twin's identity because the System Instruction is injected server-side.
- **Key Isolation**: The browser only ever sees the `/api/chat` endpoint, never the underlying Gemini API credentials.

---

## ⚖️ Operational Modes
The architecture supports two distinct operational states:
- **Ambassador Mode (Public)**: A hardened, read-only interface for visitors to see how you think.
- **Studio Mode (Private)**: An interrogation room for the owner to "calibrate" the twin, edit memory shards, and adjust the DNA.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Architected with ❤️ by Jonathan Mott & Motokage.*
