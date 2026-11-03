
from pathlib import Path
import sys


import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction


from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma


# Import rag_core.py from our existing project
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

DOCUMENTS_PATH = PROJECT_ROOT / "Documents" 
DB_PATH = PROJECT_ROOT / "chroma_db"

def read_documents():
    """Load all text documents from the project's Documents folder."""

    documents = []

    for file_path in DOCUMENTS_PATH.glob("*.txt"):
        text = file_path.read_text(encoding="utf-8")

        documents.append({
            "filename": file_path,
            "text": text
        })

    print(f"Total documents loaded: {len(documents)}")

    return documents


def embed_texts(texts):
    """Convert multiple text chunks into numeric vectors."""

    model = DefaultEmbeddingFunction()

    vectors = model(texts)

    return [
        v.tolist() if hasattr(v, "tolist") else list(v)
        for v in vectors
    ]

def get_database():
    """Chroma's database files live inside ./chroma_db in this project."""
    return chromadb.PersistentClient(path=str(DB_PATH))


COLLECTION = "museum_langchain"


# Reuse our existing local embedding model
class LocalEmbeddings(Embeddings):

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return embed_texts(texts)

    def embed_query(self, text: str) -> list[float]:
        return embed_texts([text])[0]


# STEP 1: READ DOCUMENT
source = str(DOCUMENTS_PATH)

documents = []

for document in read_documents():
    documents.append(
        Document(
            page_content=document['text'],
            metadata={"source": str(document['filename'].relative_to(PROJECT_ROOT))}
        )
    )


print("Document loaded:", source)


# STEP 2: CHUNK DOCUMENT
splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="cl100k_base",
    chunk_size=150,
    chunk_overlap=20
)

chunks = splitter.split_documents(documents)

for i, chunk in enumerate(chunks, start=1):
    chunk.metadata["chunk_id"] = f"lc_chunk_{i:03d}"

print("Total chunks:", len(chunks))
print("First chunk:", chunks[0].page_content[:130])


# STEP 3: STORE IN CHROMADB
client = get_database()

# Use a separate collection to protect our original data
if COLLECTION in [item.name for item in client.list_collections()]:
    client.delete_collection(COLLECTION)

store = Chroma.from_documents(
    documents=chunks,
    embedding=LocalEmbeddings(),
    collection_name=COLLECTION,
    persist_directory=str(DB_PATH),
    collection_configuration={"hnsw": {"space": "cosine"}}
)

print("Stored chunks:", client.get_collection(COLLECTION).count())


# STEP 4: SEARCH AND RETRIEVE
while True:
    question = input("\nEnter your question (exit to stop): ").strip()

    if question.lower() == "exit":
        break

    if not question:
        continue

    results = store.similarity_search_with_score(question, k=2)

    for document, distance in results:
        print("\n" + "-" * 60)
        print("Chunk:", document.metadata["chunk_id"])
        print("Source:", document.metadata["source"])
        print("Cosine distance:", round(distance, 4))
        print("Text:", document.page_content)