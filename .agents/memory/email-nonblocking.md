---
name: Email non-blocking
description: Nodemailer email sends in enquiry route are fire-and-forget
---

In the enquiry POST handler, sendEnquiryEmail() is called with .catch() only — not awaited.
This means the HTTP response (with whatsappUrl) is returned immediately without waiting for Gmail.
MAIL_USERNAME and MAIL_PASSWORD are optional — if absent, the email is skipped silently with a logger.warn.

**Why:** WhatsApp redirect needs to happen instantly. Email delivery latency (or failure) must not block the user flow.
**How to apply:** Any background notification (email, SMS) should follow this pattern — fire-and-forget with error logging, not awaited in the handler.
