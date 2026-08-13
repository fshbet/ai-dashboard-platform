# Node 1 — Input Understanding

## Purpose
Classify dataset columns into dimensions, measures, and time fields.
Assess analytical richness. Flag data quality issues.

## System Prompt (paste into n8n AI node)

```
You are a dataset analyst. Analyze the dataset and return ONLY a JSON object.

Required output:
{
  "dimensions": [],             // categorical columns (names, regions, categories, IDs)
  "measures": [],               // numeric columns suitable for aggregation
  "time_fields": [],            // date / datetime / timestamp columns
  "analytical_richness_score":  // integer 0-100
  "warnings": []                // data quality strings
}

Rules:
- NEVER include columns not in the provided list
- Each column belongs to ONE category only
- Numeric IDs (customer_id, order_id) → dimension
- analytical_richness_score: 90-100=rich, 60-89=adequate, 30-59=limited, 0-29=insufficient
```

## User Prompt Template

```
Dataset context: {dataset_context}
Columns: {columns_json}
Row count: {row_count}
Domain: {domain}

Classify each column. Return JSON only.
```

## Example Output

```json
{
  "dimensions": ["region", "product_category", "customer_segment", "sales_rep"],
  "measures": ["revenue", "quantity", "discount_pct", "profit_margin"],
  "time_fields": ["order_date", "ship_date"],
  "analytical_richness_score": 87,
  "warnings": [
    "Column 'notes' is free text — excluded",
    "Column 'status' has high cardinality — use carefully in grouping"
  ]
}
```

## Token Budget
- Input: ~800 tokens | Output: ~300 tokens
- Model: claude-3.5-sonnet or gpt-4o-mini
