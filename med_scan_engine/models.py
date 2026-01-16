from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DrugEntity(BaseModel):
    drug_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    confidence: float = 0.0

class PrescriptionAnalysisResponse(BaseModel):
    prescription_id: int
    raw_text: str
    drugs: List[DrugEntity]
    alerts: List[str]
    timestamp: datetime

class PatientCreate(BaseModel):
    name: str
    patient_code: str

class PatientResponse(BaseModel):
    id: int
    name: str
    patient_code: str
    last_scan_time: datetime
    
    class Config:
        from_attributes = True

class MedicationIntakeRequest(BaseModel):
    medication_id: int
    status: str  # taken, missed, skipped
    verification_method: str = "manual"

class IntakeLogResponse(BaseModel):
    id: int
    medication_id: int
    timestamp: datetime
    status: str
    verification_method: str
    
    class Config:
        from_attributes = True

class ComplianceStats(BaseModel):
    total_medications: int
    taken_count: int
    missed_count: int
    compliance_rate: float
