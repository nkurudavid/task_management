from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, SessionLocal
from .models import Base
from .utils import init_admin_user
from .routes import auth_router, users_router, tasks_router



# Create database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    version=settings.APP_VERSION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize admin user on startup"""
    db = SessionLocal()
    try:
        init_admin_user(db)
    finally:
        db.close()


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Task Management API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host="localhost", 
        port=8000, 
        reload=True
    )