/**
 * AI Progress Metrics - Generated from Epoch AI data
 * Source: https://epoch.ai/data
 * Generated: 2025-12-25
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
 * Best MMLU (Massive Multitask Language Understanding) score at each point in time.
 * Measures knowledge and reasoning across 57 academic subjects.
 * Source: https://epoch.ai/data - mmlu_external.csv
 * Data starts: Aug 2021
 */
export const mmluFrontier: AIMetricSeries = {
  id: 'mmlu',
  label: 'MMLU Score',
  color: 'rgb(34, 197, 94)', // Green
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
 * ARC-AGI Benchmark Frontier
 * Best ARC-AGI (Abstraction and Reasoning Corpus) score at each point in time.
 * Measures novel pattern recognition and abstract reasoning.
 * Source: https://arcprize.org/ - arc_agi_external.csv
 * Data starts: Sept 2024
 */
export const arcagiFrontier: AIMetricSeries = {
  id: 'arcagi',
  label: 'ARC-AGI Score',
  color: 'rgb(234, 179, 8)', // Amber
  unit: '%',
  data: [
      {
          "date": "2024-09-01",
          "value": 18
      },
      {
          "date": "2024-12-01",
          "value": 30.7
      },
      {
          "date": "2025-01-01",
          "value": 34.5
      },
      {
          "date": "2025-04-01",
          "value": 60.8
      },
      {
          "date": "2025-08-01",
          "value": 65.7
      },
      {
          "date": "2025-10-01",
          "value": 70.2
      },
      {
          "date": "2025-11-01",
          "value": 75
      }
  ],
}

/**
 * Epoch Capabilities Index (ECI) Frontier
 * Composite capability score from Epoch AI.
 * Higher is better - tracks overall AI capability.
 * Data starts: Feb 2023
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
 * METR Task Horizon Frontier (minutes)
 * Maximum task horizon (autonomous work duration) achieved by AI models.
 * Measures agentic capability - how long models can work on tasks autonomously.
 * Source: https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/
 * Data starts: Nov 2019
 */
export const metrFrontier: AIMetricSeries = {
  id: 'metr',
  label: 'METR Task Horizon',
  color: 'rgb(236, 72, 153)', // Pink
  unit: 'minutes',
  data: [
      {
          "date": "2019-11-01",
          "value": 0
      },
      {
          "date": "2023-03-01",
          "value": 5.4
      },
      {
          "date": "2023-11-01",
          "value": 8.6
      },
      {
          "date": "2024-06-01",
          "value": 18.2
      },
      {
          "date": "2024-09-01",
          "value": 22.2
      },
      {
          "date": "2024-10-01",
          "value": 29
      },
      {
          "date": "2024-12-01",
          "value": 39.2
      },
      {
          "date": "2025-02-01",
          "value": 54.2
      },
      {
          "date": "2025-04-01",
          "value": 91.3
      },
      {
          "date": "2025-07-01",
          "value": 110.1
      },
      {
          "date": "2025-08-01",
          "value": 137.3
      }
  ],
}

/**
 * All metric series for visualization
 */
export const allMetrics: AIMetricSeries[] = [mmluFrontier, arcagiFrontier, eciFrontier, trainingComputeFrontier, metrFrontier]

/**
 * Frontier model timeline - which model was the frontier at each date
 * Based on training compute from Epoch's all_ai_models.csv
 */
export interface FrontierModelEntry {
  /** Date this model became the frontier */
  date: string
  /** Model name */
  model: string
  /** Organization that created the model */
  org: string
  /** Link to announcement/paper (nullable) */
  link: string | null
  /** Training compute in log₁₀ FLOP */
  compute: number
}

export const frontierModelTimeline: FrontierModelEntry[] = [
  {
    "date": "1950-07-02",
    "model": "Theseus",
    "org": "Bell Laboratories",
    "link": "https://www.technologyreview.com/2018/12/19/138508/mighty-mouse/",
    "compute": 1.6
  },
  {
    "date": "1957-01-01",
    "model": "Perceptron Mark I",
    "org": "Cornell Aeronautical Laboratory,Cornell University",
    "link": "https://blogs.umass.edu/brain-wars/files/2016/03/rosenblatt-1957.pdf",
    "compute": 5.8
  },
  {
    "date": "1959-02-01",
    "model": "Pandemonium (morse)",
    "org": "Massachusetts Institute of Technology (MIT)",
    "link": "https://aitopics.org/doc/classics:504E1BAC/",
    "compute": 8.8
  },
  {
    "date": "1960-03-30",
    "model": "Perceptron (1960)",
    "org": "Cornell Aeronautical Laboratory",
    "link": "https://www.semanticscholar.org/paper/Perceptron-Simulation-Experiments-Rosenblatt/ae76ce1ba27ac29addce4aab93b927e9bc7f7c67",
    "compute": 8.9
  },
  {
    "date": "1987-06-06",
    "model": "NetTalk (transcription)",
    "org": "Princeton University",
    "link": "http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=03A3D3EDF0BAF35405ABCF083411B55E?doi=10.1.1.154.7012&rep=rep1&type=pdf",
    "compute": 10.5
  },
  {
    "date": "1989-11-27",
    "model": "Handwritten digit recognition network",
    "org": "AT&T",
    "link": "https://www.semanticscholar.org/paper/Handwritten-Digit-Recognition-with-a-Network-LeCun-Boser/86ab4cae682fbd49c5a5bedb630e5a40fa7529f6",
    "compute": 11.3
  },
  {
    "date": "1989-12-01",
    "model": "Zip CNN",
    "org": "AT&T,Bell Laboratories",
    "link": "https://ieeexplore.ieee.org/document/6795724",
    "compute": 12.2
  },
  {
    "date": "1992-05-01",
    "model": "TD-Gammon",
    "org": "IBM",
    "link": "https://papers.nips.cc/paper/1991/file/68ce199ec2c5517597ce0a4d89620f55-Paper.pdf",
    "compute": 13.3
  },
  {
    "date": "1994-12-02",
    "model": "Predictive Coding NN",
    "org": "Technical University of Munich",
    "link": "https://proceedings.neurips.cc/paper/1994/file/5705e1164a8394aace6018e27d20d237-Paper.pdf",
    "compute": 13.3
  },
  {
    "date": "1997-11-15",
    "model": "LSTM",
    "org": "Technical University of Munich",
    "link": "https://direct.mit.edu/neco/article-abstract/9/8/1735/6109/Long-Short-Term-Memory?redirectedFrom=fulltext",
    "compute": 13.5
  },
  {
    "date": "2000-11-28",
    "model": "PoE MNIST",
    "org": "University College London (UCL)",
    "link": "https://proceedings.neurips.cc/paper_files/paper/2000/file/1f1baa5b8edac74eb4eaa329f14a0361-Paper.pdf",
    "compute": 13.7
  },
  {
    "date": "2000-11-28",
    "model": "Neural LM",
    "org": "University of Montreal / Université de Montréal",
    "link": "https://papers.nips.cc/paper_files/paper/2000/file/728f206c2a01bf572b5940d7d9a8fa4c-Paper.pdf",
    "compute": 15.8
  },
  {
    "date": "2007-06-22",
    "model": "SB-LM",
    "org": "Google",
    "link": "https://www.semanticscholar.org/paper/Large-Language-Models-in-Machine-Translation-Brants-Popat/ba786c46373892554b98df42df7af6f5da343c9d",
    "compute": 18.2
  },
  {
    "date": "2013-01-16",
    "model": "DistBelief NNLM",
    "org": "Google",
    "link": "https://arxiv.org/abs/1301.3781",
    "compute": 18.4
  },
  {
    "date": "2014-06-18",
    "model": "SPPNet",
    "org": "Microsoft,Xi’an Jiaotong University,University of Science and Technology of China (USTC)",
    "link": "https://arxiv.org/abs/1406.4729",
    "compute": 18.5
  },
  {
    "date": "2014-09-04",
    "model": "VGG16",
    "org": "University of Oxford",
    "link": "https://arxiv.org/abs/1409.1556",
    "compute": 19.1
  },
  {
    "date": "2014-09-10",
    "model": "Seq2Seq LSTM",
    "org": "Google",
    "link": "https://arxiv.org/abs/1409.3215",
    "compute": 19.7
  },
  {
    "date": "2014-12-03",
    "model": "SNM-skip",
    "org": "Google",
    "link": "https://arxiv.org/abs/1412.1454",
    "compute": 20.5
  },
  {
    "date": "2015-10-01",
    "model": "AlphaGo Fan",
    "org": "DeepMind",
    "link": "https://www.nature.com/articles/nature16961",
    "compute": 20.6
  },
  {
    "date": "2016-01-27",
    "model": "AlphaGo Lee",
    "org": "DeepMind",
    "link": "https://www.nature.com/articles/nature16961",
    "compute": 21.3
  },
  {
    "date": "2016-09-26",
    "model": "GNMT",
    "org": "Google",
    "link": "https://arxiv.org/abs/1609.08144",
    "compute": 21.8
  },
  {
    "date": "2018-05-02",
    "model": "ResNeXt-101 32x48d",
    "org": "Facebook",
    "link": "https://arxiv.org/abs/1805.00932",
    "compute": 21.9
  },
  {
    "date": "2019-09-17",
    "model": "Megatron-BERT",
    "org": "NVIDIA",
    "link": "https://arxiv.org/abs/1909.08053",
    "compute": 22.3
  },
  {
    "date": "2019-10-23",
    "model": "T5-11B",
    "org": "Google",
    "link": "https://arxiv.org/abs/1910.10683",
    "compute": 22.5
  },
  {
    "date": "2019-10-30",
    "model": "AlphaStar",
    "org": "DeepMind",
    "link": "https://www.deepmind.com/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning",
    "compute": 23
  },
  {
    "date": "2020-01-28",
    "model": "Meena",
    "org": "Google Brain",
    "link": "https://arxiv.org/abs/2001.09977",
    "compute": 23
  },
  {
    "date": "2020-05-28",
    "model": "GPT-3 175B (davinci)",
    "org": "OpenAI",
    "link": "https://arxiv.org/abs/2005.14165",
    "compute": 23.5
  },
  {
    "date": "2021-05-31",
    "model": "Wu Dao 2.0",
    "org": "Beijing Academy of Artificial Intelligence / BAAI",
    "link": "https://www.engadget.com/chinas-gigantic-multi-modal-ai-is-no-one-trick-pony-211414388.html",
    "compute": 24.2
  },
  {
    "date": "2021-09-03",
    "model": "FLAN 137B",
    "org": "Google Research",
    "link": "https://arxiv.org/abs/2109.01652",
    "compute": 24.3
  },
  {
    "date": "2022-04-04",
    "model": "PaLM (540B)",
    "org": "Google Research",
    "link": "https://arxiv.org/abs/2204.02311",
    "compute": 24.4
  },
  {
    "date": "2022-06-29",
    "model": "Minerva (540B)",
    "org": "Google",
    "link": "https://arxiv.org/abs/2206.14858",
    "compute": 24.4
  },
  {
    "date": "2023-03-15",
    "model": "GPT-4 (Mar 2023)",
    "org": "OpenAI",
    "link": "https://arxiv.org/abs/2303.08774",
    "compute": 25.3
  },
  {
    "date": "2023-12-06",
    "model": "Gemini 1.0 Ultra",
    "org": "Google DeepMind",
    "link": "https://storage.googleapis.com/deepmind-media/gemini/gemini_1_report.pdf",
    "compute": 25.7
  },
  {
    "date": "2025-02-17",
    "model": "Grok 3",
    "org": "xAI",
    "link": "https://x.ai/blog/grok-3",
    "compute": 26.5
  },
  {
    "date": "2025-02-27",
    "model": "GPT-4.5",
    "org": "OpenAI",
    "link": "https://openai.com/index/introducing-gpt-4-5/",
    "compute": 26.6
  },
  {
    "date": "2025-07-09",
    "model": "Grok 4",
    "org": "xAI",
    "link": "https://x.ai/news/grok-4",
    "compute": 26.7
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
