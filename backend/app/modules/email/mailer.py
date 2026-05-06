import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from string import Template
from app.core.config import settings
from app.core.logger import app_logger
from app.core.exceptions.notification_exceptions import (
    EmailDeliveryFailedException
)

class EmailService:
    """
    Sends HTML emails via SMTP for the NyayaSetu platform.
    ALL failures raise EmailDeliveryFailedException for explicit handling.
    Does NOT crash the calling API endpoint.
    """
    
    def _load_template(self, name: str) -> Template:
        path = Path(__file__).parent / "templates" / name
        if not path.exists():
            app_logger.error(f"[Email] Template not found: {path}")
            raise EmailDeliveryFailedException(
                details={"template": name, "reason": "Template file not found"}
            )
        return Template(path.read_text(encoding='utf-8'))
    
    def _send(self, to: str, subject: str, html: str) -> None:
        if not settings.SMTP_HOST or not settings.SMTP_USER:
            app_logger.warning(
                f"[Email] SMTP not configured — skipping email to {to}"
            )
            return
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = to
            msg.attach(MIMEText(html, 'html', 'utf-8'))
            
            # Connection logic
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.ENVIRONMENT != "development":
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, [to], msg.as_string())
            
            app_logger.info(f"[Email] Sent '{subject}' to {to}")
        
        except smtplib.SMTPException as exc:
            app_logger.error(f"[Email] SMTP error sending to {to}: {exc}")
            raise EmailDeliveryFailedException(
                details={"to": to, "subject": subject, "smtp_error": str(exc)}
            )
        except Exception as exc:
            app_logger.error(f"[Email] Unexpected error sending to {to}: {exc}")
            raise EmailDeliveryFailedException(
                details={"to": to, "subject": subject, "error": str(exc)}
            )
    
    def send_otp(self, to: str, otp: str, name: str) -> None:
        """Sends an authentication OTP email."""
        html = self._load_template("otp_email.html").substitute(
            NAME=name, OTP=otp, 
            YEAR=datetime.now().year if 'datetime' in globals() else 2024,
            PRODUCT="NyayaSetu"
        )
        self._send(to, f"NyayaSetu OTP: {otp}", html)
    
    def send_deadline_alert(
        self, to: str, name: str,
        case_number: str, due_date: str, days_left: int
    ) -> None:
        """Sends an alert for upcoming compliance deadlines."""
        urgency = "CRITICAL" if days_left <= 3 else "URGENT" if days_left <= 7 else "REMINDER"
        html = self._load_template("deadline_alert.html").substitute(
            NAME=name, CASE_NUMBER=case_number,
            DUE_DATE=due_date, DAYS_LEFT=days_left,
            URGENCY=urgency
        )
        self._send(
            to,
            f"⚠️ [{urgency}] NyayaSetu Deadline: {case_number}",
            html
        )
    
    def send_overdue_alert(
        self, to: str, name: str,
        case_number: str, due_date: str
    ) -> None:
        """Sends a high-priority alert for overdue directives."""
        html = self._load_template("overdue_alert.html").substitute(
            NAME=name, CASE_NUMBER=case_number, DUE_DATE=due_date
        )
        self._send(
            to,
            f"🚨 OVERDUE: NyayaSetu Action Required — {case_number}",
            html
        )
    
    def send_welcome(self, to: str, name: str, role: str) -> None:
        """Sends a welcome email to newly onboarded government users."""
        html = self._load_template("welcome_email.html").substitute(
            NAME=name, ROLE=role.title()
        )
        self._send(
            to,
            "Welcome to NyayaSetu — Bridge of Justice",
            html
        )

# Singleton instance
from datetime import datetime
email_service = EmailService()
