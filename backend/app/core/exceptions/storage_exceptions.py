from app.core.exceptions.base import NyayaSetuHTTPException


class FileUploadFailedException(NyayaSetuHTTPException):
    error_code = "STR_001"
    status_code = 500
    message = "Failed to upload file to storage"


class FileNotFoundException(NyayaSetuHTTPException):
    error_code = "STR_002"
    status_code = 404
    message = "File not found in storage"


class StorageQuotaExceededException(NyayaSetuHTTPException):
    error_code = "STR_003"
    status_code = 507
    message = "Storage quota exceeded"
