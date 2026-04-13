// Production-grade error handling and logging

export class CarbonLensError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, any>
  ) {
    super(message)
    this.name = 'CarbonLensError'
  }
}

export class ValidationError extends CarbonLensError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context)
  }
}

export class AuthenticationError extends CarbonLensError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401)
  }
}

export class AuthorizationError extends CarbonLensError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHZ_ERROR', 403)
  }
}

export class RateLimitError extends CarbonLensError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429)
  }
}

export class ExternalServiceError extends CarbonLensError {
  constructor(service: string, message: string, context?: Record<string, any>) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, context)
  }
}

// Production logging utility
export class Logger {
  private static log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: Record<string, any>) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {},
      service: 'carbonlens'
    }

    // In production, this would go to a proper logging service
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(logEntry))
    } else {
      console.log(`[${timestamp}] ${level}: ${message}`, context || '')
    }
  }

  static info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context)
  }

  static warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context)
  }

  static error(message: string, context?: Record<string, any>) {
    this.log('ERROR', message, context)
  }
}

// Error handling wrapper for async functions
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Record<string, any>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      Logger.error('Function execution failed', {
        function: fn.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        context
      })
      
      if (error instanceof CarbonLensError) {
        throw error
      }
      
      throw new CarbonLensError(
        'Internal server error',
        'INTERNAL_ERROR',
        500,
        { originalError: error instanceof Error ? error.message : error }
      )
    }
  }
}

// Circuit breaker pattern for external services
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new ExternalServiceError('CircuitBreaker', 'Service temporarily unavailable')
      }
    }

    try {
      const result = await fn()
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED'
        this.failures = 0
      }
      
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()
      
      if (this.failures >= this.threshold) {
        this.state = 'OPEN'
      }
      
      throw error
    }
  }
}
