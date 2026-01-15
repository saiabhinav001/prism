from app.core.config import settings
from app.models.repository import Repository
from app.models.pull_request import PullRequest
from app.models.analysis import Analysis
from sqlmodel import select
import httpx
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

# Duplicate engine creation for now to avoid circular imports or pass it in
# Ideally, import `async_session` factory
from app.db.session import engine

async def process_pull_request(payload: dict):
    """
    Handles PR events.
    1. Extract PR details.
    2. Store Repo/PR in DB.
    3. Trigger Analysis.
    """
    pr_data = payload.get("pull_request")
    repo_data = payload.get("repository")
    
    if not pr_data or not repo_data:
        return

    print(f"Processing PR #{pr_data['number']} in {repo_data['full_name']}")
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # 1. Get or Create Repository
        statement = select(Repository).where(Repository.github_repo_id == repo_data["id"])
        result = await session.execute(statement)
        repo = result.scalars().first()
        
        if not repo:
            repo = Repository(
                github_repo_id=repo_data["id"],
                name=repo_data["name"],
                full_name=repo_data["full_name"],
                owner_login=repo_data["owner"]["login"],
                html_url=repo_data["html_url"],
            )
            session.add(repo)
            await session.commit()
            await session.refresh(repo)
            
        # 2. Get or Create PR
        statement = select(PullRequest).where(PullRequest.github_pr_number == pr_data["number"]).where(PullRequest.repo_id == repo.id)
        result = await session.execute(statement)
        pr = result.scalars().first()
        
        if not pr:
            pr = PullRequest(
                repo_id=repo.id,
                github_pr_number=pr_data["number"],
                title=pr_data["title"],
                state=pr_data["state"],
                author_login=pr_data["user"]["login"],
                html_url=pr_data["html_url"],
            )
            session.add(pr)
            await session.commit()
            await session.refresh(pr)
            
        # 3. Create Analysis
        analysis = Analysis(pr_id=pr.id, status="pending")
        session.add(analysis)
        await session.commit()
        await session.refresh(analysis)
        
        # 4. Trigger Analysis Logic
        from app.services import ai_service
        analysis_result = await ai_service.analyze_pr_content(pr.id, "diff_placeholder")
        
        # 5. Update Analysis Record
        if analysis_result:
            analysis.status = "completed"
            analysis.security_score = analysis_result.get("security_score", 0)
            analysis.performance_score = analysis_result.get("performance_score", 0)
            analysis.readability_score = analysis_result.get("readability_score", 0)
            analysis.merge_confidence_score = analysis_result.get("merge_confidence", 0)
            analysis.raw_llm_output = analysis_result
            
            session.add(analysis)
            await session.commit()
            await session.refresh(analysis)
        
        print(f"Completed Analysis ID: {analysis.id}")

