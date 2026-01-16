import json
import httpx
from app.core.config import settings

# Timeout for the HF model inference (CPU can be slow)
# Timeout for the HF model inference (CPU can be slow)
TIMEOUT_SECONDS = 300  # Increased to 5 minutes for very slow CPU starts

async def analyze_pr_content(pr_id: int, diff_content: str):
    """
    Sends the diff content to the hosted Hugging Face LLM Service.
    """
    print(f"Analyzing PR {pr_id} via Hugging Face Service...")
    
    if not settings.HF_LLM_URL or "YOUR_USERNAME" in settings.HF_LLM_URL:
        return _get_mock_response("HF_LLM_URL not set or default value detected.")

    # Performance Safeguard: Trim whitespace and limit size
    MAX_DIFF_SIZE = 15000 
    truncated = False
    if len(diff_content) > MAX_DIFF_SIZE:
        diff_content = diff_content[:MAX_DIFF_SIZE]
        truncated = True

    try:
        async with httpx.AsyncClient() as client:
            print(f"DEBUG: Posting to {settings.HF_LLM_URL}/review")
            response = await client.post(
                f"{settings.HF_LLM_URL}/review",
                json={"diff": diff_content, "truncated": truncated},
                timeout=TIMEOUT_SECONDS
            )
            
            if response.status_code != 200:
                error_msg = f"HF Service Error: {response.status_code} - {response.text}"
                print(error_msg)
                return _get_mock_response(error_msg)
            
            # Robust Parsing Logic
            raw_data = response.json()
            print(f"DEBUG: Raw LLM Response: {raw_data}") # CRITICAL LOG FOR DEBUGGING

            # Case 1: Nested JSON (e.g. {"text": "..."})
            if isinstance(raw_data, dict) and "text" in raw_data and isinstance(raw_data["text"], str):
                 try:
                     print("DEBUG: Detected nested JSON in 'text' field")
                     cleaned_text = _clean_json_text(raw_data["text"])
                     return json.loads(cleaned_text)
                 except Exception as e:
                     print(f"DEBUG: Failed to parse nested JSON: {e}")
                     # Fallback: maybe the text IS the summary?
                     return _get_mock_response(f"Parse Error on nested JSON: {e}")

            # Case 2: It's already a dict, return it (but assume keys might be messy)
            if isinstance(raw_data, dict):
                 return raw_data
                 
            # Case 3: List? 
            return raw_data
            
    except Exception as e:
        print(f"Error calling HF Service: {e}")
        return _get_mock_response(f"Connection Error: {str(e)}")

def _clean_json_text(text: str) -> str:
    """Removes markdown code blocks and whitespace."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def _get_mock_response(error_detail: str = "Service unavailable"):
    return {
        "summary": "Analysis failed.",
        "score": 0, 
        "security_score": 0,
        "performance_score": 0,
        "reliability_score": 0,
        "merge_confidence": 0,
        "issues": [
            {
                "type": "system",
                "severity": "high",
                "location": "System",
                "description": f"Error: {error_detail}",
                "suggestion": "Check HF_LLM_URL and Space Logs."
            }
        ]
    }
