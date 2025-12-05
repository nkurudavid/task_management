import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
import jwt
from jwt.exceptions import PyJWTError, ExpiredSignatureError
from .config import settings
from .database import get_db
from .models import User

# Password Functions using bcrypt directly
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    """Hash a password"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Authentication Dependency
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Get the current authenticated user from the JWT token in cookies"""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

# Admin Initialization
def init_admin_user(db: Session):
    """Create default admin user if not exists"""
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        from .models import UserRole
        admin = User(
            email="admin@example.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=UserRole.ADMIN
        )
        db.add(admin)
        db.commit()
        print("✓ Default admin user created (username: admin, password: admin123)")