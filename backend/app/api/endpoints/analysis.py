from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from app.services.ai_service import analyze_pr_content
from app.api.deps import get_current_user
from app.models.user import User
from app.models.pull_request import PullRequest
from app.models.analysis import Analysis
from app.models.repository import Repository
from app.db.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from typing import Dict, Any, List
import httpx
from pydantic import BaseModel

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get aggregated statistics for the dashboard.
    """
    # 1. Resolve User Identity (Email + GitHub Login)
    github_login = None
    if current_user.github_token:
         try:
             async with httpx.AsyncClient() as client:
                 resp = await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {current_user.github_token}"})
                 if resp.status_code == 200:
                     github_login = resp.json().get("login")
         except:
             pass

    from sqlmodel import or_
    filters = [Repository.owner_login == current_user.email]
    if github_login:
        filters.append(Repository.owner_login == github_login)

    repo_filter = or_(*filters)

    # 2. Active Repos (Scoped to User)
    repo_result = await db.execute(select(func.count(Repository.id)).where(Repository.is_active == True, repo_filter))
    active_repos_count = repo_result.scalar_one()
    
    # 3. Total Analyses Count (Scoped to User via Repository)
    # Join Analysis -> PullRequest -> Repository
    analysis_result = await db.execute(
        select(func.count(Analysis.id))
        .join(PullRequest, Analysis.pr_id == PullRequest.id)
        .join(Repository, PullRequest.repo_id == Repository.id)
        .where(repo_filter)
    )
    total_analyses = analysis_result.scalar_one()
    
    # 4. Recent Analyses (Scoped to User)
    recent_query = (
        select(Analysis, PullRequest)
        .join(PullRequest, Analysis.pr_id == PullRequest.id)
        .join(Repository, PullRequest.repo_id == Repository.id)
        .where(repo_filter)
        .order_by(Analysis.created_at.desc())
        .limit(5)
    )
    recent_result = await db.execute(recent_query)
    recent_items = recent_result.all()

    recent_activity = []
    for analysis, pr in recent_items:
        recent_activity.append({
            "id": analysis.id,
            "pr_title": pr.title,
            "repo_id": pr.repo_id,
            "score": analysis.security_score or 0,
            "status": analysis.status,
            "created_at": analysis.created_at,
            "pr_number": pr.github_pr_number
        })

    return {
        "total_analyses": total_analyses,
        "avg_confidence": 85, # Mock/Placeholder until confidence logic is solid
        "vulnerabilities": 0, # Placeholder
        "active_repos": active_repos_count,
        "recent_activity": recent_activity
    }

@router.post("/trigger/{pr_id}")
async def analyze_pull_request(
    pr_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger an AI analysis for a specific PR.
    This runs in the background.
    """
    # Verify PR exists and fetch repo info eagerly if possible, or lazy load in task
    # To be safe/fast, we just verify existence here.
    pr = await db.get(PullRequest, pr_id)
    if not pr:
        raise HTTPException(status_code=404, detail="Pull Request not found")

    # Ensure user has a GitHub token
    if not current_user.github_token:
        raise HTTPException(status_code=400, detail="GitHub token missing. Please re-login.")

    # Create Initial Analysis Record
    analysis_record = Analysis(
        pr_id=pr_id,
        status="processing",
        created_at=func.now()
    )
    db.add(analysis_record)
    await db.commit()
    await db.refresh(analysis_record)

    # Pass the token explicitly to the background task
    background_tasks.add_task(perform_ai_analysis, analysis_record.id, pr_id, current_user.github_token)

    return analysis_record

async def perform_ai_analysis(analysis_id: int, pr_id: int, github_token: str):
    print(f"DEBUG: Starting Analysis Task for AnalysisID={analysis_id}, PR={pr_id}")
    async for db in get_session():
        try:
            # Re-fetch objects attached to this session
            analysis = await db.get(Analysis, analysis_id)
            pr = await db.get(PullRequest, pr_id)
            if not analysis or not pr:
                print(f"DEBUG: Analysis or PR not found in background task: {analysis_id}")
                return
            
            # Fetch Repo to get full name
            repo = await db.get(Repository, pr.repo_id)
            if not repo:
                 print(f"DEBUG: Repo not found for PR: {pr_id}")
                 return

            from app.utils.github import get_real_repo_name
            real_full_name = get_real_repo_name(repo)

            print(f"DEBUG: Fetching Diff for {real_full_name} PR #{pr.github_pr_number}")
            # Fetch Real Diff from GitHub
            diff_content = ""
            try:
                async with httpx.AsyncClient() as client:
                    # https://api.github.com/repos/OWNER/REPO/pulls/NUMBER
                    url = f"https://api.github.com/repos/{real_full_name}/pulls/{pr.github_pr_number}"
                    headers = {
                        "Authorization": f"Bearer {github_token}",
                        "Accept": "application/vnd.github.v3.diff"
                    }
                    response = await client.get(url, headers=headers)
                    if response.status_code == 200:
                        diff_content = response.text
                        print(f"DEBUG: Diff fetched successfully. Length: {len(diff_content)}")
                    else:
                        print(f"DEBUG: Failed to fetch diff: {response.status_code} {response.text}")
                        # Fallback content
                        diff_content = f"Could not fetch diff. PR Body: {pr.body or 'No Description'}"
            except Exception as e:
                print(f"DEBUG: Error fetching diff: {e}")
                diff_content = f"Error fetching diff. PR Body: {pr.body or 'No Description'}"

            context = f"PR Title: {pr.title}\nDescription: {pr.body}"
            
            # Limit diff size
            if len(diff_content) > 30000:
                diff_content = diff_content[:30000] + "\n...[Diff Truncated]"

            # Run AI
            print("DEBUG: Sending to AI Service...")
            # Combine context
            full_content = f"{context}\n\n{diff_content}"
            result = await analyze_pr_content(pr_id, full_content)
            print(f"DEBUG: AI Analysis Completed. Score: {result.get('score', 0)}")
            
            # Update Record
            analysis.status = "completed"
            analysis.raw_llm_output = result
            
            # Map specific scores (default to 0 if missing)
            analysis.security_score = result.get("security_score", 0)
            analysis.performance_score = result.get("performance_score", 0)
            analysis.reliability_score = result.get("reliability_score", 0)
            analysis.maintainability_score = result.get("maintainability_score", 0)
            analysis.merge_confidence_score = result.get("merge_confidence", 0)
            
            analysis.diff_snapshot = diff_content # Save the diff snapshot
            
            db.add(analysis)
            await db.commit()
            print("DEBUG: Database Updated with Results")
            
        except Exception as e:
            with open("backend_debug.log", "a") as f:
                 f.write(f"CRASH: {str(e)}\n")
            print(f"DEBUG: Background Task Crash: {e}")
            import traceback
            traceback.print_exc()
            try:
                if 'analysis' in locals() and analysis:
                    analysis.status = "failed"
                    analysis.raw_llm_output = {"error": str(e)}
                    # Optionally save diff even on failure if we have it
                    if 'diff_content' in locals():
                        analysis.diff_snapshot = diff_content
                    db.add(analysis)
                    await db.commit()
            except:
                pass
        finally:
            break

class AnalysisTriggerRequest(BaseModel):
    repo_id: int
    pr_number: int
    title: str = "Unknown PR"
    html_url: str = ""
    author: str = "unknown"

@router.post("/trigger-live")
async def trigger_live_analysis(
    req: AnalysisTriggerRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.github_token:
            print("DEBUG: Missing GitHub Token")
            raise HTTPException(status_code=400, detail="GitHub token missing")

        # 1. Find or Create PullRequest record
        print(f"DEBUG: Looking for PR: repo={req.repo_id}, number={req.pr_number}")
        result = await db.execute(select(PullRequest).where(PullRequest.repo_id == req.repo_id).where(PullRequest.github_pr_number == req.pr_number))
        pr = result.scalars().first()

        if not pr:
            # Check if repo exists
            repo = await db.get(Repository, req.repo_id)
            if not repo:
                 raise HTTPException(status_code=404, detail="Repository not found")
            
            pr = PullRequest(
                repo_id=req.repo_id,
                github_pr_number=req.pr_number,
                title=req.title,
                state="open",
                author_login=req.author,
                html_url=req.html_url
            )
            db.add(pr)
            await db.commit()
            await db.refresh(pr)
        
        # 2. Create Analysis Record
        analysis_record = Analysis(
            pr_id=pr.id,
            status="processing",
            created_at=func.now()
        )
        db.add(analysis_record)
        await db.commit()
        await db.refresh(analysis_record)

        # 3. Trigger Background Task
        background_tasks.add_task(perform_ai_analysis, analysis_record.id, pr.id, current_user.github_token)

        return {"analysis_id": analysis_record.id, "status": "processing"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"CRITICAL ERROR in trigger-live: {e}")
        raise HTTPException(status_code=500, detail=f"Trigger Failed: {str(e)}")

@router.get("/result/{analysis_id}")
async def get_analysis_result(
    analysis_id: int,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    analysis = await db.get(Analysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Eager load PR? 
    # For now just return analysis data.
    # We might want to return linked PR title etc.
    # Let's fetch PR manually for simplicity
    pr = await db.get(PullRequest, analysis.pr_id)
    
    response_data = {
        "id": analysis.id,
        "status": analysis.status,
        "score": analysis.security_score, # For backward compatibility
        "security_score": analysis.security_score,
        "performance_score": analysis.performance_score,
        "reliability_score": analysis.reliability_score,
        "maintainability_score": analysis.maintainability_score,
        "created_at": analysis.created_at,
        "pr_title": pr.title if pr else "Unknown",
        "diff_view": analysis.diff_snapshot or "No diff content available."
    }

    # Flatten raw output into response
    if isinstance(analysis.raw_llm_output, dict):
        response_data.update(analysis.raw_llm_output)
    elif analysis.raw_llm_output and getattr(analysis.raw_llm_output, "items", None):
        # Handle case where it might be an SQLAlchemy MutableDict or similar
        response_data.update(dict(analysis.raw_llm_output))

    # Ensure required frontend fields exist
    response_data.setdefault("issues", [])
    response_data.setdefault("summary", "Analysis completed but no summary provided.")
    response_data.setdefault("security_score", 0)
    response_data.setdefault("performance_score", 0)
    response_data.setdefault("reliability_score", 0)
    
    return response_data
