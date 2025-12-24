# Epoch AI Python Library vs CSV: Evaluation

**Status:** Decision pending - evaluating tradeoffs

**TL;DR:** Python library gives more benchmarks + API access, but requires Airtable account setup. CSV approach is simpler but has fewer benchmarks. Both are viable.

## Current Approach (CSV)

**Pipeline:** Manual download from epoch.ai → `scripts/parse-epoch-data.mjs` → `ai-metrics.generated.ts`

**CSVs used:**
- `epoch_data/AI Trajectory Benchmark Data/mmlu_external.csv` → ARC-AGI scores
- `epoch_data/AI Trajectory Benchmark Data/epoch_capabilities_index.csv` → ECI
- `epoch_data/AI Models/notable_ai_models.csv` → Training compute
- `epoch_data/AI Models/all_ai_models.csv` → Frontier model timeline
- `benchmark_data/metr_time_horizons_external.csv` → METR task horizons

**Pros:**
- Zero dependencies (just csv-parse)
- No API keys or rate limits
- Works offline
- Simple, predictable data

**Cons:**
- Manual download step required
- No relationship data between entities
- Limited to what Epoch exports to CSV

---

## Epoch AI Python Library (`pip install epochai`)

**What it provides:**
- Direct Airtable API access to Epoch's database
- Entity types: `MLModel`, `Task`, `Score`, `BenchmarkRun`, `Organization`
- Preserved relationships (e.g., scores linked to models, tasks, organizations)
- Access to benchmarking hub data (per-question evaluation logs)

**Requirements:**
1. Copy Epoch's public Airtable base to your own Airtable account
2. Create Airtable personal access token with `data.records:read`, `schema.bases:read`
3. Set `AIRTABLE_BASE_ID` and `AIRTABLE_PERSONAL_ACCESS_TOKEN` env vars

**Pros:**
- Programmatic access (no manual downloads)
- Richer data (individual eval runs, per-question scores)
- More benchmarks available (GPQA Diamond, etc.)
- Entity relationships preserved (model → org, score → task → benchmark)
- Frequent updates (Epoch adds models quickly after release)

**Cons:**
- Added complexity: Python in a Node.js/Bun project
- Airtable account setup + base copy required
- API rate limits (Airtable limits)
- Must aggregate data yourself (library returns raw records)
- More moving parts = more failure modes

---

## Analysis for AI Obituaries

### What the project actually needs:
1. **Frontier envelopes** (best score at each date) - computed from raw data
2. **Monthly aggregation** for visualization clarity
3. **Training compute trend** over time
4. **Frontier model timeline** (who was best when)

### Does the Python library add value?

| Feature | CSV | Python Library | Verdict |
|---------|-----|----------------|---------|
| Training compute frontier | Yes | Yes | Parity |
| MMLU/ARC-AGI frontier | Yes | Yes | Parity |
| ECI frontier | Yes | Yes | Parity |
| METR horizons | Yes (separate source) | No (METR not Epoch) | CSV wins |
| Model → Org relationships | In CSV columns | First-class entities | Minor Python win |
| Per-question eval data | No | Yes | Python wins (unused) |
| More benchmarks (GPQA, etc.) | Would need more CSVs | Yes | Python wins (if wanted) |
| No manual downloads | No | Yes | Python wins |
| No API keys | Yes | No | CSV wins |
| Works in Bun/Node | Yes | Needs Python subprocess | CSV wins |

### Key insight:
The Python library's main advantage is **richer, per-question evaluation data** from the benchmarking hub. But the visualization only needs **frontier aggregates** - the same data that's in the CSVs.

---

## Recommendation

**Adopt the Python library** given:
1. **Daily cron already exists** - Automation infrastructure is in place
2. **Want more benchmarks** - Library makes adding GPQA, HumanEval, MATH trivial
3. **Fresh data matters** - Daily claims should compare against current AI capabilities

**Trade-offs accepted:**
- Airtable account setup (one-time)
- Python subprocess in CI (fits with existing cron pattern)
- METR data still needs separate handling (not in Epoch's Airtable)

---

## Implementation Plan

### Architecture: Hybrid Python → JSON → TypeScript

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│ Epoch AI API    │────▶│ fetch-epoch.py   │────▶│ epoch_api_data.json     │
│ (via Airtable)  │     │ (Python + uv)    │     │ (intermediate)          │
└─────────────────┘     └──────────────────┘     └───────────┬─────────────┘
                                                             │
┌─────────────────┐     ┌──────────────────┐                 │
│ METR CSV        │────▶│ parse-epoch.mjs  │◀────────────────┘
│ (manual/cron)   │     │ (Node.js/Bun)    │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
                        ┌─────────────────────────┐
                        │ ai-metrics.generated.ts │
                        └─────────────────────────┘
```

### Step 1: One-time Airtable Setup

1. Visit Epoch's public Airtable base (link in their docs)
2. Click "Copy base" to create your own copy
3. Note base ID from URL: `airtable.com/appXXXXXXXXX/...`
4. Create personal access token at [airtable.com/create/tokens](https://airtable.com/create/tokens)
   - Scopes: `data.records:read`, `schema.bases:read`
5. Add to `.env.local`:
   ```
   AIRTABLE_BASE_ID=appXXXXXXXXX
   AIRTABLE_PERSONAL_ACCESS_TOKEN=patXXXXXXXXX
   ```

### Step 2: Create Python Fetch Script

**File:** `scripts/fetch-epoch-data.py`

```python
#!/usr/bin/env python3
"""Fetch AI metrics from Epoch AI via Airtable API."""
import json
import sys
from datetime import datetime

from epochai.airtable.models import MLModel, Score, BenchmarkRun

def main():
    # Fetch all data with caching
    models = MLModel.all(memoize=True)
    scores = Score.all(memoize=True)
    runs = BenchmarkRun.all(memoize=True)

    # Extract what we need for visualization
    output = {
        "generated_at": datetime.now().isoformat(),
        "models": [serialize_model(m) for m in models],
        "scores": [serialize_score(s) for s in scores],
        # Add specific benchmark extractions here
    }

    json.dump(output, sys.stdout, indent=2)

if __name__ == "__main__":
    main()
```

### Step 3: Update Node.js Parser

Modify `scripts/parse-epoch-data.mjs` to:
1. Read from `epoch_api_data.json` if it exists (API data)
2. Fall back to CSVs if not (backward compatible)
3. Continue handling METR separately (not in Epoch API)

### Step 4: Add to Cron/CI

```yaml
# In vercel.json or CI workflow
- name: Fetch Epoch data
  run: |
    uv run scripts/fetch-epoch-data.py > epoch_data/epoch_api_data.json
    bun scripts/parse-epoch-data.mjs
```

---

## Benchmarks to Add (via Python library)

| Benchmark | Task Path | What it Measures |
|-----------|-----------|------------------|
| GPQA Diamond | `bench.task.gpqa.gpqa_diamond` | PhD-level science reasoning |
| HumanEval | `bench.task.humaneval.*` | Code generation |
| MATH | `bench.task.math.*` | Mathematical reasoning |
| GSM8K | `bench.task.gsm8k.*` | Grade school math |
| HellaSwag | `bench.task.hellaswag.*` | Common sense reasoning |
| Winogrande | `bench.task.winogrande.*` | Pronoun resolution |

### Recommended additions for AI Obituaries:
1. **GPQA Diamond** - Hard reasoning, good for "AI can't reason" claims
2. **HumanEval** - Code ability, for "AI can't code" claims
3. **MATH** - For "AI can't do math" claims

---

## Files to Modify

| File | Change |
|------|--------|
| `scripts/fetch-epoch-data.py` | **New** - Python script to fetch from API |
| `scripts/parse-epoch-data.mjs` | Update to read JSON, add new benchmarks |
| `src/data/ai-metrics.generated.ts` | Will have more metrics |
| `src/data/ai-metrics.ts` | Add helpers for new metrics |
| `src/types/metrics.ts` | Add new MetricType values |
| `src/components/visualization/background-chart.tsx` | Render new metrics |
| `src/components/controls/metrics-toggle.tsx` | Toggle for new metrics |
| `.env.local` | Add Airtable credentials |
| `pyproject.toml` or similar | Add epochai dependency |

---

## Alternative: Stay with CSV + Scheduled Download

If Airtable setup seems too heavy, could instead:
1. Add GitHub Action to periodically `curl` Epoch's CSV exports
2. Commit updated CSVs to repo
3. Trigger Vercel rebuild

Simpler, but fewer benchmarks available as CSVs.
