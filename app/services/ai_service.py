import json
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load variables from .env file
load_dotenv()

class AIService:
    def __init__(self):
        # We switch from Ollama to ChatGroq for cloud speed
        self.model = ChatGroq(
            temperature=0, 
            model_name="llama-3.3-70b-versatile",
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

    async def analyze_incident(self, message: str):
        system_prompt = f"""
        You are NetAssist AI, a Senior Network Engineering Assistant.
        Provide accurate technical support based ONLY on the provided manual context.

        STRICT RULES:
        1. If the answer is in the "Context", summarize it technically.
        2. If NOT in the "Context", say: "I'm sorry, but that specific detail is not mentioned in the manual."
        3. Do NOT use outside knowledge.
        
        OUTPUT FORMAT (Return ONLY JSON):
        {{
            "explanation": "text answer",
            "severity": "LOW" | "MEDIUM" | "HIGH",
            "probable_causes": ["cause 1"],
            "troubleshooting_steps": ["step 1"]
        }}

        CONTEXT AND REQUEST:
        {message}
        """

        try:
            response = self.model.invoke(system_prompt)
            # The content of the response is where the JSON lives
            data = json.loads(response.content)
            
            return {
                "explanation": data.get("explanation", "No explanation provided."),
                "severity": data.get("severity", "LOW"),
                "probable_causes": data.get("probable_causes", []),
                "troubleshooting_steps": data.get("troubleshooting_steps", [])
            }
        except Exception as e:
            print(f"Cloud AI Error: {e}")
            return {
                "explanation": "The cloud AI engine is currently unavailable.",
                "severity": "CRITICAL",
                "probable_causes": [],
                "troubleshooting_steps": []
            }