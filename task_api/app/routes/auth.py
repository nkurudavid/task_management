from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..models import User
from ..schemas import UserResponse, PasswordChange
from ..utils import verify_password, get_password_hash, create_access_token, get_current_user
from ..config import settings


router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint - returns user info and sets JWT cookie"""
    
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is inactive")

    # Create JWT with expiration
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # Set secure HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",   # in prod use "none"
        secure=False      # in prod use True
    )

    return {
        "message": "Login successful",
        "user": UserResponse.from_orm(user)
    }


@router.post("/logout")
async def logout(response: Response):
    """Logout endpoint - removes JWT cookie"""
    response.delete_cookie("access_token")
    return {"message": "Logout successful"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
