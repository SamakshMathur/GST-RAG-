import os
from dotenv import load_dotenv

load_dotenv()

# LLM Config (Smart Budget Enterprise)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_MODEL = "gpt-4o-mini"  # Primary: High Intelligence, Low Cost
EMBEDDING_PROVIDER = "openai"  # "openai" or "local"
EMBEDDING_MODEL = "text-embedding-3-large"  # SOTA Semantics
VECTOR_DIM = 3072  # For text-embedding-3-large

# Reranking & Optimization
RERANKING_MODEL = "ms-marco-TinyBERT-L-2-v2"  # Fast FlashRank model
CACHE_DIR = ".diskcache"  # Persistent cache

# Vector DB Config
VECTOR_DB_PATH = "vectordb/index.faiss"
CHUNKS_PATH = "data/chunks/chunks.jsonl"

# Ingestion Config
DATA_DIR = "RAG_INFORMATION_DATABASE"

# S3 Config for AWS Deployment
S3_BUCKET_NAME = "gst-rag-documents"
LOCAL_DATA_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
