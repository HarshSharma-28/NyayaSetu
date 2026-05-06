from app.core.exceptions.base import NyayaSetuHTTPException


class InvalidCredentialsException(NyayaSetuHTTPException):
    error_code = "AUTH_001"
    status_code = 401
    message = "Invalid NIC SSO ID or password"


class InvalidOTPException(NyayaSetuHTTPException):
    error_code = "AUTH_002"
    status_code = 401
    message = "Invalid or expired OTP"


class OTPExpiredException(NyayaSetuHTTPException):
    error_code = "AUTH_003"
    status_code = 401
    message = "OTP has expired. Please request a new one"


class TokenExpiredException(NyayaSetuHTTPException):
    error_code = "AUTH_004"
    status_code = 401
    message = "Session expired. Please login again"


class TokenInvalidException(NyayaSetuHTTPException):
    error_code = "AUTH_005"
    status_code = 401
    message = "Invalid authentication token"


class InsufficientPermissionsException(NyayaSetuHTTPException):
    error_code = "AUTH_006"
    status_code = 403
    message = "You do not have permission to perform this action"


class RoleMismatchException(NyayaSetuHTTPException):
    error_code = "AUTH_007"
    status_code = 403
    message = "Your role does not match the selected access type"


class AccountInactiveException(NyayaSetuHTTPException):
    error_code = "AUTH_008"
    status_code = 403
    message = "Your account has been deactivated. Contact your IT Cell"


class UserNotFoundException(NyayaSetuHTTPException):
    error_code = "AUTH_009"
    status_code = 404
    message = "No account found with this NIC SSO ID"


class RateLimitExceededException(NyayaSetuHTTPException):
    error_code = "AUTH_010"
    status_code = 429
    message = "Too many attempts. Please wait before trying again"
