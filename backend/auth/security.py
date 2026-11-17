from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from pwdlib import PasswordHash
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.config import settings
from backend.db.database import get_db
from backend.db.entities import User

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)

def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {'sub': str(user.id), 'role': user.role, 'iat': now, 'exp': now + timedelta(minutes=settings.JWT_ACCESS_MINUTES)}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired authentication token', headers={'WWW-Authenticate':'Bearer'})
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = int(payload.get('sub'))
    except (JWTError, TypeError, ValueError):
        raise error
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise error
    return user

def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return user
