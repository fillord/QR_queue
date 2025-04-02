from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from pydantic import BaseModel
from datetime import datetime
import enum
import qrcode
import os
from apscheduler.schedulers.background import BackgroundScheduler

DATABASE_URL = "sqlite:///./test.db"  # Заменишь на PostgreSQL позже

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class StatusEnum(str, enum.Enum):
    waiting = "waiting"
    called = "called"
    skipped = "skipped"
    done = "done"

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class QueueEntry(Base):
    __tablename__ = "queue_entries"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    time_joined = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(StatusEnum), default=StatusEnum.waiting)

    doctor = relationship("Doctor")

class QueueEntryCreate(BaseModel):
    doctor_id: int

class QueueEntryOut(BaseModel):
    id: int
    doctor_id: int
    time_joined: datetime
    status: StatusEnum

    class Config:
        from_attributes = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.post("/queue/join", response_model=QueueEntryOut)
def join_queue(entry: QueueEntryCreate, db: Session = Depends(get_db)):
    new_entry = QueueEntry(doctor_id=entry.doctor_id)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@app.get("/queue/{doctor_id}", response_model=list[QueueEntryOut])
def get_queue(doctor_id: int, db: Session = Depends(get_db)):
    queue = db.query(QueueEntry).filter(QueueEntry.doctor_id == doctor_id).order_by(QueueEntry.time_joined).all()
    return queue

@app.post("/queue/{doctor_id}/next", response_model=QueueEntryOut)
def call_next(doctor_id: int, db: Session = Depends(get_db)):
    next_patient = db.query(QueueEntry).filter(
        QueueEntry.doctor_id == doctor_id,
        QueueEntry.status == StatusEnum.waiting
    ).order_by(QueueEntry.time_joined).first()

    if not next_patient:
        raise HTTPException(status_code=404, detail="Очередь пуста")

    next_patient.status = StatusEnum.called
    db.commit()
    db.refresh(next_patient)
    return next_patient

@app.patch("/queue/{doctor_id}/skip/{entry_id}")
def skip_patient(doctor_id: int, entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(
        QueueEntry.id == entry_id,
        QueueEntry.doctor_id == doctor_id,
        QueueEntry.status == StatusEnum.waiting
    ).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Пациент не найден или уже вызван/пропущен")

    entry.status = StatusEnum.skipped
    db.commit()
    return {"message": f"Пациент {entry_id} пропущен"}

@app.post("/queue/{doctor_id}/reset")
def reset_queue(doctor_id: int, db: Session = Depends(get_db)):
    db.query(QueueEntry).filter(QueueEntry.doctor_id == doctor_id).delete()
    db.commit()
    return {"message": "Очередь сброшена"}

@app.get("/generate_qr/{doctor_id}")
def generate_qr(doctor_id: int):
    url = f"http://localhost:8000/queue/{doctor_id}"
    img = qrcode.make(url)
    path = f"qr_doctor_{doctor_id}.png"
    img.save(path)
    return {"message": f"QR-код сохранён в {path}"}

def reset_all_queues():
    db = SessionLocal()
    db.query(QueueEntry).delete()
    db.commit()
    db.close()
    print("Очереди сброшены в 00:00")

scheduler = BackgroundScheduler()
scheduler.add_job(reset_all_queues, "cron", hour=0, minute=0)
scheduler.start()
