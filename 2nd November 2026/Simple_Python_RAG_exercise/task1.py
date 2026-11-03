from pathlib import Path
import tiktoken


PROJECT_DIR = Path(__file__).resolve().parent
DOCUMENT_DIR = PROJECT_DIR / "Documents"
DB_PATH = PROJECT_DIR / "chroma_db"
COLLECTION_NAME = "rag_exercise1"

TOKENIZER = tiktoken.get_encoding("cl100k_base")


def read_documents():
    documents = []
    for path in DOCUMENT_DIR.iterdir():
        if path.is_file():
            documents.append(path.read_text(encoding="utf-8"))
    return documents

def tokenize_document():
    documents = read_documents()
    if len(documents) == 0:
        raise ValueError("No documents found")

    token_ids = []
    for text in documents:
        tokens = TOKENIZER.encode(text)
        token_ids.append(tokens)
    return token_ids

if __name__ == "__main__":
    documents = read_documents()
    print("Total characters in each document:")
    for doc_path, document in zip(DOCUMENT_DIR.iterdir(), documents):
        print(f"{doc_path.relative_to(PROJECT_DIR)}: {len(document)}")

    token_ids = tokenize_document()
    print("\nTotal Token count in each document:")
    for doc_path, token_id in zip(DOCUMENT_DIR.iterdir(), token_ids):
        print(f"{doc_path.relative_to(PROJECT_DIR)}: {len(token_id)}")