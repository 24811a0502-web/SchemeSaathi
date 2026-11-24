from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

from app.config import settings
from app.routers import (
    schemes, eligibility, family, agent, scam,
    documents, simplifier, journey, reports,
    conflicts, monitor, admin, profiles, auth_router
)

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="SchemeSaathi API",
    description="Government Scheme Assistant – Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["Auth"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
app.include_router(family.router, prefix="/api/family", tags=["Family"])
app.include_router(schemes.router, prefix="/api/schemes", tags=["Schemes"])
app.include_router(eligibility.router, prefix="/api/eligibility", tags=["Eligibility"])
app.include_router(agent.router, prefix="/api/agent", tags=["AI Agent"])
app.include_router(scam.router, prefix="/api/scam", tags=["Scam Shield"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(simplifier.router, prefix="/api/simplifier", tags=["PDF Simplifier"])
app.include_router(journey.router, prefix="/api/journey", tags=["Journey Tracker"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(conflicts.router, prefix="/api/conflicts", tags=["Conflicts"])
app.include_router(monitor.router, prefix="/api/monitor", tags=["Monitor"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "SchemeSaathi API – visit /api/docs for documentation"}

