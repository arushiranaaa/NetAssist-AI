# NetAssist AI: Intelligent Network Diagnostic System

**NetAssist AI** is a specialized Retrieval-Augmented Generation (RAG) platform designed for Network Operations Centers (NOC). It allows network engineers to upload complex documentation or log files and perform high-speed, AI-driven troubleshooting using a terminal-inspired interface.

![Project Status](https://img.shields.io/badge/Status-Live-green)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20|%20React%20|%20LangChain-blue)

## 🚀 Key Features

* **RAG-Powered Troubleshooting:** Leverages Retrieval-Augmented Generation to provide context-aware answers based strictly on uploaded network documentation.
* **"Jet-Fast" Inference:** Integrated with **Groq LPU (Language Processing Units)** to deliver sub-second response times for critical network queries.
* **NOC-Inspired UI:** A high-performance React dashboard featuring a real-time system diagnostic sidebar and a command-line style chat interface.
* **Memory-Optimized Architecture:** Offloaded embedding computations to **Google Gemini Cloud** to maintain a lean production footprint (reducing memory overhead by 70%).
* **Vector Persistence:** Uses **ChromaDB** for efficient document indexing and similarity search.

## 🛠️ Tech Stack

### **Backend**
* **Framework:** FastAPI (Python)
* **Orchestration:** LangChain
* **LLM:** Llama 3 via Groq (Inference)
* **Embeddings:** Google Generative AI (Cloud-based)
* **Vector Store:** ChromaDB

### **Frontend**
* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS
* **Icons:** Lucide React

### **Deployment**
* **API Hosting:** Render (Web Service)
* **Frontend Hosting:** Vercel (Edge Network)

---

## 🏗️ System Architecture

1.  **Document Ingestion:** PDFs are parsed and split into semantic chunks.
2.  **Cloud Embedding:** Chunks are sent to Google’s Gemini API to generate high-dimensional vectors, avoiding local CPU/RAM bottlenecks.
3.  **Vector Storage:** Vectors are stored in a local ChromaDB instance.
4.  **Query Pipeline:** * User asks a troubleshooting question.
    * System retrieves the most relevant documentation chunks.
    * Groq Llama 3 processes the context and query to generate an actionable technical answer.

---

## 📈 Optimization Insights (The "Production" Story)

During deployment on resource-constrained environments (Render Free Tier), the system initially faced OOM (Out of Memory) kills due to the heavy weight of local Transformer models. 

**The Solution:** I refactored the embedding pipeline to use **Google Cloud Embeddings**. This transition moved the mathematical heavy lifting from the application server to the cloud, reducing the deployment image size and RAM usage from **~800MB to ~150MB**, ensuring high availability and faster cold starts.

---

## 👤 Author

**Arushi Rana** *Final-year B.Tech in Computer Science & Engineering (Class of 2026)* *Focus: Backend Development, System Design, and FinTech Solutions.*

---

## 💻 Local Setup

### **1. Backend Setup**
```bash
cd netassist-backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
