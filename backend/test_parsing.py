import asyncio
import httpx
import re
from app.utils.github import get_real_repo_name
from pydantic import BaseModel

# Mock Repository
class MockRepo(BaseModel):
    name: str
    full_name: str
    html_url: str

async def test_logic():
    # 1. Test URL Parsing
    repo = MockRepo(
        name="ai",
        full_name="138765361/ai", # Bad name
        html_url="https://github.com/saiabhinav001/ai"
    )
    
    real_name = get_real_repo_name(repo)
    print(f"Parsed Real Name: {real_name}")
    
    # 2. Test GitHub Fetch (Diff)
    # We need a token. I'll read from .env if possible, or skip if token is needed.
    # The user has GITHUB_CLIENT_ID/SECRET in .env, but the TOKEN comes from the USER DB.
    # I can't easily get a valid user token without querying the DB.
    
    # Let's query the DB for the latest user token.
    from app.db.session import init_db, get_session
    from app.models.user import User
    from sqlmodel import select
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy.orm import sessionmaker
    
    # Setup DB connection
    # DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"
    # Using the one from .env discovery earlier
    
    from app.db.session import engine # Assuming this is configured
    
    # Manual DB fetch
    # Note: Import paths might be tricky if running as script from root.
    # I will rely on the printed Parsed Name first.
    
    pass

if __name__ == "__main__":
    asyncio.run(test_logic())
