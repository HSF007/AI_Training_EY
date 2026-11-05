import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable


ROOT = Path(__file__).resolve().parent
BOOKS_PATH = ROOT / "books.json"
RESERV_PATH = ROOT / "reservations.json"

STOP_WORDS = {
    "the", "a", "an", "i", "my", "me", "is", "are", "it", "from",
    "to", "and", "or", "on", "in", "at", "with", "for", "when",
    "can", "you", "help", "please", "not", "working", "how", "do",
    "get", "this", "have", "am", "be", "of", "does", "still",
}

def words(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower())) - STOP_WORDS

def search_books(search_book: str) -> dict:
    books = json.loads(BOOKS_PATH.read_text(encoding="utf-8"))
    books_terms = words(search_book)
    ranked = []

    for book in books:
        book_title = words(book["title"])
        book_author = words(book["author"])
        book_category = words(book["category"])

        score = (
            3 * len(books_terms & book_title)
            + 2 * len(books_terms & book_author)
            + len(books_terms & book_category)
        )
        if score > 0:
            ranked.append((score, book))
    
    ranked.sort(key=lambda pair: (-pair[0], pair[1]["id"]))
    results = []
    for score, book in ranked[:2]:
        results.append({
            "id":book["id"],
            "title":book["title"],
            "author":book["author"],
            "category":book["category"],
            "available_copies":book["available_copies"],
            "keyword_score":score,
        })
    
    return {
        "search_book":search_book,
        "results":results,
        "message": (
            "These are the top keyword matches. Give only this books in library."
            if results else "No matching article found. Do not invent troubleshooting steps."
        )
    }


def reserve_book(
    book_id: str,
    customer_name: str,
    confirm: Callable[[str], str] = input,
) -> dict:
    reserving_book = None

    if not book_id:
        return {"created": False, "reason": "Book Id is missing."}

    books = json.loads(BOOKS_PATH.read_text(encoding="utf-8"))
    
    BOOKS_PATH.write_text(
        json.dumps(books, indent=4),
        encoding="utf-8"
    )
    
    print("\n--- RESERVING BOOK ---")
    print("Reserving Book Id :", book_id)
    print("Customer Name :", customer_name)
    approval = confirm("Do you want to reserv this book? (y/n): ").strip().lower()

    if approval not in {"y", "yes"}:
        print("Book was not reserved.")
        return {"created": False, "reason": "User declined approval."}
    
    if reserving_book is None:
        return {
            "created": False,
            "reason": "Book not found."
        }
    
    for book in books:
        if str(book["id"]) == book_id and book["available_copies"] >= 1:
            book["available_copies"] -= 1
            reserving_book = book
            break
        elif str(book["id"]) == book_id and book["available_copies"] < 1:
            return {"created": False, "reason": "No available copies present for this book."}
    
    if RESERV_PATH.exists() and RESERV_PATH.read_text(encoding="utf-8").strip():
        reserved_books = json.loads(
            RESERV_PATH.read_text(encoding="utf-8")
        )
    else:
        reserved_books = []
    
    next_id = max(
        [int(reserved_book["id"].split("-")[-1]) for reserved_book in reserved_books] or [0]
    ) + 1
    ticket = {
        "id": f"RB-{next_id:04d}",
        "Book Id": book_id,
        "Customer Name": customer_name,
        "Title": reserving_book["title"],
        "Author": reserving_book["author"],
        "Category": reserving_book["category"],
        "Remaining Copies": reserving_book["available_copies"],
        "status": "Booked",
        "booked_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    reserved_books.append(ticket)
    RESERV_PATH.write_text(json.dumps(reserved_books, indent=2), encoding="utf-8")
    return {"created":True, "ticket":ticket}