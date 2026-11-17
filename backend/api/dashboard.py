from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.auth.security import get_current_user
from backend.db.database import get_db
from backend.db.entities import User, DiagnosisRecord, ReviewRecord
from backend.config import settings
import csv

router = APIRouter()

def load_cases():
    if not settings.CASES_FILE.exists(): return []
    with open(settings.CASES_FILE, 'r', encoding='utf-8-sig', newline='') as f: return list(csv.DictReader(f))

@router.get('')
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cases = load_cases()
    reviews = db.query(ReviewRecord).filter(ReviewRecord.user_id == user.id).all()
    diagnoses = db.query(DiagnosisRecord).filter(DiagnosisRecord.user_id == user.id).count()
    decisions = Counter(r.decision for r in reviews)
    concepts = Counter(c.get('concept') or 'Unknown' for c in cases)
    severity = Counter(c.get('severity') or 'Unknown' for c in cases)
    total = len(reviews)
    return {'total_cases':len(cases), 'total_diagnoses':diagnoses, 'review_count':total, 'ai_human_agreement_rate':round(decisions.get('ACCEPTED',0)/total*100,2) if total else 0, 'accepted':decisions.get('ACCEPTED',0), 'edited':decisions.get('EDITED',0), 'rejected':decisions.get('REJECTED',0), 'issue_types':dict(concepts), 'severity':dict(severity), 'responsible_ai_corrections':decisions.get('EDITED',0)+decisions.get('REJECTED',0)}
