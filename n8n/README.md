# n8n AI Agent Workflow Setup

## Architecture

Each AI step uses a native **n8n AI Agent node** wired to an **Anthropic Chat Model sub-node**.
No external HTTP calls — everything runs through n8n's LangChain integration.

```
Webhook → Normalize → [Agent 1 + LLM] → Parse → [Agent 2 + LLM] → Parse
       → [Agent 3 + LLM] → Parse → [Agent 4 + LLM] → Parse
       → [Agent 5 + LLM] → Assemble → Respond
```

## Node Map

| Step | Agent Node                    | LLM Sub-node               | Purpose                    |
|------|-------------------------------|----------------------------|----------------------------|
| 1    | Agent 1 — Input Understanding | Anthropic Model — Agent 1  | Classify columns           |
| 2    | Agent 2 — Insight Generator   | Anthropic Model — Agent 2  | Generate KPIs + insights   |
| 3    | Agent 3 — Visualization Planner| Anthropic Model — Agent 3 | Map insights to charts     |
| 4    | Agent 4 — Audience Mapper     | Anthropic Model — Agent 4  | Assign to 4 audience tabs  |
| 5    | Agent 5 — Layout Engine       | Anthropic Model — Agent 5  | Generate 12-col grid layout|

Each Agent node uses `conversationalAgent` type with a tailored system message and dynamic user prompt built from accumulated pipeline state.

## Import Steps

1. Open your n8n instance: **http://localhost:5678**
2. **Workflows → Import from File**
3. Select `workflows/dashboard-gen.json`
4. **Do NOT activate yet** — configure credentials first

## Configure the Anthropic Credential

1. Go to **Credentials → Add Credential → Anthropic**
2. Enter your Anthropic API key
3. Name it exactly: `Anthropic API`
4. Save

Then open each of the 5 LLM sub-nodes (`Anthropic Model — Agent 1` through `Agent 5`) and select this credential in the **Credential** dropdown.

> **Tip:** You can also use **OpenAI** instead of Anthropic. Replace the 5 `lmChatAnthropic` sub-nodes with `lmChatOpenAi` nodes and select your OpenAI credential. Use model `gpt-4o` for best results.

## Activate the Workflow

1. Toggle **Active** in the top-right of the workflow editor
2. Copy the **Webhook URL** shown in the Webhook Trigger node
3. Paste it into your backend `.env` as `N8N_WEBHOOK_URL`

## How the Agent Nodes Work

Each Agent node:
- Receives accumulated JSON state from the previous Code (Parse) node via `$json`
- Builds a dynamic user prompt using n8n expressions (`{{ $json.field }}`)
- Calls Claude via the connected Anthropic Chat Model sub-node
- Returns its response as a string in `$json.output`

The subsequent **Parse Code node**:
- Reads `$input.first().json.output`
- Strips any accidental markdown fences
- Parses the JSON
- Merges it with accumulated state from the previous parse node

## Model Configuration

Default model: `claude-3-5-sonnet-20241022`

| Agent   | Temperature | Max Tokens | Reason                            |
|---------|-------------|------------|-----------------------------------|
| Agent 1 | 0.1         | 1200       | Deterministic column classification|
| Agent 2 | 0.2         | 3000       | Creative but grounded insights    |
| Agent 3 | 0.1         | 3500       | Strict chart-to-insight mapping   |
| Agent 4 | 0.1         | 2500       | Deterministic audience assignment |
| Agent 5 | 0.0         | 2500       | Fully deterministic layout        |

To use a cheaper model for lower-priority agents, change the `model` parameter in the LLM sub-nodes to `claude-3-haiku-20240307`.

## Switching to OpenAI

Replace each `Anthropic Model — Agent N` sub-node:
- Node type: `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- Model: `gpt-4o` (best) or `gpt-4o-mini` (cheaper)
- Credential type: OpenAI API

## Test the Webhook

```bash
curl -X POST http://localhost:5678/webhook/dashboard-gen \
  -H "Content-Type: application/json" \
  -d '{
    "dashboard_id": "test-001",
    "domain": "Retail",
    "business_goal": "Track sales performance by region",
    "dataset_description": "Monthly sales by product and region",
    "dataset_context": "{\"domain\":\"Retail\",\"description\":\"Monthly sales\",\"columns\":[\"date\",\"revenue\",\"region\",\"product\",\"quantity\",\"discount\"],\"row_count\":1200,\"sample_rows\":[{\"date\":\"2024-01-01\",\"revenue\":12500,\"region\":\"North\",\"product\":\"Widget A\",\"quantity\":50,\"discount\":0.05}]}",
    "columns": ["date", "revenue", "region", "product", "quantity", "discount"],
    "row_count": 1200,
    "theme": "modern"
  }'
```

Expected response shape:
```json
{
  "dashboard_spec": {
    "dashboard_id": "test-001",
    "kpis": [...],
    "charts": [...],
    "insights": [...],
    "tabs": { "c_suite": {...}, "top_management": {...}, ... }
  }
}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Agent returns markdown-wrapped JSON | Parse nodes auto-strip fences — check Code node logs |
| Credential not found | Re-select credential in each LLM sub-node |
| Timeout on Agent 2/3 | Increase n8n execution timeout in Settings |
| `$json.output` is undefined | Ensure LLM sub-node is connected via `ai_languageModel` pin |
| Agent invents column names | Check system message — "NEVER fabricate" instruction is present |
