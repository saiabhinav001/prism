FROM python:3.9-slim

WORKDIR /app

# Install git for trust_remote_code
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only torch first to avoid downloading heavy GPU builds
RUN pip install --no-cache-dir torch==2.1.2 --index-url https://download.pytorch.org/whl/cpu

# Install other requirements
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# HF Spaces expects port 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
