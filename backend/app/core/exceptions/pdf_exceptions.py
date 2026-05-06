from app.core.exceptions.base import NyayaSetuHTTPException


class PDFTooLargeException(NyayaSetuHTTPException):
    error_code = "PDF_001"
    status_code = 413
    message = "PDF file exceeds maximum size of 20MB"


class InvalidFileTypeException(NyayaSetuHTTPException):
    error_code = "PDF_002"
    status_code = 415
    message = "Only PDF files are accepted"


class PDFCorruptedException(NyayaSetuHTTPException):
    error_code = "PDF_003"
    status_code = 422
    message = "The uploaded PDF appears to be corrupted or unreadable"


class PDFEncryptedException(NyayaSetuHTTPException):
    error_code = "PDF_004"
    status_code = 422
    message = "The PDF is password-protected. Please upload an unlocked version"


class PDFExtractionFailedException(NyayaSetuHTTPException):
    error_code = "PDF_005"
    status_code = 500
    message = "Failed to extract text from PDF. Please try again"


class PDFTextTooShortException(NyayaSetuHTTPException):
    error_code = "PDF_006"
    status_code = 422
    message = "Extracted text is too short. PDF may be image-only or blank"


class OCRFailedException(NyayaSetuHTTPException):
    error_code = "PDF_007"
    status_code = 500
    message = "OCR processing failed. Please try again"
