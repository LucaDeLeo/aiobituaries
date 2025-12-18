/**
 * AI Progress Metrics - Generated from Epoch AI data
 * Source: https://epoch.ai/data
 * Generated: 2025-12-18
 *
 * DO NOT EDIT MANUALLY - regenerate with: node scripts/parse-epoch-data.mjs
 *
 * P1.1: This file is auto-generated. Handwritten helpers are in ai-metrics.ts
 */

export interface MetricDataPoint {
  date: string
  value: number
}

export interface AIMetricSeries {
  id: string
  label: string
  color: string
  unit: string
  data: MetricDataPoint[]
}

/**
 * MMLU Benchmark Frontier
 * Best MMLU score achieved at each point in time.
 * Shows capability progress on a standardized benchmark.
 */
export const mmluFrontier: AIMetricSeries = {
  id: 'mmlu',
  label: 'MMLU Score',
  color: 'rgb(234, 179, 8)', // Amber
  unit: '%',
  data: [
      {
          "date": "2021-08-01",
          "value": 25.7
      },
      {
          "date": "2021-12-01",
          "value": 60
      },
      {
          "date": "2022-03-01",
          "value": 70
      },
      {
          "date": "2023-03-01",
          "value": 86.4
      },
      {
          "date": "2024-06-01",
          "value": 86.5
      },
      {
          "date": "2024-09-01",
          "value": 86.9
      },
      {
          "date": "2024-10-01",
          "value": 87.3
      },
      {
          "date": "2024-11-01",
          "value": 88.1
      }
  ],
}

/**
 * Epoch Capabilities Index (ECI) Frontier
 * Composite capability score from Epoch AI.
 * Higher is better - tracks overall AI capability.
 */
export const eciFrontier: AIMetricSeries = {
  id: 'eci',
  label: 'Epoch Capability Index',
  color: 'rgb(99, 102, 241)', // Indigo
  unit: 'ECI',
  data: [
      {
          "date": "2023-02-01",
          "value": 109.8
      },
      {
          "date": "2023-03-01",
          "value": 125.9
      },
      {
          "date": "2024-02-01",
          "value": 126.5
      },
      {
          "date": "2024-04-01",
          "value": 127.1
      },
      {
          "date": "2024-05-01",
          "value": 128.5
      },
      {
          "date": "2024-06-01",
          "value": 130
      },
      {
          "date": "2024-07-01",
          "value": 130.5
      },
      {
          "date": "2024-09-01",
          "value": 138
      },
      {
          "date": "2024-12-01",
          "value": 142.8
      },
      {
          "date": "2025-03-01",
          "value": 145.2
      },
      {
          "date": "2025-04-01",
          "value": 147.5
      },
      {
          "date": "2025-06-01",
          "value": 148.1
      },
      {
          "date": "2025-08-01",
          "value": 150.7
      },
      {
          "date": "2025-10-01",
          "value": 151.1
      },
      {
          "date": "2025-11-01",
          "value": 154.4
      }
  ],
}

/**
 * Training Compute Frontier (log10 FLOP)
 * Maximum training compute used by frontier models.
 * Shows exponential scaling of AI training.
 */
export const trainingComputeFrontier: AIMetricSeries = {
  id: 'compute',
  label: 'Training Compute',
  color: 'rgb(118, 185, 0)', // Green
  unit: 'log₁₀ FLOP',
  data: [
      {
          "date": "1950-07-01",
          "value": 1.6
      },
      {
          "date": "1956-12-01",
          "value": 5.8
      },
      {
          "date": "1959-01-01",
          "value": 8.8
      },
      {
          "date": "1960-03-01",
          "value": 8.9
      },
      {
          "date": "1987-06-01",
          "value": 10.5
      },
      {
          "date": "1989-11-01",
          "value": 12.2
      },
      {
          "date": "1992-04-01",
          "value": 13.3
      },
      {
          "date": "1994-12-01",
          "value": 13.3
      },
      {
          "date": "1997-11-01",
          "value": 13.5
      },
      {
          "date": "2000-11-01",
          "value": 15.8
      },
      {
          "date": "2007-06-01",
          "value": 18.2
      },
      {
          "date": "2013-01-01",
          "value": 18.4
      },
      {
          "date": "2014-06-01",
          "value": 18.5
      },
      {
          "date": "2014-09-01",
          "value": 19.7
      },
      {
          "date": "2014-12-01",
          "value": 20.5
      },
      {
          "date": "2015-09-01",
          "value": 20.6
      },
      {
          "date": "2016-01-01",
          "value": 21.3
      },
      {
          "date": "2016-09-01",
          "value": 21.8
      },
      {
          "date": "2018-05-01",
          "value": 21.9
      },
      {
          "date": "2019-09-01",
          "value": 22.3
      },
      {
          "date": "2019-10-01",
          "value": 23
      },
      {
          "date": "2020-01-01",
          "value": 23
      },
      {
          "date": "2020-05-01",
          "value": 23.5
      },
      {
          "date": "2021-08-01",
          "value": 23.6
      },
      {
          "date": "2021-09-01",
          "value": 24.3
      },
      {
          "date": "2022-04-01",
          "value": 24.4
      },
      {
          "date": "2022-06-01",
          "value": 24.4
      },
      {
          "date": "2023-03-01",
          "value": 25.3
      },
      {
          "date": "2023-12-01",
          "value": 25.7
      },
      {
          "date": "2025-02-01",
          "value": 26.6
      },
      {
          "date": "2025-07-01",
          "value": 26.7
      }
  ],
}

/**
 * All metric series for visualization
 */
export const allMetrics: AIMetricSeries[] = [mmluFrontier, eciFrontier, trainingComputeFrontier]

/**
 * Frontier model timeline - which model was the frontier at each date
 * Based on training compute from Epoch's frontier_ai_models.csv
 */
export interface FrontierModelEntry {
  /** Date this model became the frontier */
  date: string
  /** Model name */
  model: string
  /** Organization that created the model */
  org: string
}

export const frontierModelTimeline: FrontierModelEntry[] = [
  {
    "date": "1950-07-02",
    "model": "Theseus",
    "org": "Bell Laboratories"
  },
  {
    "date": "1957-01-01",
    "model": "Perceptron Mark I",
    "org": "Cornell Aeronautical Laboratory,Cornell University"
  },
  {
    "date": "1959-02-01",
    "model": "Pandemonium (morse)",
    "org": "Massachusetts Institute of Technology (MIT)"
  },
  {
    "date": "1960-03-30",
    "model": "Perceptron (1960)",
    "org": "Cornell Aeronautical Laboratory"
  },
  {
    "date": "1987-06-06",
    "model": "NetTalk (transcription)",
    "org": "Princeton University"
  },
  {
    "date": "1989-11-27",
    "model": "Handwritten digit recognition network",
    "org": "AT&T"
  },
  {
    "date": "1989-12-01",
    "model": "Zip CNN",
    "org": "AT&T,Bell Laboratories"
  },
  {
    "date": "1992-05-01",
    "model": "TD-Gammon",
    "org": "IBM"
  },
  {
    "date": "1994-12-02",
    "model": "Predictive Coding NN",
    "org": "Technical University of Munich"
  },
  {
    "date": "1997-11-15",
    "model": "LSTM",
    "org": "Technical University of Munich"
  },
  {
    "date": "2000-11-28",
    "model": "PoE MNIST",
    "org": "University College London (UCL)"
  },
  {
    "date": "2000-11-28",
    "model": "Neural LM",
    "org": "University of Montreal / Université de Montréal"
  },
  {
    "date": "2007-06-22",
    "model": "SB-LM",
    "org": "Google"
  },
  {
    "date": "2013-01-16",
    "model": "DistBelief NNLM",
    "org": "Google"
  },
  {
    "date": "2014-06-18",
    "model": "SPPNet",
    "org": "Microsoft,Xi’an Jiaotong University,University of Science and Technology of China (USTC)"
  },
  {
    "date": "2014-09-04",
    "model": "VGG16",
    "org": "University of Oxford"
  },
  {
    "date": "2014-09-10",
    "model": "Seq2Seq LSTM",
    "org": "Google"
  },
  {
    "date": "2014-12-03",
    "model": "SNM-skip",
    "org": "Google"
  },
  {
    "date": "2015-10-01",
    "model": "AlphaGo Fan",
    "org": "DeepMind"
  },
  {
    "date": "2016-01-27",
    "model": "AlphaGo Lee",
    "org": "DeepMind"
  },
  {
    "date": "2016-09-26",
    "model": "GNMT",
    "org": "Google"
  },
  {
    "date": "2018-05-02",
    "model": "ResNeXt-101 32x48d",
    "org": "Facebook"
  },
  {
    "date": "2019-09-17",
    "model": "Megatron-BERT",
    "org": "NVIDIA"
  },
  {
    "date": "2019-10-23",
    "model": "T5-11B",
    "org": "Google"
  },
  {
    "date": "2019-10-30",
    "model": "AlphaStar",
    "org": "DeepMind"
  },
  {
    "date": "2020-01-28",
    "model": "Meena",
    "org": "Google Brain"
  },
  {
    "date": "2020-05-28",
    "model": "GPT-3 175B (davinci)",
    "org": "OpenAI"
  },
  {
    "date": "2021-05-31",
    "model": "Wu Dao 2.0",
    "org": "Beijing Academy of Artificial Intelligence / BAAI"
  },
  {
    "date": "2021-09-03",
    "model": "FLAN 137B",
    "org": "Google Research"
  },
  {
    "date": "2022-04-04",
    "model": "PaLM (540B)",
    "org": "Google Research"
  },
  {
    "date": "2022-06-29",
    "model": "Minerva (540B)",
    "org": "Google"
  },
  {
    "date": "2023-03-15",
    "model": "GPT-4",
    "org": "OpenAI"
  },
  {
    "date": "2023-12-06",
    "model": "Gemini 1.0 Ultra",
    "org": "Google DeepMind"
  },
  {
    "date": "2025-02-17",
    "model": "Grok 3",
    "org": "xAI"
  },
  {
    "date": "2025-02-27",
    "model": "GPT-4.5",
    "org": "OpenAI"
  },
  {
    "date": "2025-07-09",
    "model": "Grok 4",
    "org": "xAI"
  }
]

/**
 * Get the frontier model at a specific date
 * Returns the most recent model that was released on or before the given date
 */
export function getFrontierModelAtDate(date: Date): FrontierModelEntry | null {
  const dateStr = date.toISOString().slice(0, 10)
  let result: FrontierModelEntry | null = null

  for (const entry of frontierModelTimeline) {
    if (entry.date <= dateStr) {
      result = entry
    } else {
      break
    }
  }

  return result
}

/**
 * Get interpolated value for a metric at a specific date
 */
export function getMetricValueAtDate(series: AIMetricSeries, date: Date): number {
  const targetTime = date.getTime()
  const points = series.data

  for (let i = 0; i < points.length - 1; i++) {
    const startTime = new Date(points[i].date).getTime()
    const endTime = new Date(points[i + 1].date).getTime()

    if (targetTime >= startTime && targetTime <= endTime) {
      const ratio = (targetTime - startTime) / (endTime - startTime)
      return points[i].value + ratio * (points[i + 1].value - points[i].value)
    }
  }

  if (targetTime < new Date(points[0].date).getTime()) {
    return points[0].value
  }
  return points[points.length - 1].value
}

/**
 * Normalize value to 0-1 range based on series min/max
 */
export function normalizeMetricValue(series: AIMetricSeries, value: number): number {
  const values = series.data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return (value - min) / (max - min)
}

/**
 * Get normalized value (0-1) for a metric at a specific date
 */
export function getNormalizedMetricAtDate(series: AIMetricSeries, date: Date): number {
  const value = getMetricValueAtDate(series, date)
  return normalizeMetricValue(series, value)
}
