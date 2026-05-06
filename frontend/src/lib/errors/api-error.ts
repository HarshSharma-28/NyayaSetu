export class ApiError extends Error {
  errorCode: string;
  statusCode: number;
  fieldErrors?: Record<string, string>;
  timestamp: string;

  constructor(response: {
    error_code: string;
    message: string;
    status: number;
    field_errors?: Record<string, string>;
    timestamp?: string;
  }) {
    super(response.message);
    this.name = 'ApiError';
    this.errorCode = response.error_code;
    this.statusCode = response.status;
    this.fieldErrors = response.field_errors;
    this.timestamp = response.timestamp || new Date().toISOString();
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    try {
      const data = await res.json();
      return new ApiError({
        error_code: data.error_code || `HTTP_${res.status}`,
        message: data.message || res.statusText,
        status: res.status,
        field_errors: data.field_errors,
        timestamp: data.timestamp,
      });
    } catch {
      // If response is not JSON
      return new ApiError({
        error_code: `HTTP_${res.status}`,
        message: res.statusText || 'Unknown error occurred',
        status: res.status,
      });
    }
  }

  isAuth(): boolean {
    return this.errorCode.startsWith('AUTH_');
  }

  isNotFound(): boolean {
    return this.statusCode === 404 || this.errorCode === 'HTTP_404';
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }

  isValidation(): boolean {
    return this.errorCode === 'VAL_001';
  }

  isPDF(): boolean {
    return this.errorCode.startsWith('PDF_');
  }

  isAI(): boolean {
    return this.errorCode.startsWith('AI_');
  }
}
