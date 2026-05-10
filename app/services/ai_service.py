import json
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

class AIService:
    def __init__(self):
        # Using 8b-instant for deployment to ensure < 2s response times
        self.model = ChatGroq(
            temperature=0, 
            model_name="llama-3.1-8b-instant",
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

    async def analyze_incident(self, message: str):
        system_prompt = f"""
        You are NetAssist AI, a Senior Network Engineering Assistant.
        Provide accurate technical support based ONLY on the provided manual context.

        STRICT RULES:
        1. If the answer is in the "Context", provide a concise explanation.
        2. If NOT in the "Context", say: "That specific detail is not mentioned in the manual."
        3. OUTPUT ONLY VALID JSON.
        
        FORMAT:
        {{
            "explanation": "text answer",
            "severity": "LOW" | "MEDIUM" | "HIGH",
            "probable_causes": ["cause 1"],
            "troubleshooting_steps": ["step 1"]
        }}

        CONTEXT:
        {message}
        """

        try:
            response = self.model.invoke(system_prompt)
            # Remove markdown code blocks if the LLM accidentally includes them
            clean_content = response.content.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_content)
        except Exception as e:
            print(f"Deployment Error: {e}")
            return {
                "explanation": "The AI service is currently resetting connection.",
                "severity": "HIGH",
                "probable_causes": ["Cloud API Latency"],
                "troubleshooting_steps": ["Check your Groq API Key quota", "Refresh the session"]
            }