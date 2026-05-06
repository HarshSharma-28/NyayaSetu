export const ERROR_CODES = {
  // Auth Errors
  AUTH_001: 'AUTH_001', // Invalid credentials
  AUTH_002: 'AUTH_002', // Invalid OTP
  AUTH_003: 'AUTH_003', // OTP expired
  AUTH_004: 'AUTH_004', // Token invalid
  AUTH_005: 'AUTH_005', // Token expired
  AUTH_006: 'AUTH_006', // Insufficient permissions
  AUTH_007: 'AUTH_007', // Role mismatch
  AUTH_008: 'AUTH_008', // Account inactive
  AUTH_009: 'AUTH_009', // User not found
  AUTH_010: 'AUTH_010', // Rate limit exceeded

  // Case Errors
  CASE_001: 'CASE_001', // Case not found
  CASE_002: 'CASE_002', // Case already exists
  CASE_003: 'CASE_003', // Case deleted softly
  CASE_004: 'CASE_004', // Invalid case status transition
  CASE_005: 'CASE_005', // Case update failed
  CASE_006: 'CASE_006', // Case creation failed

  // Directive Errors
  DIR_001: 'DIR_001', // Directive not found
  DIR_002: 'DIR_002', // Directive already verified
  DIR_003: 'DIR_003', // Directive update not allowed
  DIR_004: 'DIR_004', // Directive rejection reason missing
  DIR_005: 'DIR_005', // Directive creation failed

  // PDF Errors
  PDF_001: 'PDF_001', // PDF too large
  PDF_002: 'PDF_002', // Invalid file type
  PDF_003: 'PDF_003', // PDF corrupted
  PDF_004: 'PDF_004', // PDF encrypted
  PDF_005: 'PDF_005', // PDF text too short
  PDF_006: 'PDF_006', // OCR failed
  PDF_007: 'PDF_007', // PDF upload failed

  // AI Errors
  AI_001: 'AI_001', // Gemini API exception
  AI_002: 'AI_002', // Gemini quota exceeded
  AI_003: 'AI_003', // AI response parse exception
  AI_004: 'AI_004', // AI extraction failed
  AI_005: 'AI_005', // AI service unavailable

  // DB Errors
  DB_001: 'DB_001', // Database connection exception
  DB_002: 'DB_002', // Record not found
  DB_003: 'DB_003', // Duplicate record
  DB_004: 'DB_004', // Integrity constraint violation
  DB_005: 'DB_005', // Query timeout
  DB_006: 'DB_006', // Transaction failed

  // Storage Errors
  STR_001: 'STR_001', // Storage upload failed
  STR_002: 'STR_002', // Storage file not found
  STR_003: 'STR_003', // Storage quota exceeded

  // Notification Errors
  NOTIF_001: 'NOTIF_001', // Notification not found
  NOTIF_002: 'NOTIF_002', // Notification send failed

  // Other
  EMAIL_001: 'EMAIL_001', // Email delivery failed
  VAL_001: 'VAL_001',     // Validation error

  // HTTP status
  HTTP_401: 'HTTP_401', // Unauthorized
  HTTP_403: 'HTTP_403', // Forbidden
  HTTP_404: 'HTTP_404', // Not Found
  HTTP_500: 'HTTP_500', // Internal Server Error
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
