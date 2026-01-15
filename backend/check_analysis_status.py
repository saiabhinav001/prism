import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from app.models.analysis import Analysis
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession
import sys

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def check_analysis(id):
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(select(Analysis).where(Analysis.id == id))
        analysis = result.scalars().first()
        
        if analysis:
            print(f"Analysis {id}:")
            print(f"  Status: {analysis.status}")
            print(f"  Created: {analysis.created_at}")
            print(f"  Score: {analysis.security_score}")
        else:
            print(f"Analysis {id} not found.")

    await engine.dispose()

if __name__ == "__main__":
    id = 2
    if len(sys.argv) > 1:
        id = int(sys.argv[1])
    asyncio.run(check_analysis(id))
