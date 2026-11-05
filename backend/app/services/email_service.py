"""Outbound email delivery."""
import asyncio
import json
import re
import smtplib
import ssl
import urllib.error
import urllib.request
from email.message import EmailMessage

from app.core.config import settings

DEFAULT_SENDER_EMAIL = "noreply@ankitmohanty.in"


class EmailService:
    """Send account emails through a Resend template or the SMTP fallback."""

    @property
    def sender_email(self) -> str:
        """Use Watchloom's verified Resend domain, never a personal Gmail sender."""
        configured_email = (settings.smtp_from_email or "").strip()
        configured_domain = configured_email.rpartition("@")[2].lower()
        if configured_domain == "ankitmohanty.in":
            return configured_email
        return DEFAULT_SENDER_EMAIL

    @property
    def resend_api_key(self) -> str:
        """Use the REST key or the same Resend key already used as the SMTP password."""
        return (settings.resend_api_key or settings.smtp_password or "").strip()

    @property
    def smtp_is_configured(self) -> bool:
        return all(
            (
                settings.smtp_host,
                settings.smtp_username,
                settings.smtp_password,
                self.sender_email,
            )
        )

    @property
    def template_is_configured(self) -> bool:
        return bool(self.resend_api_key and settings.resend_otp_template_id)

    @property
    def template_requested(self) -> bool:
        return bool((settings.resend_otp_template_id or "").strip())

    @property
    def is_configured(self) -> bool:
        if self.template_requested:
            return self.template_is_configured
        return self.smtp_is_configured

    async def send_password_change_code(self, recipient: str, code: str) -> None:
        """Send a short-lived password change verification code."""
        if not self.is_configured:
            raise RuntimeError("Email delivery is not configured")
        if self.template_requested:
            await asyncio.to_thread(self._send_template_code, recipient, code)
            return
        if not self.smtp_is_configured:
            raise RuntimeError("SMTP email delivery is not configured")
        await asyncio.to_thread(self._send_password_change_code, recipient, code)

    async def send_email_verification_code(self, recipient: str, code: str) -> None:
        """Send a short-lived email ownership verification code."""
        if not self.is_configured:
            raise RuntimeError("Email delivery is not configured")
        if self.template_requested:
            await asyncio.to_thread(self._send_template_code, recipient, code)
            return
        if not self.smtp_is_configured:
            raise RuntimeError("SMTP email delivery is not configured")
        await asyncio.to_thread(self._send_email_verification_code, recipient, code)

    @staticmethod
    def _send_template_code(recipient: str, code: str) -> None:
        """Send an OTP with the account's published Resend template."""
        template_id = (settings.resend_otp_template_id or "").strip()
        payload = {
            "from": f"Watchloom <{EmailService().sender_email}>",
            "to": [recipient],
            "template": {
                "id": template_id,
                "variables": {"first_name": "there", "verification_code": code},
            },
        }
        request = urllib.request.Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {EmailService().resend_api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                # Resend's edge blocks Python's default urllib user agent with
                # Cloudflare error 1010. Identify the calling application.
                "User-Agent": "Watchloom/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                if not 200 <= response.status < 300:
                    raise RuntimeError(f"Resend rejected the template email (HTTP {response.status}).")
        except urllib.error.HTTPError as error:
            response_body = error.read(4096).decode("utf-8", errors="replace")
            provider_error = ""
            try:
                response_data = json.loads(response_body)
                provider_error = str(
                    response_data.get("message")
                    or response_data.get("error")
                    or response_data.get("name")
                    or ""
                )
            except (json.JSONDecodeError, AttributeError):
                pass

            # Provider responses can echo an address; keep logs useful without
            # recording recipient details or any credential-like values.
            provider_error = re.sub(
                r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
                "[email]",
                provider_error,
            )
            provider_error = re.sub(r"re_[A-Za-z0-9]+", "[redacted]", provider_error)
            detail = f"Resend rejected the template email (HTTP {error.code})"
            if provider_error:
                detail += f": {provider_error[:300]}"
            raise RuntimeError(detail) from error
        except urllib.error.URLError as error:
            raise RuntimeError("Could not connect to Resend to send the template email.") from error

    @staticmethod
    def _send_password_change_code(recipient: str, code: str) -> None:
        message = EmailMessage()
        message["Subject"] = "Your Watchloom password change code"
        message["From"] = f"Watchloom <{EmailService().sender_email}>"
        message["To"] = recipient
        message.set_content(
            "Use this code to change your Watchloom password:\n\n"
            f"{code}\n\n"
            "This code expires in 10 minutes and can only be used once. "
            "If you did not request this change, you can ignore this email."
        )

        EmailService._deliver(message)

    @staticmethod
    def _send_email_verification_code(recipient: str, code: str) -> None:
        message = EmailMessage()
        message["Subject"] = "Verify your Watchloom email"
        message["From"] = f"Watchloom <{EmailService().sender_email}>"
        message["To"] = recipient
        message.set_content(
            "Use this code to verify your Watchloom email address:\n\n"
            f"{code}\n\n"
            "This code expires in 10 minutes and can only be used once. "
            "If you did not request this, you can ignore this email."
        )
        EmailService._deliver(message)

    @staticmethod
    def _deliver(message: EmailMessage) -> None:
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
