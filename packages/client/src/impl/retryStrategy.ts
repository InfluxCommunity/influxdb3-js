import {getRetryDelay, RetryDelayStrategy} from '../errors'
import {
  RetryDelayStrategyOptions,
  DEFAULT_RetryDelayStrategyOptions,
} from '../options'

/**
 * Applies a variant of exponential backoff with initial and max delay and a random
 * jitter delay. It also respects `retry delay` when specified together with an error.
 */
export class RetryStrategyImpl implements RetryDelayStrategy {
  options: RetryDelayStrategyOptions
  currentDelay: number | undefined

  constructor(options?: Partial<RetryDelayStrategyOptions>) {
    this.options = {...DEFAULT_RetryDelayStrategyOptions, ...options}
    this.success()
  }

  nextDelay(error?: Error, failedAttempts?: number): number {
    const delay = getRetryDelay(error)
    if (delay && delay > 0) {
      return delay + Math.round(Math.random() * this.options.retryJitter)
    } else {
      if (failedAttempts && failedAttempts > 0) {
        // compute delay
        if (this.options.randomRetry) {
          // random delay between deterministic delays
          let delay = Math.max(this.options.minRetryDelay, 1)
          let nextDelay = delay * this.options.exponentialBase
          for (let i = 1; i < failedAttempts; i++) {
            delay = nextDelay
            nextDelay = nextDelay * this.options.exponentialBase
            if (nextDelay >= this.options.maxRetryDelay) {
              nextDelay = this.options.maxRetryDelay
              break
            }
          }
          return (
            delay +
            Math.round(
              Math.random() * (nextDelay - delay) +
                Math.random() * this.options.retryJitter
            )
          )
        }
        // deterministric delay otherwise
        let delay = Math.max(this.options.minRetryDelay, 1)
        for (let i = 1; i < failedAttempts; i++) {
          delay = delay * this.options.exponentialBase
          if (delay >= this.options.maxRetryDelay) {
            delay = this.options.maxRetryDelay
            break
          }
        }
        return delay + Math.round(Math.random() * this.options.retryJitter)
      } else if (this.currentDelay) {
        this.currentDelay = Math.min(
          Math.max(this.currentDelay * this.options.exponentialBase, 1) +
            Math.round(Math.random() * this.options.retryJitter),
          this.options.maxRetryDelay
        )
      } else {
        this.currentDelay =
          this.options.minRetryDelay +
          Math.round(Math.random() * this.options.retryJitter)
      }
      return this.currentDelay
    }
  }
  success(): void {
    this.currentDelay = undefined
  }
}

/**
 * Creates a new instance of retry strategy.
 * @param options - retry options
 * @returns retry strategy implementation
 */
export function createRetryDelayStrategy(
  options?: Partial<RetryDelayStrategyOptions>
): RetryDelayStrategy {
  return new RetryStrategyImpl(options)
}
