import uvicorn
from fastapi import FastAPI

app = FastAPI()

# GET Method
@app.get("/")
def home():
    return {"message": "Hello from FastAPI"}

# Parameters from URL
@app.get("/hello/{name}")
def hello(name: str):
    return {"message": f"Hello {name}"}

