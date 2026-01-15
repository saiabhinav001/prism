from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.db.session import get_session
from app.models.pull_request import PullRequest
from app.models.analysis import Analysis
from app.models.repository import Repository
from app.models.user import User
from app.api.deps import get_current_user
import httpx
from typing import Dict

router = APIRouter()

@router.get("/{pr_id}")
async def read_pr_detail(
    pr_id: int,
    db: AsyncSession = Depends(get_session)
):
    # Get PR
    pr = await db.get(PullRequest, pr_id)
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    # Get Latest Analysis
    statement = select(Analysis).where(Analysis.pr_id == pr_id).order_by(Analysis.created_at.desc())
    result = await db.execute(statement)
    analysis = result.scalars().first()
    
    return {
        "pr": pr,
        "analysis": analysis
    }

@router.get("/{repo_id}/{pr_number}/diff")
async def get_pr_diff(
    repo_id: int,
    pr_number: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Get Repo
    repo = await db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    if not current_user.github_token:
         raise HTTPException(status_code=400, detail="GitHub token missing")

    # 2. Fetch Diff from GitHub
    async with httpx.AsyncClient() as client:
        # We need the PR title too for display, so we might need to fetch PR details if not in DB?
        # A simple diff fetch is fast. We can get title from the Pull list page state ideally, 
        # but here we might want to fetch PR info from GitHub too if we want the title.
        # For now, let's just fetch the diff. The frontend can pass the title or we fetch it.
        # To be premium, let's fetch the PR details to get the title.
        
        from app.utils.github import get_real_repo_name
        real_full_name = get_real_repo_name(repo)
        
        headers = {
            "Authorization": f"Bearer {current_user.github_token}",
            "Accept": "application/vnd.github.v3+json" 
        }
        
        # Parallel fetch: Diff and PR Details
        pr_url = f"https://api.github.com/repos/{real_full_name}/pulls/{pr_number}"
        
        # We need 2 requests: one for metadata (JSON), one for Diff (application/vnd.github.v3.diff)
        
        pr_res = await client.get(pr_url, headers=headers)
        if pr_res.status_code != 200:
             raise HTTPException(status_code=pr_res.status_code, detail="PR not found on GitHub")
        
        pr_data = pr_res.json()
        
        diff_res = await client.get(pr_url, headers={**headers, "Accept": "application/vnd.github.v3.diff"})
        
        return {
            "diff": diff_res.text if diff_res.status_code == 200 else "Error loading diff",
            "title": pr_data.get("title", f"PR #{pr_number}"),
            "repo_name": repo.name,
            "pr_number": pr_number
        }
