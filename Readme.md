# AI Dashboard Generation Platform

Enterprise-grade AI-powered BI platform. Transforms raw CSV / XLSX / JSON datasets into interactive, audience-segmented dashboards via a 5-node AI pipeline.

## Architecture

```
Upload -> Backend API -> n8n Workflow -> AI Nodes (x5) -> Dashboard JSON Spec -> Frontend Renderer
```

AI generates **specifications only**. Frontend renders all charts, filters, and interactions.

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 14, TailwindCSS, ECharts  |
| Backend    | Node.js, Express, TypeScript      |
| Workflow   | n8n                               |
| AI         | OpenRouter (Claude-3.5-Sonnet)    |
| Storage    | SQLite (better-sqlite3)           |
| File Parse | PapaParse (CSV), xlsx (Excel)     |

## Folder Structure

```
BE/
├── backend/
│   └── src/
│       ├── index.ts              Express server entry
│       ├── routes/               upload, dashboard, export
│       ├── services/             fileParser, n8nOrchestrator, validator
│       ├── models/               SQLite database + queries
│       ├── middleware/           Multer file upload
│       └── types/                TypeScript interfaces
├── frontend/
│   └── src/
│       ├── app/                  Upload page + Dashboard page
│       ├── components/           KPIGrid, ChartRenderer, AudienceTabs,
│       │                         GlobalFilters, Sidebar, ExportButton
│       ├── lib/                  API client, ECharts adapters, types
│       └── store/                Zustand state management
├── n8n/
│   └── workflows/
│       └── dashboard-gen.json   Import this into n8n
├── ai-prompts/                   Optimized prompts per AI node
├── schemas/
│   └── dashboard.schema.json    Full JSON Schema for dashboard spec
├── docker-compose.yml
└── .env.example
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- n8n (self-hosted or cloud)
- OpenRouter API key

### 2. Environment
```bash
cp .env.example .env
# Fill in OPENROUTER_API_KEY and N8N_WEBHOOK_URL
```

### 3. Backend
```bash
cd backend
npm install
npm run dev        # http://localhost:4000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### 5. n8n Workflow
- Import `n8n/workflows/dashboard-gen.json` into n8n
- Activate the workflow
- Copy the Webhook URL -> paste into .env as N8N_WEBHOOK_URL

### 6. Docker All-in-One
```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint                  | Description                   |
|--------|---------------------------|-------------------------------|
| POST   | /api/upload               | Upload CSV / XLSX / JSON      |
| POST   | /api/dashboard/generate   | Trigger AI pipeline           |
| GET    | /api/dashboard/:id        | Poll status + get spec        |
| GET    | /api/export/:id           | Download spec as JSON         |

## 5-Node AI Pipeline

```
Node 1  Input Understanding   ->  dimensions, measures, time fields, quality score
Node 2  Insight Generator     ->  KPIs, trends, comparisons, anomalies (no hallucinations)
Node 3  Visualization Planner ->  chart type mapping, filter suggestions
Node 4  Audience Mapper       ->  4 tabs with hard visual count limits
Node 5  Layout Engine         ->  12-column responsive grid positions
Validator (backend)           ->  dedup KPIs, remove invalid fields, compute QA score
```

## Audience Tabs

| Tab               | Focus                        | Max Charts |
|-------------------|------------------------------|------------|
| C-Suite           | Strategic KPIs, growth       | 6          |
| Top Management    | Summary, department overview | 8          |
| Middle Management | Trends, team comparisons     | 10         |
| End Users         | Operational, granular detail | 12         |

## Future Extensions (designed for)
- Power BI / Tableau spec export
- AI narrative generation
- Forecasting node
- SQL / DAX generation
- Role-based auth + multi-user workspaces
- RAG business glossary
