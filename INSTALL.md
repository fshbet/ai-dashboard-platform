# Installation Guide — AI Dashboard Platform

> **Unified App (Recommended):** The `app/` folder is a single Next.js service that combines frontend and backend — one port (3000), one `npm install`. Use this unless you need the separate `frontend/` + `backend/` services.

Three ways to run the platform:
- **Option 0 — Unified App** (simplest — one service)
- **Option A — Manual separate services** (frontend + backend + n8n)
- **Option B — Docker** (one command, all services)

---

## Option 0 — Unified App (Recommended)

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or higher |
| n8n | latest |
| Anthropic API key | from console.anthropic.com |

### Steps

**1. Create env file**

```bash
cd "E:\AI\Dava Viz Agents\Dashboard Builder\BE\app"
copy .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
DATABASE_PATH=./data/dashboards.db
UPLOAD_DIR=./uploads
N8N_WEBHOOK_URL=http://localhost:5678/webhook/dashboard-gen
OPENROUTER_API_KEY=sk-ant-...
```

**2. Install and start**

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000** — API routes are served at the same origin (`/api/...`).

**3. Start n8n** (separate terminal)

```bash
npx n8n
```

**4. Import workflow + add Anthropic credential** — follow Steps 5–7 from Option A below.

**5. Open http://localhost:3000** and upload your data.

---

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| npm | comes with Node.js | — |
| n8n | latest | https://n8n.io |
| Git | any | https://git-scm.com |
| Anthropic API key | — | https://console.anthropic.com |

Check your versions:
```bash
node -v
npm -v
```

---

## Option A — Manual Setup (Recommended)

### Step 1 — Clone / Open the Project

Open a terminal and navigate to the project folder:

```bash
cd "E:\AI\Dava Viz Agents\Dashboard Builder\BE"
```

---

### Step 2 — Create the Environment File

Copy the example env file:

```bash
# Windows Command Prompt
copy .env.example .env

# Windows PowerShell
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `.env` in any text editor and fill in these values:

```env
PORT=4000
NODE_ENV=development
DATABASE_PATH=./data/dashboards.db
UPLOAD_DIR=./uploads

# Paste your n8n webhook URL here after Step 4
N8N_WEBHOOK_URL=http://localhost:5678/webhook/dashboard-gen

# Your Anthropic API key from https://console.anthropic.com
OPENROUTER_API_KEY=sk-ant-...

NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=AI Dashboard Platform
```

> The variable is named `OPENROUTER_API_KEY` in the env file but the backend passes it to n8n.
> Your actual Anthropic key goes here — you'll also add it directly inside n8n in Step 4.

---

### Step 3 — Install and Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Backend running on http://localhost:4000
n8n webhook: http://localhost:5678/webhook/dashboard-gen
```

Leave this terminal running. Open a new terminal for the next step.

---

### Step 4 — Install and Start n8n

#### Option A1 — n8n via npm (simplest)

```bash
# Install n8n globally (one time only)
npm install -g n8n

# Start n8n
n8n start
```

n8n will open at: **http://localhost:5678**

#### Option A2 — n8n via npx (no install)

```bash
npx n8n
```

---

### Step 5 — Import the Workflow into n8n

1. Open **http://localhost:5678** in your browser
2. Create an account (first time only)
3. Click **"Add workflow"** or go to **Workflows**
4. Click the **⋮ menu** (top right) → **"Import from file"**
5. Select this file:
   ```
   E:\AI\Dava Viz Agents\Dashboard Builder\BE\n8n\workflows\dashboard-gen.json
   ```
6. The workflow opens with 18 nodes

---

### Step 6 — Add Your Anthropic Credential in n8n

1. In the workflow, click any of the **"Anthropic Model — Agent N"** nodes (grey sub-nodes below each Agent)
2. In the right panel, click **"Create new credential"**
3. Select **"Anthropic"**
4. Paste your Anthropic API key
5. Name it: `Anthropic API`
6. Click **Save**
7. Repeat for all 5 Anthropic Model nodes (or select the saved credential from the dropdown)

> **Shortcut:** After saving the first credential, click each remaining Anthropic Model node and select `Anthropic API` from the credential dropdown — no need to re-enter the key.

---

### Step 7 — Activate the Workflow and Copy the Webhook URL

1. Click the **"Webhook Trigger"** node (leftmost node)
2. In the right panel you will see the **Webhook URL**, e.g.:
   ```
   http://localhost:5678/webhook/dashboard-gen
   ```
3. Copy that URL
4. Toggle **"Active"** switch in the top-right corner of the n8n editor
5. Open your `.env` file and set:
   ```
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/dashboard-gen
   ```
6. Restart the backend:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

---

### Step 8 — Install and Start the Frontend

Open a new terminal:

```bash
cd "E:\AI\Dava Viz Agents\Dashboard Builder\BE\frontend"
npm install
npm run dev
```

You should see:
```
- Local: http://localhost:3000
```

---

### Step 9 — Open the App

Go to: **http://localhost:3000**

You will see the upload screen. To test:
1. Upload any CSV, XLSX, or JSON file
2. Select a business domain
3. Enter a business goal
4. Click **"Generate Dashboard"**
5. Wait 30–90 seconds while the 5 AI Agents run
6. The dashboard opens with 4 audience tabs

---

## Option B — Docker (All-in-One)

Runs backend + frontend + n8n in containers with a single command.

### Requirements
- Docker Desktop installed and running
- https://www.docker.com/products/docker-desktop

### Steps

**1. Create your `.env` file** (same as Step 2 above)

**2. Run Docker Compose**

```bash
cd "E:\AI\Dava Viz Agents\Dashboard Builder\BE"
docker-compose up --build
```

First build takes 3–5 minutes. Subsequent starts are instant.

**3. Import the n8n workflow** (same as Step 5 above)
- n8n runs at: **http://localhost:5678**
- Username: `admin`
- Password: `changeme`

**4. Add Anthropic credential** (same as Step 6 above)

**5. Activate workflow + copy webhook URL** (same as Step 7 above)
- The webhook URL inside Docker is:
  ```
  http://localhost:5678/webhook/dashboard-gen
  ```

**6. Open the app** at **http://localhost:3000**

### Stop Docker

```bash
docker-compose down
```

### Stop and delete all data

```bash
docker-compose down -v
```

---

## Service URLs at a Glance

| Service  | URL                           |
|----------|-------------------------------|
| Frontend | http://localhost:3000         |
| Backend  | http://localhost:4000         |
| n8n      | http://localhost:5678         |
| Health   | http://localhost:4000/health  |

---

## Folder Responsibilities

```
BE/
├── backend/     Node.js API — file upload, AI orchestration, SQLite
├── frontend/    Next.js app — upload form, dashboard renderer
├── n8n/         Workflow JSON — import into n8n
├── ai-prompts/  Reference prompts for each AI Agent node
├── schemas/     Dashboard JSON schema definition
└── .env         Your config (create from .env.example)
```

---

## Verify Everything is Working

### Backend health check:
```bash
curl http://localhost:4000/health
# Expected: {"status":"ok","uptime":...}
```

### Test the n8n webhook directly:
```bash
curl -X POST http://localhost:5678/webhook/dashboard-gen \
  -H "Content-Type: application/json" \
  -d "{\"dashboard_id\":\"test-001\",\"domain\":\"Retail\",\"business_goal\":\"Track sales\",\"dataset_description\":\"Sales data\",\"dataset_context\":\"{\\\"domain\\\":\\\"Retail\\\",\\\"columns\\\":[\\\"date\\\",\\\"revenue\\\",\\\"region\\\"],\\\"row_count\\\":500,\\\"sample_rows\\\":[{\\\"date\\\":\\\"2024-01-01\\\",\\\"revenue\\\":12000,\\\"region\\\":\\\"North\\\"}]}\",\"columns\":[\"date\",\"revenue\",\"region\"],\"row_count\":500,\"theme\":\"modern\"}"
```

Expected: a JSON response containing `dashboard_spec`.

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` in backend | Dependencies not installed | Run `npm install` inside `backend/` |
| `ECONNREFUSED localhost:5678` | n8n not running | Start n8n first |
| `Workflow not found` in n8n | Workflow not imported or not active | Import JSON + toggle Active |
| `Anthropic credential not set` | LLM node not configured | Click each Anthropic Model node, select credential |
| `Dashboard stuck on processing` | n8n webhook not reachable | Check `N8N_WEBHOOK_URL` in `.env`, restart backend |
| `Port 3000 already in use` | Another process on port 3000 | Kill it or change port in `frontend/package.json` |
| `Port 4000 already in use` | Another process on port 4000 | Change `PORT=4001` in `.env` |
| CSV parse error | File has BOM or non-UTF8 encoding | Save CSV as UTF-8 in Excel before uploading |

---

## Changing the AI Model

All 5 agents default to `claude-3-5-sonnet-20241022`.

To use a cheaper/faster model, open any **Anthropic Model — Agent N** node in n8n and change the model field:

| Model | Speed | Cost | Quality |
|-------|-------|------|---------|
| `claude-3-5-sonnet-20241022` | Medium | $$ | Best |
| `claude-3-haiku-20240307` | Fast | $ | Good |
| `claude-opus-4-5` | Slow | $$$$ | Highest |

To use **OpenAI** instead:
1. Delete the `Anthropic Model — Agent N` sub-nodes
2. Add `OpenAI Chat Model` sub-nodes (from the + menu)
3. Select model `gpt-4o` or `gpt-4o-mini`
4. Connect to each Agent node via the `ai_languageModel` pin

---

## Production Deployment

For production, set these in your `.env`:

```env
NODE_ENV=production
```

And run:

```bash
# Build backend
cd backend && npm run build && npm start

# Build frontend
cd frontend && npm run build && npm start
```

Or use the Docker Compose setup which handles production builds automatically.
