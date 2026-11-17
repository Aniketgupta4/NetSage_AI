import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.auth.security import get_current_user
from backend.db.database import get_db
from backend.db.entities import User, ReviewRecord, DiagnosisRecord

router = APIRouter()
class ReviewInput(BaseModel):
    case_id: str = 'CUSTOM'
    diagnosis_id: str
    decision: str
    reviewer_comment: str = ''
    corrected_diagnosis: str = ''

@router.get('')
def get_reviews(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(ReviewRecord).filter(ReviewRecord.user_id == user.id).order_by(ReviewRecord.created_at.desc()).all()
    return {'count':len(rows), 'reviews':[{'review_id':r.review_id,'diagnosis_id':r.diagnosis_id,'decision':r.decision,'reviewer_comment':r.reviewer_comment,'corrected_diagnosis':r.corrected_diagnosis,'created_at':r.created_at.isoformat()} for r in rows]}

@router.post('')
def create_review(review: ReviewInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if review.decision not in {'ACCEPTED','EDITED','REJECTED'}:
        raise HTTPException(status_code=422, detail='Decision must be ACCEPTED, EDITED or REJECTED')
    diagnosis = db.query(DiagnosisRecord).filter(DiagnosisRecord.diagnosis_id == review.diagnosis_id, DiagnosisRecord.user_id == user.id).first()
    if not diagnosis:
        raise HTTPException(status_code=404, detail='Diagnosis not found in your account')
    row = ReviewRecord(review_id=str(uuid.uuid4()), user_id=user.id, diagnosis_id=review.diagnosis_id, decision=review.decision, reviewer_comment=review.reviewer_comment, corrected_diagnosis=review.corrected_diagnosis)
    db.add(row); db.commit(); db.refresh(row)
    return {'review_id':row.review_id,'diagnosis_id':row.diagnosis_id,'decision':row.decision,'reviewer_comment':row.reviewer_comment,'corrected_diagnosis':row.corrected_diagnosis,'created_at':row.created_at.isoformat()}
