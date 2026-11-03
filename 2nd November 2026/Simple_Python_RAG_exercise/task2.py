
from task1 import *
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction


def make_chunks(chunk_size=120, overlap=20):

    if not (0 <= overlap < chunk_size):
        raise ValueError(
            f"Overlap must be between 0 and less than {chunk_size}"
        )

    token_ids = tokenize_document()
    doc_chunks = []

    for token_id in token_ids:

        chunks = []
        start = 0

        while start < len(token_id):

            end = min(start + chunk_size, len(token_id))

            chunk = TOKENIZER.decode(
                token_id[start:end]
            ).strip()

            if chunk:
                chunks.append(chunk)

            if end == len(token_id):
                break

            start = end - overlap

        doc_chunks.append(chunks)

    return doc_chunks


def embed_text(texts):

    model = DefaultEmbeddingFunction()

    vectors = model(texts)

    return [
        v.tolist() if hasattr(v, "tolist") else list(v)
        for v in vectors
    ]


if __name__ == "__main__":

    print("Chunk count for each document:")

    doc_chunks = make_chunks(chunk_size=120, overlap=20)

    for doc_path, chunks in zip(
        sorted(DOCUMENT_DIR.iterdir()),
        doc_chunks
    ):
        print(f"{doc_path.name}\t{len(chunks)}")

    text = "Full-time employees get 18 days of paid annual leave."

    vector = embed_text([text])

    print("Vector dimension:", len(vector[0]))
