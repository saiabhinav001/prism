# PRISM Production Deployment Guide

This guide covers setting up a free **Neon PostgreSQL Database** and deploying the **FastAPI Backend** to Render.

## Part 1: Database Setup (Neon)

Neon is a serverless PostgreSQL platform with a generous free tier.

1.  **Create Account**: Go to [Neon.tech](https://neon.tech/) and Sign Up.
2.  **Create Project**:
    *   Name: `prism-db`
    *   Region: Customer's choice (pick one close to you).
    *   Postgres Version: 16 (or latest).
3.  **Get Connection String**:
    *   On the **Dashboard**, look for "Connection Details".
    *   Select **Reference** (or "Pooled Connection").
    *   Copy the full **Connection String**. It looks like:
        `postgres://user:password@ep-cool-site.us-east-2.aws.neon.tech/neondb?sslmode=require`

## Part 2: Backend Deployment (Render)

Render offers a free tier for Web Services.

1.  **Create Account**: Go to [Render.com](https://render.com/) and Sign Up using **GitHub**.
2.  **New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Select your repository: `saiabhinav001/prism`.
3.  **Configure Service**:
    *   **Name**: `prism-backend`
    *   **Root Directory**: `backend` (Important! This tells Render where the python app is).
    *   **Runtime**: **Python 3**.
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
    *   **Instance Type**: Free.

4.  **Environment Variables**:
    Scroll down to "Environment Variables" and add the following keys.

    | Key | Value |
    | :--- | :--- |
    | `PYTHON_VERSION` | `3.11.0` |
    | `DATABASE_URL` | *Paste your Neon Connection String from Part 1 here* |
    | `HF_LLM_URL` | `https://rockstar00-prism-llm-service.hf.space` |
    | `SECRET_KEY` | *Generate a random strong string (e.g., `openssl rand -hex 32`)* |
    | `GITHUB_CLIENT_ID` | *Your GitHub OAuth Client ID* |
    | `GITHUB_CLIENT_SECRET` | *Your GitHub OAuth Client Secret* |
    | `GITHUB_REDIRECT_URI` | `https://your-render-app-name.onrender.com/auth/callback` (Update this after deployment!) |

5.  **Deploy**: Click **Create Web Service**.

## Part 3: Final Configuration

1.  **Update GitHub OAuth**:
    *   Go back to your [GitHub Developer Settings](https://github.com/settings/developers).
    *   Update the **Authorization callback URL** to match your new Render URL:
        `https://prism-backend.onrender.com/auth/callback`
    *   *(Replace `prism-backend` with whatever name Render gave your app)*.

2.  **Update Config Code (Optional)**:
    *   Your code is smart enough to use `DATABASE_URL` if it exists, so no code changes are needed!
