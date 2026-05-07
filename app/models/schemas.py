from pydantic import BaseModel, Field
from typing import List

# This defines what the user sends to the AI
class ChatRequest(BaseModel):
    message: str = Field(..., example="BGP session is flapping on core-router-01")

# This defines EXACTLY how the AI must answer
class ChatResponse(BaseModel):
    probable_causes: List[str] = Field(..., description="List of possible technical reasons for the issue")
    troubleshooting_steps: List[str] = Field(..., description="Step-by-step guide to fix it")
    explanation: str = Field(..., description="A technical summary of the networking concept")
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, or CRITICAL")

# This defines what the log analyzer expects
class LogRequest(BaseModel):
    log_data: str = Field(..., description="Raw syslog or error dump from a network device")

class LogResponse(BaseModel):
    summary: str
    root_cause: str
    suggested_fixes: List[str]
    severity: str