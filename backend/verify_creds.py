
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

CREDS = [
    ("prism_user", "prism_password", "prism_db"),
    ("postgres", "postgres", "postgres"),
    ("postgres", "password", "postgres"),
    ("postgres", "admin", "postgres"),
    ("postgres", "root", "postgres"),
    ("postgres", "", "postgres"), # Try empty
]

HOSTS = ["127.0.0.1", "localhost"]

async def check_creds():
    for host in HOSTS:
        for user, password, db in CREDS:
            url = f"postgresql+asyncpg://{user}:{password}@{host}:5433/{db}"
            print(f"Testing {url} ...")
            try:
                engine = create_async_engine(url)
                async with engine.begin() as conn:
                    result = await conn.execute(text("SELECT 1"))
                    print(f"SUCCESS! Connected with: {user}@{host}/{db}")
                    return (user, password, host, db)
            except Exception as e:
                print(f"Failed ({user}@{host}): {e}")
                pass
    print("ALL ATTEMPTS FAILED.")
    return None

if __name__ == "__main__":
    asyncio.run(check_creds())
