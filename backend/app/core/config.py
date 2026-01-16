from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PRISM API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_USER: str = "prism_user"
    POSTGRES_PASSWORD: str = "prism_password"
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "prism_db"
    DATABASE_URL: Optional[str] = None
    
    SECRET_KEY: str = "supersecretkey" # In prod, read from env
    
    # GitHub OAuth
    GITHUB_CLIENT_ID: str = "Client_ID_Placeholder"
    GITHUB_CLIENT_SECRET: str = "Client_Secret_Placeholder"
    GITHUB_REDIRECT_URI: str = "http://localhost:3000/auth/callback"
    
    # AI
    # AI
    # GEMINI_API_KEY removed
    HF_LLM_URL: str = "https://rockstar00-prism-llm-service.hf.space" # Updated with user's space


    def model_post_init(self, __context):
        if self.DATABASE_URL:
            # Fix for Render/Neon: Ensure we use the async driver
            if self.DATABASE_URL.startswith("postgres://"):
                self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
            elif self.DATABASE_URL.startswith("postgresql://"):
                 self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            
            # Fix for asyncpg: It doesn't like '?sslmode=require' in the URL
            if "?sslmode=" in self.DATABASE_URL:
                self.DATABASE_URL = self.DATABASE_URL.split("?")[0]
        else:
            self.DATABASE_URL = f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = "../.env"

settings = Settings()
