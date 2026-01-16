from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
import httpx
from app.api import deps
from app.models.user import User
from app.models.repository import Repository
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

router = APIRouter()

class Repo(BaseModel):
    name: str
    description: str | None = None
    language: str | None = None
    stars: int
    forks: int
    updated_at: str
    private: bool
    html_url: str
    is_active: bool = False

@router.get("/list", response_model=List[Repo])
async def list_repos(
    db: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Fetch repositories from GitHub for the current user.
    """
    if not current_user.github_token:
        # If user signed up with email, they might not have a token.
        # For now, return empty list or mock data? 
        # Better: Return empty list.
        return []

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/repos?sort=updated&per_page=100",
            headers={
                "Authorization": f"Bearer {current_user.github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        
        if response.status_code != 200:
             # Token might be expired or revoked
             # In a real app, we'd handle this more gracefully (clear token, ask re-auth)
             raise HTTPException(status_code=400, detail="Failed to fetch repositories from GitHub")

        repos_data = response.json()
        
        # Get active repos from DB to map state
        # We match by full_name or html_url. Ideally full_name aka "owner/repo"
        # Since we use current_user.github_id in toggle, let's verify matches.
        # In toggle: full_name=f"{current_user.github_id}/{repo_in.name}" 
        # -> Wait, repo_in.name from GitHub response is usually just "prism". "full_name" field in GitHub response is "owner/prism".
        # We should use the ACTUAL GitHub full_name if possible. 
        # Let's fix loop below to retrieve "full_name" from GitHub data.
        
        active_repos_result = await db.execute(select(Repository).where(Repository.is_active == True))
        active_repos = active_repos_result.scalars().all()
        # Create a set of active html_urls for easy lookup (assuming html_url is unique enough and consistent)
        active_urls = {r.html_url for r in active_repos}
        
        # Transform to our model
        repos = []
        for r in repos_data:
            repos.append(Repo(
                name=r["name"],
                description=r["description"],
                language=r["language"],
                stars=r["stargazers_count"],
                forks=r["forks_count"],
                updated_at=r["updated_at"], # ISO string
                private=r["private"],
                html_url=r["html_url"],
                is_active=r["html_url"] in active_urls
            ))
            
        return repos
            
@router.post("/toggle")
async def toggle_repo_status(
    repo_in: Repo,
    db: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Toggle a repository's active status.
    If activating, immediately sync PRs.
    """
    from app.models.pull_request import PullRequest
    
    # Check if repo exists
    result = await db.execute(select(Repository).where(Repository.name == repo_in.name)) 
    existing_repo = result.scalars().first()
    
    repo = None
    if existing_repo:
        existing_repo.is_active = not existing_repo.is_active
        db.add(existing_repo)
        await db.commit()
        await db.refresh(existing_repo)
        repo = existing_repo
    else:
        # Create new
        fname = f"{current_user.github_id or 'unknown'}/{repo_in.name}"
        # Try to find real full_name from repo_in if possible, otherwise use constructed
        # GitHub API usually gives full_name in list response, but our Repo model passed in might strictly be from the minimal interface.
        # We'll use the constructed one or what we passed.
        
        repo = Repository(
            name=repo_in.name,
            full_name=fname, 
            owner_login=current_user.email,
            html_url=repo_in.html_url,
            github_repo_id=abs(hash(fname)) % 2_000_000_000, 
            is_active=True
        )
        db.add(repo)
        await db.commit()
        await db.refresh(repo)

    # Trigger Sync if Active
    if repo.is_active and current_user.github_token:
        # Fetch PRs immediately
        try:
           with open("pr_debug.log", "a") as f:
               f.write(f"Syncing PRs for {repo.name}...\n")
           await sync_repo_prs(repo, current_user.github_token, db)
           with open("pr_debug.log", "a") as f:
               f.write(f"Sync finished for {repo.name}\n")
        except Exception as e:
            with open("pr_debug.log", "a") as f:
               f.write(f"Sync failed for {repo.name}: {e}\n")
            print(f"Sync failed for {repo.name}: {e}")
            # Don't fail the toggle, just log

    return {"status": "updated", "is_active": repo.is_active}


async def sync_repo_prs(repo: Repository, token: str, db: AsyncSession):
    """
    Fetch open PRs from GitHub and persist to DB.
    """
    from app.models.pull_request import PullRequest
    import re
    
    # Correct Logic: Always prefer html_url parsing if available, as our stored full_name 
    # might be constructed from numeric IDs (e.g. "12345/repo").
    target_name = repo.full_name
    
    # Try to extract "owner/repo" from html_url: https://github.com/owner/repo
    if repo.html_url:
        try:
            # Regex to capture owner/repo from github.com/owner/repo
            match = re.search(r"github\.com/([^/]+)/([^/]+)", repo.html_url)
            if match:
                target_name = f"{match.group(1)}/{match.group(2)}"
        except Exception:
            pass # Fallback to existing target_name
            
    url = f"https://api.github.com/repos/{target_name}/pulls?state=open&per_page=50"
    
    with open("pr_debug.log", "a") as f:
        f.write(f"Fetching fetching URL: {url}\n")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        
        with open("pr_debug.log", "a") as f:
            f.write(f"GitHub Response: {response.status_code}\n")
        
        if response.status_code == 200:
            prs_data = response.json()
            with open("pr_debug.log", "a") as f:
                f.write(f"Found {len(prs_data)} PRs\n")
            
            # Upsert Logic
            from dateutil import parser
            
            for pr_data in prs_data:
                # Check exist
                stmt = select(PullRequest).where(
                    PullRequest.repo_id == repo.id,
                    PullRequest.github_pr_number == pr_data["number"]
                )
                res = await db.execute(stmt)
                existing_pr = res.scalars().first()
                
                # Parse GitHub timestamps
                updated_at_dt = parser.parse(pr_data["updated_at"])
                
                if existing_pr:
                    existing_pr.title = pr_data["title"]
                    existing_pr.state = pr_data["state"]
                    existing_pr.body = pr_data.get("body")
                    existing_pr.author_avatar_url = pr_data["user"].get("avatar_url")
                    existing_pr.updated_at = updated_at_dt # SYNC TIME
                    db.add(existing_pr)
                else:
                    new_pr = PullRequest(
                        repo_id=repo.id,
                        github_pr_number=pr_data["number"],
                        title=pr_data["title"],
                        state=pr_data["state"],
                        author_login=pr_data["user"]["login"],
                        author_avatar_url=pr_data["user"].get("avatar_url"),
                        html_url=pr_data["html_url"],
                        body=pr_data.get("body")
                    )
                    new_pr.updated_at = updated_at_dt # SYNC TIME
                    # created_at defaults to now(), which is fine for "when we discovered it"
                    # But if needed, we could fetch created_at from GitHub too.
                    db.add(new_pr)
            
            await db.commit()


@router.get("/pulls")
async def list_active_pulls(
    db: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Fetch OPEN Pull Requests for all ACTIVE repositories from DB.
    """
    print(f"DEBUG: Entering list_active_pulls for user {current_user.email}")
    from app.models.pull_request import PullRequest
    
    try:
        # 1. Get Active Repos IDs
        active_repos_stmt = select(Repository).where(Repository.is_active == True)
        active_repos_res = await db.execute(active_repos_stmt)
        active_repos = active_repos_res.scalars().all()
        active_repo_ids = [r.id for r in active_repos]
        
        print(f"DEBUG: Found {len(active_repos)} active repos")
        
        if not active_repo_ids:
            return []
            
        # 2. Get PRs from DB - Order by UPDATED_AT desc for liveliness
        stmt = select(PullRequest).where(PullRequest.repo_id.in_(active_repo_ids)).order_by(PullRequest.updated_at.desc())
        result = await db.execute(stmt)
        prs = result.scalars().all()
        
        print(f"DEBUG: Found {len(prs)} PRs in DB")
        
        # 3. Fetch latest analysis for these PRs to determine button state
        from app.models.analysis import Analysis
        pr_ids = [pr.id for pr in prs]
        latest_analyses_map = {}
        
        if pr_ids:
            # Fetch all analyses for these PRs, ordered by recent first
            # We filter in Python to get the latest per PR
            a_stmt = select(Analysis).where(Analysis.pr_id.in_(pr_ids)).order_by(Analysis.created_at.desc())
            a_res = await db.execute(a_stmt)
            all_analyses = a_res.scalars().all()
            
            for a in all_analyses:
                if a.pr_id not in latest_analyses_map:
                    latest_analyses_map[a.pr_id] = a
        
        # 4. Format Response (match previous JSON structure)
        # We need to inject repo_name for the frontend
        repo_map = {r.id: r.name for r in active_repos}
        
        response_data = []
        for pr in prs:
            pr_dict = pr.model_dump()
            pr_dict["internal_repo_id"] = pr.repo_id
            pr_dict["repo_name"] = repo_map.get(pr.repo_id, "Unknown")
            # Ensure number field matches
            pr_dict["number"] = pr.github_pr_number
            pr_dict["user"] = {
                "login": pr.author_login,
                "avatar_url": pr.author_avatar_url 
            } 
            # Use real updated_at from GitHub
            pr_dict["updated_at"] = pr.updated_at.isoformat() if pr.updated_at else pr.created_at.isoformat()
            
            # Smart Button Data
            latest_a = latest_analyses_map.get(pr.id)
            pr_dict["latest_analysis_id"] = latest_a.id if latest_a else None
            pr_dict["latest_analysis_status"] = latest_a.status if latest_a else None
            
            response_data.append(pr_dict)
            
        return response_data
    except Exception as e:
        print(f"ERROR in list_active_pulls: {e}")
        raise HTTPException(status_code=500, detail=str(e))

