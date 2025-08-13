from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Accountability
from datetime import date

router = APIRouter(
    prefix="/accountability",
    tags=["accountability"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def read_accountability(db: Session = Depends(get_db)):
    return db.query(Accountability).all()

@router.post("/")
def create_accountability(staff_name: str, duty: str, date_: date, db: Session = Depends(get_db)):
    accountability = Accountability(staff_name=staff_name, duty=duty, date=date_)
    db.add(accountability)
    db.commit()
    db.refresh(accountability)
    return accountability