from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_service import AIService
from app.rag.rag_service import RAGService
from app.models.schemas import ChatRequest, ChatResponse
import os
import traceback

router = APIRouter()
ai_service = AIService()
rag_service = RAGService()

@router.post("/rag/upload")
async def upload_manual(file: UploadFile = File(...)):
    # 1. Create the folder if it doesn't exist
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        print("Created missing 'uploads' folder.")
        
    file_path = f"uploads/{file.filename}"
    
    try:
        # 2. Save the file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        print(f"File saved to: {file_path}")
        
        # 3. Index it (This is usually where the 500 happens!)
        rag_service.index_document(file_path)
        
        return {"message": f"Successfully indexed {file.filename}"}
    
    except Exception as e:
        # THIS LINE IS KEY: It prints the real error in your VS Code terminal
        print("\n!!! UPLOAD CRASHED !!!")
        print(traceback.format_exc()) 
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    context = rag_service.query_docs(request.message)
    return await ai_service.analyze_incident(f"Context: {context}\n\nQuestion: {request.message}")