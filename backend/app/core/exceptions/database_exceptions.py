from app.core.exceptions.base import NyayaSetuHTTPException


class DatabaseConnectionException(NyayaSetuHTTPException):
    error_code = "DB_001"
    status_code = 503
    message = "Database temporarily unavailable. Please try again"


class RecordNotFoundException(NyayaSetuHTTPException):
    error_code = "DB_002"
    status_code = 404
    message = "Record not found"


class DuplicateRecordException(NyayaSetuHTTPException):
    error_code = "DB_003"
    status_code = 409
    message = "Record already exists"


class TransactionFailedException(NyayaSetuHTTPException):
    error_code = "DB_004"
    status_code = 500
    message = "Database transaction failed. Changes rolled back"


class ForeignKeyViolationException(NyayaSetuHTTPException):
    error_code = "DB_005"
    status_code = 422
    message = "Referenced record does not exist"


class SoftDeleteViolationException(NyayaSetuHTTPException):
    error_code = "DB_006"
    status_code = 410
    message = "This record has been deleted"
