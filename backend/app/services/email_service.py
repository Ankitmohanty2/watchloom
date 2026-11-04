"""Outbound email delivery."""
import asyncio
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings


class EmailService:
    """Send account emails using the configured SMTP relay."""

    @property
    def is_configured(self) -> bool:
        return all(
            (
                settings.smtp_host,
                settings.smtp_username,
                settings.smtp_password,
                settings.smtp_from_email,
            )
        )

    async def send_password_change_code(self, recipient: str, code: str) -> None:
        """Send a short-lived password change verification code."""
        if not self.is_configured:
            raise RuntimeError("Email delivery is not configured")
        await asyncio.to_thread(self._send_password_change_code, recipient, code)

    @staticmethod
    def _send_password_change_code(recipient: str, code: str) -> None:
        message = EmailMessage()
        message["Subject"] = "Your Watchloom password change code"
        message["From"] = f"Watchloom <{settings.smtp_from_email}>"
        message["To"] = recipient
        message.set_content(
            "Use this code to change your Watchloom password:\n\n"
            f"{code}\n\n"
            "This code expires in 10 minutes and can only be used once. "
            "If you did not request this change, you can ignore this email."
        )

        tls_context = ssl.create_default_context()
        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(
                settings.smtp_host,
                settings.smtp_port,
                timeout=15,
                context=tls_context,
            ) as server:
                if settings.smtp_username and settings.smtp_password:
                    server.login(settings.smtp_username, settings.smtp_password)
                server.send_message(message)
            return

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.ehlo()
            if settings.smtp_starttls:
                server.starttls(context=tls_context)
                server.ehlo()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
