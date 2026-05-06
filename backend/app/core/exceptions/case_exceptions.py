from app.core.exceptions.base import NyayaSetuHTTPException


class CaseNotFoundException(NyayaSetuHTTPException):
    error_code = "CASE_001"
    status_code = 404
    message = "Case not found"


class CaseAlreadyExistsException(NyayaSetuHTTPException):
    error_code = "CASE_002"
    status_code = 409
    message = "A case with this number already exists"


class CaseNotAssignedException(NyayaSetuHTTPException):
    error_code = "CASE_003"
    status_code = 403
    message = "This case is not assigned to your department"


class CaseAlreadyVerifiedException(NyayaSetuHTTPException):
    error_code = "CASE_004"
    status_code = 409
    message = "This case has already been verified"


class CaseDeletedSoftlyException(NyayaSetuHTTPException):
    error_code = "CASE_005"
    status_code = 410
    message = "This case has been removed"


class InvalidCaseStatusTransitionException(NyayaSetuHTTPException):
    error_code = "CASE_006"
    status_code = 422
    message = "Invalid status transition for this case"
