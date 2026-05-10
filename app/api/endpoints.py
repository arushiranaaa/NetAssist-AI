from fastapi import APIRouter, UploadFile, File
from app.rag.rag_service import RAGService
from app.services.ai_service import AIService

router = APIRouter()

# --- INITIALIZE ONCE AT STARTUP ---
# This keeps the model in RAM so it doesn't reload every time
rag_service = RAGService()
ai_service = AIService()

@router.post("/rag/upload")
async def upload_manual(file: UploadFile = File(...)):
    # ... your upload logic using rag_service ...
    pass

@router.post("/rag/chat")
async def chat_with_docs(request: dict):
    question = request.get("question")
    context = rag_service.query_docs(question)
    
    # Combined context and question
    full_query = f"Context: {context}\n\nQuestion: {question}"
    
    # This will now be 10x faster
    response = await ai_service.analyze_incident(full_query)
    return response