
# Motokage Digital Twin (元影) 

### An Enterprise Grade Architecture for Cognitive Legacy & Strategic Reflections

Motokage is a high-fidelity digital twin framework designed to scale professional judgment. This repository provides a production-ready "Recipe" for architecting, securing, and deploying a persistent AI persona using the Google Gemini API, Google Cloud Run, Google Cloud Storage, and Secret Manager.

---

## 🏗 The Architecture
This project implements the **"Gold Standard Security Matrix"** with a **Stateful Memory Core**. It moves beyond simple client-side prompts to a robust, serverless proxy architecture that remembers its identity across sessions.

### Cognitive Flow
1.  **Frontend (React/Vite)**: A sophisticated UI for interacting with the twin and calibrating its DNA.
2.  **Proxy Layer (Python/Flask)**: Acts as the "Guardrail." It intercepts requests and communicates with Google Cloud Storage to load/save the identity state.
3.  **Active Memory (Google Cloud Storage)**: A private bucket acts as the "Hippocampus," storing the `shadow_config.json` (the DNA) so that changes persist even if the container restarts.
4.  **Intelligence (Gemini 3 Pro)**: The reasoning engine that processes the twin's DNA and user queries.
5.  **Security (Secret Manager)**: API keys are never exposed to the browser. They are bound at the kernel level in Cloud Run.

---

## 🎨 The Tech Stack
- **Intelligence**: Gemini 3 Pro (Inference) & Gemini 3 Flash (Synthesis).
- **Frontend**: React 19, Tailwind CSS, TypeScript.
- **Backend**: Python 3.11, Flask.
- **Persistence**: Google Cloud Storage (JSON Blob).
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
    - Cloud Storage API
    - Generative AI API (Vertex AI)

### 2. Configure the Memory Bucket
To ensure your twin remembers changes:
1.  Create a Cloud Storage bucket named `motokage-dna-storage` (or a custom name).
2.  Ensure this bucket is private (uncheck "Enforce public access prevention" if you need specific ACLs, but generally keep it locked).
3.  Grant your Cloud Run Service Account the `Storage Object Admin` role on this bucket.

### 3. Configure the Security Vault
The "Gold Standard" requires that your API key is never stored in code.
1.  Navigate to **Secret Manager**.
2.  Create a secret named `motokage-api-key`.
3.  Paste your Gemini API Key as the secret value.
4.  Grant the `Cloud Run Service Agent` role the `Secret Manager Secret Accessor` permission for this secret.

### 4. Identity Ingestion (How to Personalize Your Twin)
**IMPORTANT:** This repository is a baseline framework. To make it yours, you should rename the twin and replace all branding with your own identity.

**Identity Hotspots to Modify:**
*   **`App.tsx`**: Update the `INITIAL_PERSONA` object. Change the `name`, `profession`, `bio`, and `coreValues` to your own.
*   **`components/Header.tsx`**: Replace the text "MOTOKAGE" and the Kanji symbol `影` with your own brand name and identifier.
*   **`metadata.json`**: Update the app name and description to your specific project title.
*   **`components/ChatInterface.tsx`**: Adjust the `systemInstruction` template to use your twin's name and preferred deployment version.

**NEW: The Codex Strategy:**
Don't just write a bio. Upload large "Reasoning Logs" (PDF/Text) via the Mosaic view. The system treats these documents as **Recursive Meta-Data**—ingesting not just your resume, but the back-and-forth history of *how* you think, enabling the twin to mimic your cognitive patterns.

### 5. Deploying the Matrix
This project uses an atomic deployment strategy via `cloudbuild.yaml`.

**To deploy via CLI:**
```bash
gcloud builds submit --config cloudbuild.yaml .
```

---

## 🛡 Security Pillar: The Proxy Logic
The Python backend (`server.py`) is the critical security boundary. It ensures:
- **Prompt Hardening**: Users cannot "jailbreak" the twin's identity because the System Instruction is injected server-side.
- **State Sovereignty**: The identity DNA is read/written to a secure cloud bucket, never trusted from the client blindly without authentication.
- **Key Isolation**: The browser only ever sees the `/api/chat` endpoint, never the underlying Gemini API credentials.

---

## ⚖️ Operational Modes
The architecture supports two distinct operational states:

1.  **Ambassador Mode (Public)**: 
    *   A hardened, read-only interface.
    *   Designed for the public to "chat" with your reflection.
    *   Resists prompt manipulation.

2.  **Studio Mode (Private)**: 
    *   **Memory Sync (GCS)**: Changes to memories, artifacts, and mandates are auto-saved to Google Cloud Storage. This is the "Mind" of the twin.
    *   **System Deploy (GitHub)**: Updates to the codebase (React/Python) are triggered manually via the dashboard. This is the "Body" of the twin.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Architected with ❤️ by Jonathan Mott & Motokage.*
