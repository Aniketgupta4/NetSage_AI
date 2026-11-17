# NetSage AI

NetSage AI is a network-troubleshooting assistant. It accepts an incident symptom, topology notes and Cisco command output; runs deterministic IP/VLAN/routing/interface checks; optionally asks Google Gemini to synthesize the evidence; and stores a diagnosis for human review.

> Safety boundary: this is an advisory prototype. It does not connect to, configure, or modify live network devices. Verify every recommendation before making changes.

## Requirements
- Python 3.10+
- Node.js 18+
- Optional Google Gemini API key

## 1. Backend setup
From the project root:

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows cmd: .venv\Scripts\activate.bat
# macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Add `GEMINI_API_KEY` to `.env` to enable Gemini. If it is blank, the app runs in rules-only mode and still returns diagnostic findings where rules match.

Start backend from the project root:

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## 2. Frontend setup
Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173).

Optional frontend API override: create `frontend/.env` with `VITE_API_BASE=http://127.0.0.1:8000`.

## 3. Quick test
1. Open the Assistant page.
2. Enter symptom: `VLAN 20 users cannot reach gateway`.
3. Enter topology: `PC -> SW-ACCESS -> SW-CORE`.
4. Paste command output:

```text
Port       Mode   Status
Gi0/1      on     trunking
Vlans allowed on trunk
10,30,40
```

5. Run diagnosis. The rule engine should identify that VLAN 20 is absent from the supplied allowed-VLAN list. If Gemini is not configured, the diagnosis is generated from deterministic findings.
6. Submit an Accept/Edit/Reject review. Check the Reviews and Dashboard pages.

## API endpoints
- `GET /health`
- `GET /api/cases`
- `GET /api/cases/{case_id}`
- `POST /api/diagnosis`
- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/dashboard`

## Data
- `data/cases.csv`: normalized sample incident library
- `data/diagnoses.json`: generated diagnosis history
- `data/reviews.json`: human review history
- `data/responsible_ai_log.json`: edited/rejected review audit records

JSON files are appropriate for a local prototype, not concurrent production use. Use a database, authentication, authorization, structured audit logging and automated integration tests before deployment.

## 4. Backend tests
From the project root, after installing backend requirements:

```bash
python -m pytest -q
```

The included tests cover health/case/dashboard/review routes, the VLAN diagnosis and human-review flow, and the IP/interface/routing rule engine.
