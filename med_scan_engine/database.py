from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class Patient(Base):
    __tablename__ = 'patients'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    patient_code = Column(String(50), unique=True)
    last_scan_time = Column(DateTime, default=datetime.utcnow)
    
    prescriptions = relationship("Prescription", back_populates="patient")

class Prescription(Base):
    __tablename__ = 'prescriptions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey('patients.id'))
    image_path = Column(String(255))
    raw_text = Column(Text)
    structured_json = Column(Text)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="prescriptions")
    medications = relationship("Medication", back_populates="prescription")

class Medication(Base):
    __tablename__ = 'medications'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    prescription_id = Column(Integer, ForeignKey('prescriptions.id'))
    drug_name = Column(String(100))
    dosage = Column(String(50))
    frequency = Column(String(50))
    duration = Column(String(50))
    status = Column(String(20), default='active')  # active, completed, discontinued
    
    prescription = relationship("Prescription", back_populates="medications")
    intake_logs = relationship("IntakeLog", back_populates="medication")

class IntakeLog(Base):
    __tablename__ = 'intake_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    medication_id = Column(Integer, ForeignKey('medications.id'))
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20))  # taken, missed, skipped
    verification_method = Column(String(50))  # barcode, manual, qr
    
    medication = relationship("Medication", back_populates="intake_logs")

# Database connection
DATABASE_URL = "sqlite:///./medical_tracking.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for FastAPI to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
