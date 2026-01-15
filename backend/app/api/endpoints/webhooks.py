from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from app.services import github_service

router = APIRouter()

@router.post("/github/webhook")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    event_type = request.headers.get("X-GitHub-Event")

    if event_type == "pull_request":
        action = payload.get("action")
        if action in ["opened", "synchronize", "reopened"]:
            # Process PR asynchronously
            background_tasks.add_task(github_service.process_pull_request, payload)
    
    return {"status": "accepted"}
