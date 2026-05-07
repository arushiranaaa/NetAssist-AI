import json
import re
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from app.models.schemas import ChatResponse, LogResponse

class AIService:
    def __init__(self):
        self.model = OllamaLLM(model="llama3.2:3b")

    async def analyze_incident(self, message: str):
        system_prompt = f"""
        You are NetAssist AI, a Senior Network Engineering Assistant.
        Provide accurate technical support based ONLY on the provided manual context.

        RULES:
        1. If the answer is in the "Context", provide details.
        2. If NOT in the "Context", say you don't know.
        3. Always include 'probable_causes' and 'troubleshooting_steps' as lists.
        4. If it's a general question or info is missing, leave the lists empty [].

        OUTPUT FORMAT (Return ONLY JSON):
        {{
            "explanation": "text answer",
            "severity": "LOW" | "MEDIUM" | "HIGH",
            "probable_causes": ["cause 1", "cause 2"],
            "troubleshooting_steps": ["step 1", "step 2"]
        }}

        CONTEXT AND REQUEST:
        {message}
        """

        try:
            response_text = self.model.invoke(system_prompt)
            
            # Extract JSON part
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            data = json.loads(response_text[start:end])
            
            # Ensure all required fields exist to satisfy the validator
            return {
                "explanation": data.get("explanation", response_text),
                "severity": data.get("severity", "LOW"),
                "probable_causes": data.get("probable_causes", []),
                "troubleshooting_steps": data.get("troubleshooting_steps", [])
            }

        except Exception as e:
            print(f"AI Service Error: {e}")
            return {
                "explanation": "Error processing request.",
                "severity": "CRITICAL",
                "probable_causes": [],
                "troubleshooting_steps": []
            }