from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import json
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prism-llm")

app = FastAPI(title="PRISM LLM Service (Phi-3)")

# Global model and tokenizer
model = None
tokenizer = None
pipe = None

MODEL_ID = "microsoft/Phi-3-mini-4k-instruct"

class ReviewRequest(BaseModel):
    diff: str
    truncated: bool = False

@app.on_event("startup")
async def load_model():
    global model, tokenizer, pipe
    logger.info("Loading model... this may take a while on CPU.")
    try:
        # Load model with optimizations for limited memory/CPU
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            device_map="cpu", 
            torch_dtype=torch.float32, 
            trust_remote_code=True,
            low_cpu_mem_usage=True
        )
        
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=1024,
            return_full_text=False
        )
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise RuntimeError(f"Model load failed: {e}")

@app.post("/review")
async def review_diff(request: ReviewRequest):
    if not pipe:
        raise HTTPException(status_code=503, detail="Model not initialized")

    logger.info(f"Received review request. Length: {len(request.diff)}")
    
    # Construct prompt
    system_prompt = """You are an expert Senior Code Reviewer. Analyze the git diff provided.
    Identify: 
    1. Bugs 
    2. Security vulnerabilities 
    3. Performance Note
    
    Output STRICT VALID JSON with this structure:
    {
      "summary": "Short summary",
      "issues": [{"type": "bug|security|performance|code_quality", "severity": "low|medium|high", "description": "...", "suggestion": "..."}],
      "merge_confidence": <0-100>
    }
    """
    
    user_prompt = f"Review this code diff:\n\n{request.diff[:8000]}" # Extra safeguard
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        # Generate
        output = pipe(messages, max_new_tokens=1024, do_sample=False, temperature=0.1)
        generated_text = output[0]['generated_text']
        
        # Phi-3 often chats, we need to extract JSON
        # It usually outputs clean text if instructed well, but let's try to parse
        logger.info("Generation complete. Parsing...")
        
        # Simple heuristic to find JSON start/end
        json_start = generated_text.find('{')
        json_end = generated_text.rfind('}') + 1
        
        if json_start != -1 and json_end != -1:
            json_str = generated_text[json_start:json_end]
            return json.loads(json_str)
        else:
            # Fallback if strict JSON fails
            logger.warning("Could not find JSON brackets. Returning text wrapped.")
            return {
                "summary": "Model output was not valid JSON but here is the text.",
                "issues": [],
                "merge_confidence": 0,
                "raw_text": generated_text
            }

    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"status": "Model active", "model": MODEL_ID}
