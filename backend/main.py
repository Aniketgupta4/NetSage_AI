from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.cases import router as cases_router
from backend.api.diagnosis import router as diagnosis_router
from backend.api.reviews import router as reviews_router
from backend.api.dashboard import router as dashboard_router
from backend.auth.routes import router as auth_router
from backend.api.admin import router as admin_router
from backend.db.database import Base, engine
from backend.db import entities  # register ORM tables
from backend.config import settings
from backend.auth.security import hash_password
from backend.db.database import SessionLocal
from backend.db.entities import User


app = FastAPI(
    title="NetSage AI",
    description="AI-assisted network troubleshooting system",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173","http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def initialize_database():
    # Creates tables for a fresh local install. Alembic is provided for later schema changes.
    Base.metadata.create_all(bind=engine)
    if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
        db = SessionLocal()
        try:
            existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first()
            if not existing:
                db.add(User(name="NetSage Admin", email=settings.ADMIN_EMAIL.lower(), password_hash=hash_password(settings.ADMIN_PASSWORD), role="admin"))
                db.commit()
        finally:
            db.close()

# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

app.include_router(
    cases_router,
    prefix="/api/cases",
    tags=["Cases"],
)

app.include_router(
    diagnosis_router,
    prefix="/api/diagnosis",
    tags=["Diagnosis"],
)

app.include_router(
    reviews_router,
    prefix="/api/reviews",
    tags=["Reviews"],
)

app.include_router(
    dashboard_router,
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "NetSage AI",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "netsage-ai-backend",
    }