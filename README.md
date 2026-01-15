# PRISM - AI-Powered Code Review

![PRISM Badge](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-FastAPI-blue)
![AI](https://img.shields.io/badge/AI-Phi--3-orange)

PRISM is a modern SaaS platform that automates code reviews using advanced Large Language Models. It integrates directly with GitHub to provide instant, security-focused feedback on Pull Requests.

> **Note**: This project has been migrated to use **Open Source AI** hosted on Hugging Face Spaces (Phi-3-mini), eliminating dependencies on paid APIs like OpenAI or Gemini.

## 🚀 Features

- **Automated PR Analysis**: Detects bugs, security flaws, and performance issues instantly.
- **GitHub Integration**: Seamlessly connects to your repositories via OAuth.
- **Privacy First**: Code snippets are processed securely; no training on user data.
- **Dashboard**: Visualize code quality metrics and review history.
- **Open Source LLM**: Powered by `microsoft/Phi-3-mini-4k-instruct` running on CPU-based Hugging Face Spaces.

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy (Async), PostgreSQL.
- **Frontend**: Next.js, React, Tailwind CSS.
- **AI/ML**: Transformers, PyTorch, Hugging Face Spaces (Docker).
- **Database**: PostgreSQL with `pgvector` support (optional for future RAG).

## � Project Structure

```bash
prism/
├── backend/            # FastAPI Application (Core Logic)
│   ├── app/            # Service logic, API endpoints, Models
│   └── tests/          # Unit and Integration tests
├── frontend/           # Next.js Application (UI)
├── hf_space/           # Standalone LLM Service (Phi-3)
│   ├── app.py          # Inference entrypoint
│   └── Dockerfile      # Deployment config
└── README.md           # This file
```

## 🔑 Environment Variables

Create a `.env` file in `backend/` with the following:

| Variable | Description |
|----------|-------------|
| `POSTGRES_SERVER` | Database host (e.g., localhost) |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `GITHUB_CLIENT_ID` | OAuth Client ID from GitHub |
| `GITHUB_CLIENT_SECRET` | OAuth Client Secret from GitHub |
| `HF_LLM_URL` | URL of your deployed Hugging Face Space |
| `SECRET_KEY` | Secret for JWT generation |


The system consists of three main components:

1.  **Core API (`backend/`)**: Manages users, repos, and orchestrates analysis workflow.
2.  **LLM Service (`hf_space/`)**: A standalone inference service hosted on Hugging Face Spaces that loads the Phi-3 model and returns structured reviews.
3.  **Frontend (`frontend/`)**: User interface for managing repositories and viewing reports.

## 🏃‍♂️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL
- Docker (optional)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env to add DB credentials and HF_LLM_URL
```

### 2. LLM Service Deployment
Deploy the contents of `hf_space/` to a Hugging Face Space (CPU Basic tier is sufficient).
See [`hf_space/README.md`](hf_space/README.md) for detailed instructions.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔒 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
