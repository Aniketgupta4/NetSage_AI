from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.database import Base

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default='user')
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class DiagnosisRecord(Base):
    __tablename__ = 'diagnoses'
    id: Mapped[int] = mapped_column(primary_key=True)
    diagnosis_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    case_id: Mapped[str] = mapped_column(String(100), default='CUSTOM')
    symptom: Mapped[str] = mapped_column(Text)
    topology: Mapped[str] = mapped_column(Text, default='')
    command_output: Mapped[str] = mapped_column(Text, default='')
    root_cause: Mapped[str] = mapped_column(Text, default='')
    confidence: Mapped[float] = mapped_column(Float, default=0)
    result: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ReviewRecord(Base):
    __tablename__ = 'reviews'
    id: Mapped[int] = mapped_column(primary_key=True)
    review_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    diagnosis_id: Mapped[str] = mapped_column(String(80), index=True)
    decision: Mapped[str] = mapped_column(String(20))
    reviewer_comment: Mapped[str] = mapped_column(Text, default='')
    corrected_diagnosis: Mapped[str] = mapped_column(Text, default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
