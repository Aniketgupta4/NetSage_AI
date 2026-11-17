from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.services.diagnosis_service import diagnose_network_issue
from backend.auth.security import get_current_user
from backend.db.database import get_db
from backend.db.entities import User, DiagnosisRecord

router = APIRouter()

class DiagnosisRequest(BaseModel):
    case_id: str = "CUSTOM"
    symptom: str
    topology: str = ""
    command_output: str = ""
    device: str = ""
    device_type: str = ""
    severity: str = "Medium"

@router.post("")
async def create_diagnosis(request: DiagnosisRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not request.symptom.strip():
        raise HTTPException(status_code=400, detail="Symptom is required.")
    result = await diagnose_network_issue(case_id=request.case_id, symptom=request.symptom, topology=request.topology, command_output=request.command_output, device=request.device, device_type=request.device_type, severity=request.severity)
    db.add(DiagnosisRecord(diagnosis_id=str(result.get('diagnosis_id')), user_id=user.id, case_id=request.case_id, symptom=request.symptom, topology=request.topology, command_output=request.command_output, root_cause=str(result.get('root_cause') or ''), confidence=float(result.get('confidence') or 0), result=result))
    db.commit()
    return result

@router.get('/history')
def diagnosis_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(DiagnosisRecord).filter(DiagnosisRecord.user_id == user.id).order_by(DiagnosisRecord.created_at.desc()).all()
    return {'count':len(rows), 'diagnoses':[{'diagnosis_id':r.diagnosis_id,'case_id':r.case_id,'symptom':r.symptom,'root_cause':r.root_cause,'confidence':r.confidence,'created_at':r.created_at.isoformat(),'result':r.result} for r in rows]}

@router.get('/history/{diagnosis_id}')
def get_diagnosis(diagnosis_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.query(DiagnosisRecord).filter(DiagnosisRecord.diagnosis_id == diagnosis_id, DiagnosisRecord.user_id == user.id).first()
    if not row: raise HTTPException(status_code=404, detail='Diagnosis not found')
    return row.result
