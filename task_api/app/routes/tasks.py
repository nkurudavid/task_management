from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, UserRole, Task
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..utils import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["tasks"])



@router.post("", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task (lecturer only)"""
    if current_user.role != UserRole.LECTURER:
        raise HTTPException(
            status_code=403, 
            detail="Only lecturers can create tasks"
        )
    
    # Verify assignee exists if provided
    if task.assignee_id:
        assignee = db.query(User).filter(User.id == task.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")
        if assignee.role != UserRole.STUDENT:
            raise HTTPException(status_code=400, detail="Can only assign tasks to students")
    
    # Create task
    db_task = Task(**task.dict(), creator_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return db_task





@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks based on user role"""
    if current_user.role == UserRole.LECTURER:
        # Lecturers see tasks they created
        return db.query(Task).filter(Task.creator_id == current_user.id).all()
    elif current_user.role == UserRole.STUDENT:
        # Students see tasks assigned to them
        return db.query(Task).filter(Task.assignee_id == current_user.id).all()
    else:  # admin
        # Admins see all tasks
        return db.query(Task).all()





@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Authorization check
    if current_user.role == UserRole.STUDENT:
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this task")
    elif current_user.role == UserRole.LECTURER:
        if task.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this task")
    
    return task





@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task"""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Authorization check
    if current_user.role == UserRole.STUDENT:
        # Students can only update tasks assigned to them and only the status
        if db_task.assignee_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        # Only allow status updates for students
        if task_update.status:
            db_task.status = task_update.status
    elif current_user.role == UserRole.LECTURER:
        # Lecturers can only update tasks they created
        if db_task.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")
        # Update all provided fields
        for key, value in task_update.dict(exclude_unset=True).items():
            setattr(db_task, key, value)
    else:  # admin
        # Admins can update any task
        for key, value in task_update.dict(exclude_unset=True).items():
            setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    
    return db_task





@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task (lecturer only)"""
    if current_user.role != UserRole.LECTURER:
        raise HTTPException(
            status_code=403, 
            detail="Only lecturers can delete tasks"
        )
    
    db_task = db.query(Task).filter(
        Task.id == task_id, 
        Task.creator_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=404, 
            detail="Task not found or not authorized"
        )
    
    db.delete(db_task)
    db.commit()
    
    return {"message": "Task deleted successfully"}