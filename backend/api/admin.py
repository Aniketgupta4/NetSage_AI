from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.auth.security import require_admin
from backend.db.database import get_db
from backend.db.entities import User
router = APIRouter()
@router.get('/users')
def list_users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(User).order_by(User.created_at.desc()).all()
    return {'count':len(rows),'users':[{'id':u.id,'name':u.name,'email':u.email,'role':u.role,'is_active':u.is_active,'created_at':u.created_at.isoformat()} for u in rows]}
