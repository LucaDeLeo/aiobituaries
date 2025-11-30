/**
 * Contextual market and capability data at the time an AI skepticism claim was made.
 * All fields optional since not all context types apply to all claims.
 */
export interface ContextMetadata {
  /** NVIDIA stock price at claim date */
  nvdaPrice?: number
  /** Microsoft stock price at claim date */
  msftPrice?: number
  /** Google stock price at claim date */
  googPrice?: number
  /** Name of AI benchmark (e.g., MMLU) */
  benchmarkName?: string
  /** Best AI score on benchmark at time */
  benchmarkScore?: number
  /** Leading AI model at time of claim */
  currentModel?: string
  /** Notable AI milestone around claim date */
  milestone?: string
  /** Additional context or commentary */
  note?: string
}
