
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def list_tables():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        rows = result.fetchall()
        print("Tables found:", [r[0] for r in rows])
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(list_tables())
