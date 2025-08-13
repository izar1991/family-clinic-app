from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from .database import Base

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    amount = Column(Float)
    date = Column(Date)

class Accountability(Base):
    __tablename__ = "accountability"
    id = Column(Integer, primary_key=True, index=True)
    staff_name = Column(String, index=True)
    duty = Column(String)
    date = Column(Date)