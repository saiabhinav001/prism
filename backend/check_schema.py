
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Port 5433 as verified
DATABASE_URL = "postgresql+asyncpg://prism_user:prism_password@127.0.0.1:5433/prism_db"

async def check_schema():
    print(f"Connecting to {DATABASE_URL}...")
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.begin() as conn:
            # Check for table existence
            result = await conn.execute(text("SELECT to_regclass('public.repository');"))
            if result.scalar():
                print("Table 'repository' EXISTS.")
            else:
                print("Table 'repository' MISSING!")
                return
            
            # Check for column existence
            result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='repository' AND column_name='is_active';"))
            if result.scalar():
                print("Column 'is_active' EXISTS.")
            else:
                print("Column 'is_active' MISSING!")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_schema())
