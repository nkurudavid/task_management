from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .models import UserRole, TaskStatus



# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    role: UserRole



class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None



class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True



# Password Schemas
class PasswordChange(BaseModel):
    current_password: str
    new_password: str



# Task Schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None



class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None



class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    creator_id: int
    assignee_id: Optional[int]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



# Dashboard Schema
class DashboardStats(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    total_students: Optional[int] = None



# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str