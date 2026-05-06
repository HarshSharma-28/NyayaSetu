from app.core.exceptions.base import NyayaSetuHTTPException


class DirectiveNotFoundException(NyayaSetuHTTPException):
    error_code = "DIR_001"
    status_code = 404
    message = "Directive not found"


class DirectiveAlreadyVerifiedException(NyayaSetuHTTPException):
    error_code = "DIR_002"
    status_code = 409
    message = "This directive has already been verified"


class DirectiveRejectionReasonMissingException(NyayaSetuHTTPException):
    error_code = "DIR_003"
    status_code = 422
    message = "A reason is required when rejecting a directive"


class InvalidDirectiveStatusException(NyayaSetuHTTPException):
    error_code = "DIR_004"
    status_code = 422
    message = "Invalid directive status"


class DirectiveUpdateNotAllowedException(NyayaSetuHTTPException):
    error_code = "DIR_005"
    status_code = 403
    message = "You cannot update a directive in its current state"
