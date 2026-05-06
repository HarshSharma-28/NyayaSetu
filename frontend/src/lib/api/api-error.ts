/**
 * Standard API error class — used for all failed requests.
 */
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Helper to identify if an error is an ApiError
   */
  static isApiError(err: any): err is ApiError {
    return err instanceof ApiError || (err && err.name === 'ApiError');
  }
}
