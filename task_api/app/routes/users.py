from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserUpdate, UserResponse, PasswordChange, DashboardStats
from ..utils import get_password_hash, verify_password, get_current_user



router = APIRouter(prefix="/api", tags=["users"])




@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Get dashboard statistics based on user role"""
    from ..models import Task, TaskStatus
    
    if current_user.role == UserRole.LECTURER:
        tasks = db.query(Task).filter(Task.creator_id == current_user.id).all()
        total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    elif current_user.role == UserRole.STUDENT:
        tasks = db.query(Task).filter(Task.assignee_id == current_user.id).all()
        total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    else:  # admin
        tasks = db.query(Task).all()
        total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    
    return DashboardStats(
        total_tasks=len(tasks),
        pending_tasks=len([t for t in tasks if t.status == TaskStatus.PENDING]),
        in_progress_tasks=len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS]),
        completed_tasks=len([t for t in tasks if t.status == TaskStatus.COMPLETED]),
        total_students=total_students
    )






@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    if user_update.email:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_update.email
    
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    db.commit()
    db.refresh(current_user)
    return current_user






@router.post("/profile/change-password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password"""
    if not verify_password(password_change.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.hashed_password = get_password_hash(password_change.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}






@router.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin and lecturer only)"""
    # Authorization check
    if current_user.role not in [UserRole.ADMIN, UserRole.LECTURER]:
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    # Check if email already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=get_password_hash(user.password),
        full_name=user.full_name,
        role=user.role
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user





@router.get("/users", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users (filtered by role)"""
    if current_user.role == UserRole.STUDENT:
        # Students can only see other students
        return db.query(User).filter(User.role == UserRole.STUDENT).all()
    
    # Admin and lecturers can see all users
    return db.query(User).all()

@router.get("/students", response_model=List[UserResponse])
async def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all students"""
    return db.query(User).filter(User.role == UserRole.STUDENT).all()