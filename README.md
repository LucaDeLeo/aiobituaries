# AI Obituaries

A curated archive of "AI is dead/overhyped/doomed" declarations, visualized against the backdrop of exponential AI progress.

## The Concept

Like the famous chart showing IEA solar predictions staying flat while actual solar deployment soared, AI Obituaries plots skeptical AI claims against real metrics of AI progress:

- **Training Compute** - Exponential growth in frontier model compute (Epoch AI data)
- **MMLU Benchmark** - Capability scores climbing from 25% to 88%
- **Epoch Capability Index** - Composite AI capability metric

Each "obituary" dot is positioned on the rising progress curves, creating a visual irony: claims of AI's demise appearing against a backdrop of relentless advancement.

## Features

- Interactive timeline visualization with pan/zoom
- Background trend lines from Epoch AI datasets
- Category filtering (Market/Bubble, Capability Doubt, AGI Skepticism, Dismissive Framing)
- Accessible table view alternative
- Mobile-responsive design
- Real-time updates via Sanity CMS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Visualization**: Visx (D3 bindings for React)
- **CMS**: Sanity
- **Testing**: Vitest, Playwright
- **Data**: Epoch AI (epoch.ai/data)

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Sanity credentials

# Start development server
pnpm dev
```

## Updating AI Metrics

The visualization uses data from [Epoch AI](https://epoch.ai/data). To update:

1. Download fresh CSVs from epoch.ai to `epoch_data/`
2. Run the parser:
   ```bash
   node scripts/parse-epoch-data.mjs
   ```

## License

MIT
