from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Force Reload
from app.core.config import settings
from contextlib import asynccontextmanager
from app.db.session import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    await init_db()
    yield
    # Shutdown: Clean resources if needed

app = FastAPI(
    title="PRISM API",
    description="AI-Powered Code Intelligence Platform",
    version="0.1.0",
    lifespan=lifespan
)

# Strict CORS but flexible for local dev
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to PRISM API", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
