import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from app.models.repository import Repository
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def patch_repo_data():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check specifically for 'ai' repo
        result = await session.execute(select(Repository).where(Repository.name == "ai"))
        repo = result.scalars().first()
        
        if repo:
            print(f"Before: FullName={repo.full_name}, URL={repo.html_url}")
            
            # FORCE UPDATE to correct values
            repo.full_name = "saiabhinav001/ai"
            repo.owner_login = "saiabhinav001"
            repo.html_url = "https://github.com/saiabhinav001/ai"
            repo.is_active = True
            
            session.add(repo)
            await session.commit()
            print(f"After: FullName={repo.full_name}, URL={repo.html_url}")
        else:
            print("Repo 'ai' NOT FOUND.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(patch_repo_data())
