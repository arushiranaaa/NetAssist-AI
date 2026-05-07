import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router

app = FastAPI(title="NetAssist AI")

# --- THE CORS FIX: This allows your React website to talk to your AI ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "NetAssist AI is online and connected"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        reload_dirs=["app"], 
        reload_excludes=["venv", "chroma_db", "uploads"]
    )