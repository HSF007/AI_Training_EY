import json
import re
import threading
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BOOKS_PATH = ROOT / "books.json"
RESERV_PATH = ROOT / "reservations.json"
_FILE_LOCK = threading.Lock()

STOP_WORDS = {
    "the", "a", "an", "i", "my", "me", "is", "are", "it", "from",
    "to", "and", "or", "on", "in", "at", "with", "for", "when",
    "can", "you", "help", "please", "not", "working", "how", "do",
    "get", "this", "have", "am", "be", "of", "does", "still",
}

def words(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower())) - STOP_WORDS

def read_json(path: Path, default):
    if not path.exists() or not path.read_text(encoding="utf-8").strip():
        return default
    return json.loads(path.read_text(encoding="utf-8"))

def atomic_write(path: Path, data):
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    temp.replace(path)

def search_books(search_book: str) -> dict:
    if not search_book.strip():
        return {"search_book": search_book, "results": [], "message": "Enter a title, author, or category."}
    books = read_json(BOOKS_PATH, [])
    terms = words(search_book)
    ranked = []
    for book in books:
        score = (
            3 * len(terms & words(book.get("title", ""))) +
            2 * len(terms & words(book.get("author", ""))) +
            len(terms & words(book.get("category", "")))
        )
        if score:
            ranked.append((score, book))
    ranked.sort(key=lambda item: (-item[0], str(item[1].get("id", ""))))
    results = [{
        "id": str(book["id"]), "title": book["title"],
        "author": book.get("author", "Unknown"),
        "category": book.get("category", "Uncategorized"),
        "available_copies": int(book.get("available_copies", 0))
    } for _, book in ranked[:5]]
    return {
        "search_book": search_book, "results": results,
        "message": "Top matching books in this library." if results else "No matching books were found in this library."
    }

def reserve_book(book_id: str, customer_name: str) -> dict:
    book_id = str(book_id).strip()
    customer_name = customer_name.strip()
    if not book_id:
        return {"created": False, "reason": "Book ID is required."}
    if not customer_name:
        return {"created": False, "reason": "Customer name is required."}

    with _FILE_LOCK:
        books = read_json(BOOKS_PATH, [])
        book = next((b for b in books if str(b.get("id")) == book_id), None)
        if book is None:
            return {"created": False, "reason": "Book not found."}
        if int(book.get("available_copies", 0)) < 1:
            return {"created": False, "reason": "No copies are currently available."}

        reservations = read_json(RESERV_PATH, [])
        next_id = max(
            [int(str(item.get("id", "RB-0000")).split("-")[-1])
             for item in reservations] or [0]
        ) + 1
        book["available_copies"] = int(book["available_copies"]) - 1
        ticket = {
            "id": f"RB-{next_id:04d}", "book_id": book_id,
            "customer_name": customer_name, "title": book["title"],
            "author": book.get("author", "Unknown"),
            "category": book.get("category", "Uncategorized"),
            "remaining_copies": book["available_copies"],
            "status": "Booked",
            "booked_at": datetime.now(timezone.utc).isoformat(timespec="seconds")
        }
        # Write both updated datasets while holding the process lock.
        atomic_write(BOOKS_PATH, books)
        reservations.append(ticket)
        atomic_write(RESERV_PATH, reservations)
        return {"created": True, "ticket": ticket}
