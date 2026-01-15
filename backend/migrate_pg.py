import os
from sqlalchemy import create_engine, text

# Get URL from env or hardcode for now based on what I saw
# Saw: postgresql+asyncpg://postgres:postgres@localhost:5432/prism_db
# Sync URL: postgresql://postgres:postgres@localhost:5432/prism_db

DATABASE_URL = "postgresql://prism_user:prism_password@127.0.0.1:5433/prism_db"

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE pullrequest ADD COLUMN author_avatar_url VARCHAR"))
            conn.commit()
            print("Successfully added column author_avatar_url")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
