from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import json
import os

from database import init_db, get_db, Patient, Prescription, Medication, IntakeLog
from models import (
    PrescriptionAnalysisResponse, PatientCreate, PatientResponse, 
    MedicationIntakeRequest, IntakeLogResponse, ComplianceStats, DrugEntity
)
from processor import PrescriptionProcessor
from nlp_parser import MedicalNLPParser

# Initialize FastAPI app
app = FastAPI(
    title="Medical Prescription Analysis & Tracking API",
    description="Camera-based prescription digitization + medication compliance tracking",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Initialize processors
processor = PrescriptionProcessor()
nlp_parser = MedicalNLPParser()

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Medical Prescription Analysis & Tracking API",
        "version": "1.0.0"
    }

@app.post("/api/prescriptions/analyze", response_model=PrescriptionAnalysisResponse)
async def analyze_prescription(
    file: UploadFile = File(...),
    patient_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Analyze prescription image and extract medication information
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"rx_{timestamp}.jpg"
        image_path = os.path.join("uploads", image_filename)
        
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        
        # Process image with OCR
        raw_text, ocr_details = processor.process_prescription(image_bytes)
        
        # Parse medical entities
        parsed_data = nlp_parser.parse_prescription(raw_text)
        
        # Check for drug interactions
        drug_names = [drug['drug_name'] for drug in parsed_data['drugs']]
        interaction_warnings = nlp_parser.validate_drug_interactions(drug_names)
        
        all_alerts = parsed_data['alerts'] + interaction_warnings
        
        # Save to database
        prescription = Prescription(
            patient_id=patient_id,
            image_path=image_path,
            raw_text=raw_text,
            structured_json=json.dumps(parsed_data),
            timestamp=datetime.utcnow()
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        
        # Save medications
        for drug_data in parsed_data['drugs']:
            medication = Medication(
                prescription_id=prescription.id,
                drug_name=drug_data.get('drug_name'),
                dosage=drug_data.get('dosage'),
                frequency=drug_data.get('frequency'),
                duration=drug_data.get('duration'),
                status='active'
            )
            db.add(medication)
        
        db.commit()
        
        # Prepare response
        drug_entities = [
            DrugEntity(
                drug_name=drug.get('drug_name', ''),
                dosage=drug.get('dosage'),
                frequency=drug.get('frequency'),
                duration=drug.get('duration'),
                confidence=drug.get('confidence', 0.0)
            )
            for drug in parsed_data['drugs']
        ]
        
        return PrescriptionAnalysisResponse(
            prescription_id=prescription.id,
            raw_text=raw_text,
            drugs=drug_entities,
            alerts=all_alerts,
            timestamp=prescription.timestamp
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing prescription: {str(e)}")

@app.post("/api/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient record"""
    db_patient = Patient(
        name=patient.name,
        patient_code=patient.patient_code,
        last_scan_time=datetime.utcnow()
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get patient details by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/api/patients/code/{patient_code}", response_model=PatientResponse)
async def get_patient_by_code(patient_code: str, db: Session = Depends(get_db)):
    """Get patient details by patient code (QR/barcode scan)"""
    patient = db.query(Patient).filter(Patient.patient_code == patient_code).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.post("/api/intake/log", response_model=IntakeLogResponse)
async def log_medication_intake(
    intake: MedicationIntakeRequest,
    db: Session = Depends(get_db)
):
    """Log medication intake (taken/missed/skipped)"""
    # Verify medication exists
    medication = db.query(Medication).filter(Medication.id == intake.medication_id).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Create intake log
    log = IntakeLog(
        medication_id=intake.medication_id,
        status=intake.status,
        verification_method=intake.verification_method,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    return log

@app.get("/api/medications/{patient_id}/active")
async def get_active_medications(patient_id: int, db: Session = Depends(get_db)):
    """Get all active medications for a patient"""
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
    
    active_meds = []
    for prescription in prescriptions:
        for medication in prescription.medications:
            if medication.status == 'active':
                active_meds.append({
                    "id": medication.id,
                    "drug_name": medication.drug_name,
                    "dosage": medication.dosage,
                    "frequency": medication.frequency,
                    "duration": medication.duration,
                    "prescription_date": prescription.timestamp.isoformat()
                })
    
    return {"medications": active_meds}

@app.get("/api/compliance/{patient_id}", response_model=ComplianceStats)
async def get_compliance_stats(patient_id: int, db: Session = Depends(get_db)):
    """Get medication compliance statistics for a patient"""
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
    
    total_medications = 0
    taken_count = 0
    missed_count = 0
    
    for prescription in prescriptions:
        for medication in prescription.medications:
            if medication.status == 'active':
                total_medications += 1
                logs = db.query(IntakeLog).filter(IntakeLog.medication_id == medication.id).all()
                for log in logs:
                    if log.status == 'taken':
                        taken_count += 1
                    elif log.status == 'missed':
                        missed_count += 1
    
    compliance_rate = (taken_count / (taken_count + missed_count) * 100) if (taken_count + missed_count) > 0 else 0.0
    
    return ComplianceStats(
        total_medications=total_medications,
        taken_count=taken_count,
        missed_count=missed_count,
        compliance_rate=round(compliance_rate, 2)
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
