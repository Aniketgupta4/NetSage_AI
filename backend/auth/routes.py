from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.entities import User
from backend.auth.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

class SignupInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginInput(BaseModel):
    email: EmailStr
    password: str

@router.post('/signup')
def signup(data: SignupInput, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail='An account with this email already exists')
    user = User(name=data.name.strip(), email=email, password_hash=hash_password(data.password), role='user')
    db.add(user); db.commit(); db.refresh(user)
    return {'message':'Account created successfully', 'user': {'id':user.id,'name':user.name,'email':user.email,'role':user.role}}

@router.post('/login')
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Incorrect email or password')
    if not user.is_active:
        raise HTTPException(status_code=403, detail='Account is disabled')
    return {'access_token':create_access_token(user), 'token_type':'bearer', 'user':{'id':user.id,'name':user.name,'email':user.email,'role':user.role}}

@router.get('/me')
def me(user: User = Depends(get_current_user)):
    return {'id':user.id,'name':user.name,'email':user.email,'role':user.role}
