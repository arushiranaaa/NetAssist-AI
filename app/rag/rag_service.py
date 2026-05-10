import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

class RAGService:
    def __init__(self):
        self.db_dir = "chroma_db"
        # This now uses 0MB of Render RAM because the math happens on Google's servers
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.vector_db = Chroma(persist_directory=self.db_dir, embedding_function=self.embeddings)

    def index_document(self, file_path: str):
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=50)
            splits = text_splitter.split_documents(docs)
            self.vector_db.add_documents(documents=splits)
            return True
        except Exception as e:
            print(f"Indexing Error: {e}")
            return False

    def query_docs(self, query: str):
        try:
            results = self.vector_db.similarity_search(query, k=2)
            return "\n".join([doc.page_content for doc in results])
        except Exception as e:
            return ""