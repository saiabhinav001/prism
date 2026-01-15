from fastapi import APIRouter
from app.api.endpoints import auth, webhooks, repos, prs, analysis

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(repos.router, prefix="/repos", tags=["repos"])
api_router.include_router(prs.router, prefix="/prs", tags=["prs"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
