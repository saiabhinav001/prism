from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Any
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from app.core.config import settings
from app.core import security
from app.db.session import get_session
from app.crud.user import user as user_crud
from app.models.user import UserCreate, UserRead, User, Token, UserSignup
from sqlmodel import SQLModel
from app.api import deps
import asyncio

router = APIRouter()

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user

@router.delete("/me", status_code=204)
async def delete_users_me(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """
    Delete own account and all associated data (Repositories, PRs, Analyses).
    """
    from app.models.repository import Repository
    from app.models.pull_request import PullRequest
    from app.models.analysis import Analysis
    from sqlmodel import select, delete

    # 1. Access user's email to find owned repositories
    # Note: repos.py sets owner_login=current_user.email
    user_email = current_user.email
    
    # 2. Find all repositories owned by this user
    # We need to manually cascade because SQLModel relationships/DB foreign keys might not be set to CASCADE
    stmt = select(Repository).where(Repository.owner_login == user_email)
    result = await db.execute(stmt)
    user_repos = result.scalars().all()
    
    for repo in user_repos:
        # 3. Find all PRs for this repo
        stmt_prs = select(PullRequest).where(PullRequest.repo_id == repo.id)
        result_prs = await db.execute(stmt_prs)
        repo_prs = result_prs.scalars().all()
        
        for pr in repo_prs:
            # 4. Delete Analyses for this PR
            await db.execute(delete(Analysis).where(Analysis.pr_id == pr.id))
            
        # 5. Delete PRs for this repo
        await db.execute(delete(PullRequest).where(PullRequest.repo_id == repo.id))
        
        # 6. Delete the Repo itself
        await db.delete(repo)
        
    # 7. Delete the User
    await db.delete(current_user)
    await db.commit()
    return

@router.get("/login/github")
async def login_github():
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&redirect_uri={settings.GITHUB_REDIRECT_URI}&scope=user:email,repo"
    }

@router.get("/login/github/callback")
async def login_github_callback(code: str, db: AsyncSession = Depends(get_session)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            json={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
        )
        print(f"DEBUG: GitHub OAuth Response {response.status_code}: {response.text}")
        if response.status_code != 200:
             # Print actual error from GitHub
            print(f"ERROR: GitHub Auth Failed: {response.text}")
            raise HTTPException(status_code=400, detail=f"Failed to authenticate with GitHub: {response.text}")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get access token")

        # Parallel Fetch: User Info and Emails
        # import asyncio (Moved to top)
        async def fetch_user():
             return await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {access_token}"})
        
        async def fetch_emails():
             return await client.get("https://api.github.com/user/emails", headers={"Authorization": f"Bearer {access_token}"})

        user_resp, email_resp = await asyncio.gather(fetch_user(), fetch_emails())

        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        github_user = user_resp.json()
        
        # Get User Email (Prioritize Primary from /user/emails)
        email = None
        if email_resp.status_code == 200:
            emails = email_resp.json()
            if isinstance(emails, list):
                primary_email_obj = next((e for e in emails if e.get("primary")), None)
                if primary_email_obj:
                    email = primary_email_obj["email"]
        
        # Fallback to public profile email if verified primary not accessible
        if not email:
            email = github_user.get("email")

        if not email:
             raise HTTPException(status_code=400, detail="No verified email found from GitHub")

    # Check or Create User
    user = await user_crud.get_by_email(db, email=email)
    if not user:
        user_in = UserCreate(
            email=email,
            github_id=str(github_user["id"]),
            full_name=github_user.get("name"),
            avatar_url=github_user.get("avatar_url"),
            github_token=access_token # Save token
        )
        user = await user_crud.create(db, user_in)
    else:
        # Update token if user exists (to keep it fresh)
        # We need a proper update method in CRUD, but for now specific update
        user.github_token = access_token
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create JWT
    access_token_jwt = security.create_access_token(subject=user.id)
    
    # Redirect to Frontend
    frontend_url = "http://localhost:3000/dashboard" # TODO: Config
    return RedirectResponse(f"{frontend_url}?token={access_token_jwt}")

@router.post("/signup", response_model=Token)
async def signup(user_in: UserSignup, db: AsyncSession = Depends(get_session)):
    user = await user_crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    user_db = UserCreate(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    user = await user_crud.create(db, user_db)
    access_token = security.create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login/access-token", response_model=Token)
async def login_access_token(db: AsyncSession = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_crud.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = security.timedelta(minutes=60 * 24 * 8)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
