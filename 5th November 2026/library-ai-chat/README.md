# LibraAI — Library chat application

A React + Vite chat UI connected to a FastAPI backend and your OpenAI-compatible/OpenRouter model.

## 1. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and add your OpenRouter API key. Then run:

```bash
uvicorn main:app --reload --port 8000
```

API health check: http://localhost:8000/api/health
Interactive API docs: http://localhost:8000/docs

## 2. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Optional: create `frontend/.env` with `VITE_API_URL=http://localhost:8000`.

## Notes

- Browser chat history is persisted in localStorage. It is local to that browser/device and is not encrypted.
- Backend conversation/tool-call state is in memory. Restarting the backend clears active sessions; browser-visible transcripts remain.
- JSON file storage is suitable for a local prototype, not multi-worker or production use. Use SQLite/PostgreSQL and authenticated users for production.
- Do not expose `.env` or API keys in React/Vite. Keep all provider credentials on the backend.
- The included `books.json` is sample data. Replace it with your actual library catalog, preserving the fields `id`, `title`, `author`, `category`, and `available_copies`.
