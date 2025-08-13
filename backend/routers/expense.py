from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Expense
from datetime import date

router = APIRouter(
    prefix="/expenses",
    tags=["expenses"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def read_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).all()

@router.post("/")
def create_expense(description: str, amount: float, date_: date, db: Session = Depends(get_db)):
    expense = Expense(description=description, amount=amount, date=date_)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
