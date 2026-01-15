# Hugging Face Space Deployment Instructions

## 1. Create Space
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces/new).
2. **Owner**: Your username/organization.
3. **Space Name**: `prism-llm-service`.
4. **SDK**: `Docker`.
5. **Hardware**: `CPU Basic (Free)`.
6. Visibility: `Public` or `Private`.

## 2. Deploy Code
You can deploy using Git or by uploading files via the UI.

### Option A: Git Push (Recommended)
```bash
cd hf_space
git init
git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/prism-llm-service
git add .
git commit -m "Deploy Phi-3 service"
git push -u origin main
```

### Option B: Web UI
1. Go to your Space's "Files" tab.
2. Upload `Dockerfile`, `requirements.txt`, and `app.py`.

## 3. Update PRISM Backend
1. Once deployed, get the Direct URL (usually `https://your-username-prism-llm-service.hf.space`).
2. Update your local or production `.env` (or `config.py`):
   ```
   HF_LLM_URL=https://your-username-prism-llm-service.hf.space
   ```

## Notes
- **Startup Time**: The first run will take a few minutes to download the model (approx 2GB).
- **Latency**: Expect 20-60s per request on CPU.
- **Timeouts**: The backend is configured to wait 90 seconds.
