from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Expense, Accountability
from .routers import expense, accountability

app = FastAPI()

# Allow frontend to communicate with backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(expense.router)
app.include_router(accountability.router)

@app.get("/")
def read_root():
    return {"message": "Clinic backend is running!"}