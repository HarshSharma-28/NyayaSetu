from app.core.exceptions.base import NyayaSetuHTTPException, NyayaSetuBaseException


class NotificationNotFoundException(NyayaSetuHTTPException):
    error_code = "NOTIF_001"
    status_code = 404
    message = "Notification not found"


class NotificationDeliveryFailedException(NyayaSetuBaseException):
    # Internal only — do not fail the request
    error_code = "NOTIF_002"
    message = "Failed to deliver notification"


class EmailDeliveryFailedException(NyayaSetuBaseException):
    # Internal only
    error_code = "EMAIL_001"
    message = "Failed to send email notification"
