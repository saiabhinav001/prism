import json
import httpx
from app.core.config import settings

# Timeout for the HF model inference (CPU can be slow)
TIMEOUT_SECONDS = 90

async def analyze_pr_content(pr_id: int, diff_content: str):
    """
    Sends the diff content to the hosted Hugging Face LLM Service.
    """
    print(f"Analyzing PR {pr_id} via Hugging Face Service...")
    
    if not settings.HF_LLM_URL or "YOUR_USERNAME" in settings.HF_LLM_URL:
        print("Warning: HF_LLM_URL not set or invalid. Using Mock Response.")
        return _get_mock_response()

    # Performance Safeguard: Trim whitespace and limit size
    # Sending massive diffs to a CPU model will timeout or crash it.
    MAX_DIFF_SIZE = 15000 
    truncated = False
    if len(diff_content) > MAX_DIFF_SIZE:
        diff_content = diff_content[:MAX_DIFF_SIZE]
        truncated = True

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.HF_LLM_URL}/review",
                json={"diff": diff_content, "truncated": truncated},
                timeout=TIMEOUT_SECONDS
            )
            
            if response.status_code != 200:
                print(f"HF Service Error: {response.text}")
                return _get_mock_response()
            
            return response.json()
            
    except Exception as e:
        print(f"Error calling HF Service: {e}")
        # Log to file for debugging
        with open("backend_ai_debug.log", "a") as log:
            log.write(f"HF Error: {str(e)}\n")
        return _get_mock_response()

def _get_mock_response():
    return {
        "summary": "Analysis service is currently unavailable or misconfigured (Mock Response).",
        "score": 0, 
        "security_score": 0,
        "performance_score": 0,
        "reliability_score": 0,
        "merge_confidence": 0,
        "issues": [
            {
                "type": "system",
                "severity": "medium",
                "location": "System",
                "description": "The AI analysis service is unreachable.",
                "suggestion": "Check HF_LLM_URL configuration and ensure the Space is running."
            }
        ]
    }
