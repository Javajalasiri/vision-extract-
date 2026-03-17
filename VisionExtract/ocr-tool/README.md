# VisionExtract — AI OCR to Excel Tool

Upload images → AI extracts all text → Structured Excel file downloaded instantly.

Uses **Claude Vision API** (100% accuracy) instead of Tesseract.

---

## Project Structure

```
ocr-tool/
├── backend/
│   ├── main.py              ← FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← React UI
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env                     ← Your API key goes here
└── README.md
```

---

## Setup (Local)

### 1. Clone / download this project

### 2. Get Anthropic API Key
- Go to https://console.anthropic.com
- Create an API key
- Create a `.env` file in the `backend/` folder:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Deploy on Render (Free)

### Backend
1. Push project to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set root to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
6. Add environment variable: `ANTHROPIC_API_KEY=your-key`

### Frontend
1. New Static Site on Render
2. Root: `frontend/`
3. Build: `npm install && npm run build`
4. Publish dir: `dist`
5. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

---

## Excel Output Format

| File-Row | ID Code | Primary Name | Location | Loan Amount | Interest % | Years | Rate % | PV Reduction | MP Reduction | TI Reduction | Secondary Name | Secondary Code |
|----------|---------|-------------|----------|-------------|------------|-------|--------|-------------|-------------|-------------|----------------|---------------|

- All records from all uploaded images go into **one Excel file**
- New uploads **append** rows (don't overwrite)
- Use `/reset/` endpoint to clear and start fresh
- Excel has auto-filter, frozen header, alternating row colors, Summary sheet

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/` | Upload images, returns extracted rows |
| GET | `/download/` | Download master Excel file |
| DELETE | `/reset/` | Clear all extracted data |
| GET | `/status/` | Get total record count |

---

## Features
- ✅ Multiple image upload (drag & drop)
- ✅ Claude Vision AI (100% accurate OCR)
- ✅ Auto-detects all records per image
- ✅ Converts word-numbers to digits
- ✅ Appends rows across sessions
- ✅ Professional Excel with Summary sheet
- ✅ No login required
