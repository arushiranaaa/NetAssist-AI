import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma

class RAGService:
    def __init__(self):
        self.db_dir = "chroma_db"
        # Using the same model for embeddings as your AI service
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
        
        # Initialize or load the existing database
        self.vector_db = Chroma(
            persist_directory=self.db_dir,
            embedding_function=self.embeddings
        )

    def index_document(self, file_path: str):
        """
        This is the missing function! It reads the PDF, 
        splits it into chunks, and saves it to the database.
        """
        try:
            print(f"--- Starting indexing for: {file_path} ---")
            
            # 1. Load the PDF
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            
            # 2. Split text into manageable chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, 
                chunk_overlap=100
            )
            splits = text_splitter.split_documents(docs)
            
            # 3. Add to Chroma DB
            self.vector_db.add_documents(documents=splits)
            
            print(f"--- Indexing complete. Added {len(splits)} chunks. ---")
            return True
            
        except Exception as e:
            print(f"Error during indexing: {e}")
            raise e

    def query_docs(self, query: str):
        """
        Searches the database for the most relevant parts of the manual.
        """
        try:
            results = self.vector_db.similarity_search(query, k=3)
            context = "\n".join([doc.page_content for doc in results])
            return context if context else "No relevant information found in manuals."
        except Exception as e:
            print(f"Search error: {e}")
            return "Error searching documentation."