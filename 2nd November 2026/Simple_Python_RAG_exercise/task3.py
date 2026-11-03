import chromadb
from task2 import make_chunks, embed_text
from task1 import (
    COLLECTION_NAME, DB_PATH, DOCUMENT_DIR, PROJECT_DIR,
    read_documents,
)

def get_database():
    """Chroma's database files live inside ./chroma_db in this project."""
    return chromadb.PersistentClient(path=str(DB_PATH))

def search_chunks(question, top_k=3):
    """Embed the question, find nearby vectors, and return their source text."""
    db = get_database()
    try:
        collection = db.get_collection(COLLECTION_NAME, embedding_function=None)
    except Exception as exc:
        raise RuntimeError("No indexed collection. Run 05_store_in_chroma.py first.") from exc

    count = collection.count()
    if count == 0:
        raise RuntimeError("The collection is empty. Run 05_store_in_chroma.py first.")

    question_vector = embed_text([question])[0]
    results = collection.query(
        query_embeddings=[question_vector],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )
    matches = []
    for chunk_id, text, metadata, distance in zip(
        results["ids"][0],
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        matches.append({
            "id": chunk_id,
            "text": text,
            "source": metadata.get("source", "unknown"),
            "distance": distance,
        })
    return matches

if __name__ == "__main__":
    doc_chunks = make_chunks(chunk_size=120, overlap=20)
    print(f"1. Created {len(doc_chunks[0])} text chunks.")

    doc_vectors = []
    documents = read_documents()
    for chunks in doc_chunks:
        doc_vectors.append(embed_text(chunks))
        print(f"2. Created {len(doc_vectors[-1])} embeddings; each has {len(doc_vectors[-1][0])} values.")

    client = get_database()

    if COLLECTION_NAME in [collection.name for collection in client.list_collections()]:
        client.delete_collection(COLLECTION_NAME)

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=None,
        configuration={"hnsw": {"space": "cosine"}},
    )

    doc_chunks_ids = []
    for chunks in doc_chunks:
        doc_chunks_ids.append([f"chunk_{i:03d}" for i in range(1, len(chunks) + 1)])

    doc_sources = [str(i.relative_to(PROJECT_DIR)) for i in DOCUMENT_DIR.iterdir()]
    for ids, chunks, vectors, source in zip(doc_chunks_ids, doc_chunks, doc_vectors, doc_sources):
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=vectors,
            metadatas=[{"source": source, "chunk_number": i}
                   for i in range(1, len(chunks) + 1)],
        )


    while True:
        question = input("\nSearch question: ").strip()
        if question.lower() in {"exit", "quit"}:
            break
        if not question:
            continue
        try:
            matches = search_chunks(question, top_k=2)
        except RuntimeError as error:
            print(error)
            break

        print("\nTOP MATCHING CHUNKS (smaller cosine distance = closer):")
        for match in matches:
            print("\n" + "=" * 72)
            print(f"ID: {match['id']} | Distance: {match['distance']:.4f}")
            print("Source:", match["source"])
            print(match["text"])
