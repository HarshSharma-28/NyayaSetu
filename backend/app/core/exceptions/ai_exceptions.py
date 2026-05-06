from app.core.exceptions.base import NyayaSetuHTTPException, NyayaSetuBaseException


class GeminiAPIException(NyayaSetuHTTPException):
    error_code = "AI_001"
    status_code = 503
    message = "AI extraction service temporarily unavailable"


class GeminiQuotaExceededException(NyayaSetuHTTPException):
    error_code = "AI_002"
    status_code = 429
    message = "AI service quota exceeded. Using cached response"


class AIResponseParseException(NyayaSetuHTTPException):
    error_code = "AI_003"
    status_code = 500
    message = "AI returned an unreadable response"


class AILowConfidenceWarning(NyayaSetuBaseException):
    # NOT an HTTP exception — internal warning only
    error_code = "AI_004"
    message = "AI confidence is low. Manual review strongly recommended"


class JudgmentDNAIncompleteException(NyayaSetuHTTPException):
    error_code = "AI_005"
    status_code = 422
    message = "Could not extract required fields from judgment"
