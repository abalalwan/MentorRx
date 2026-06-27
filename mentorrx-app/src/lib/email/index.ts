import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "noreply@mentorrx.com";

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key") {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[Email] Send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception:", message);
    return { success: false, error: message };
  }
}

// Booking confirmed — to mentee
export async function sendBookingConfirmedMentee(params: {
  to: string;
  menteeName: string;
  mentorName: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  amount: string;
  meetingUrl: string | null;
  bookingId: string;
}) {
  const { html, text } = bookingConfirmedMenteeTemplate(params);
  return sendEmail({
    to: params.to,
    subject: "Your MentorRx session is confirmed!",
    html,
    text,
  });
}

// New booking — to mentor
export async function sendNewBookingMentor(params: {
  to: string;
  mentorName: string;
  menteeName: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  amount: string;
  bookingId: string;
}) {
  const { html, text } = newBookingMentorTemplate(params);
  return sendEmail({
    to: params.to,
    subject: `New session booked with ${params.menteeName}`,
    html,
    text,
  });
}

// Booking cancelled
export async function sendBookingCancelledEmail(params: {
  to: string;
  recipientName: string;
  sessionDate: string;
  startTime: string;
  reason?: string;
}) {
  const { html, text } = bookingCancelledTemplate(params);
  return sendEmail({
    to: params.to,
    subject: "Session Cancelled — MentorRx",
    html,
    text,
  });
}

// Review request — to mentee after session
export async function sendReviewRequestEmail(params: {
  to: string;
  menteeName: string;
  mentorName: string;
  bookingId: string;
}) {
  const { html, text } = reviewRequestTemplate(params);
  return sendEmail({
    to: params.to,
    subject: `How was your session with ${params.mentorName}?`,
    html,
    text,
  });
}

// ── Templates ──────────────────────────────────────────────────────────────

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MentorRx</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Mentor<span style="color:#93c5fd;">Rx</span></h1>
            <p style="color:#bfdbfe;margin:4px 0 0;font-size:14px;">Healthcare & Pharma Mentorship</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} MentorRx. All rights reserved.<br>
              You&rsquo;re receiving this because you have an account at MentorRx.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function bookingConfirmedMenteeTemplate(p: {
  menteeName: string;
  mentorName: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  amount: string;
  meetingUrl: string | null;
  bookingId: string;
}) {
  const body = `
    <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Your session is confirmed! 🎉</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;">Hi ${p.menteeName}, your mentorship session has been booked and payment confirmed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;width:40%;">Mentor</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.mentorName}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Date</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.sessionDate}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Time</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.startTime} (${p.durationMinutes} min)</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Amount Paid</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.amount}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${p.meetingUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>
        <a href="${p.meetingUrl}" style="display:block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">Join Video Session</a>
      </td></tr>
    </table>
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 24px;">Save this link — you'll need it to join the session.</p>` : ""}

    <p style="color:#64748b;font-size:14px;margin:0;">
      You can view your booking details in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mentee/bookings" style="color:#2563eb;text-decoration:none;">dashboard</a>.
    </p>`;

  const text = `Your MentorRx session is confirmed!\n\nMentor: ${p.mentorName}\nDate: ${p.sessionDate}\nTime: ${p.startTime} (${p.durationMinutes} min)\nAmount: ${p.amount}\n${p.meetingUrl ? `\nMeeting link: ${p.meetingUrl}\n` : ""}`;

  return { html: emailWrapper(body), text };
}

function newBookingMentorTemplate(p: {
  mentorName: string;
  menteeName: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  amount: string;
  bookingId: string;
}) {
  const body = `
    <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">New session booked 📅</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;">Hi ${p.mentorName}, ${p.menteeName} has booked a session with you.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;width:40%;">Mentee</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.menteeName}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Date</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.sessionDate}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Time</td>
            <td style="color:#1e293b;font-size:14px;font-weight:600;padding:6px 0;">${p.startTime} (${p.durationMinutes} min)</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding:6px 0;">Your Earnings</td>
            <td style="color:#059669;font-size:14px;font-weight:700;padding:6px 0;">${p.amount}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/mentor" style="display:block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">View Dashboard</a>
      </td></tr>
    </table>`;

  const text = `New session booked!\n\nMentee: ${p.menteeName}\nDate: ${p.sessionDate}\nTime: ${p.startTime} (${p.durationMinutes} min)\nYour Earnings: ${p.amount}`;

  return { html: emailWrapper(body), text };
}

function bookingCancelledTemplate(p: {
  recipientName: string;
  sessionDate: string;
  startTime: string;
  reason?: string;
}) {
  const body = `
    <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Session Cancelled</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;">Hi ${p.recipientName}, the following session has been cancelled.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <p style="color:#1e293b;font-size:14px;margin:0 0 8px;"><strong>Date:</strong> ${p.sessionDate}</p>
        <p style="color:#1e293b;font-size:14px;margin:0 0 8px;"><strong>Time:</strong> ${p.startTime}</p>
        ${p.reason ? `<p style="color:#64748b;font-size:14px;margin:0;"><strong>Reason:</strong> ${p.reason}</p>` : ""}
      </td></tr>
    </table>

    <p style="color:#64748b;font-size:14px;">
      If you have any questions, visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#2563eb;text-decoration:none;">dashboard</a> or contact support.
    </p>`;

  const text = `Session Cancelled\n\nHi ${p.recipientName}, the session on ${p.sessionDate} at ${p.startTime} has been cancelled.${p.reason ? `\nReason: ${p.reason}` : ""}`;

  return { html: emailWrapper(body), text };
}

function reviewRequestTemplate(p: {
  menteeName: string;
  mentorName: string;
  bookingId: string;
}) {
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reviews/new/${p.bookingId}`;
  const body = `
    <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">How was your session? ⭐</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:15px;">Hi ${p.menteeName}, your session with <strong>${p.mentorName}</strong> is complete. Share your experience to help others find great mentors.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>
        <a href="${reviewUrl}" style="display:block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">Leave a Review</a>
      </td></tr>
    </table>

    <p style="color:#94a3b8;font-size:13px;text-align:center;">This is optional but greatly appreciated by the community.</p>`;

  const text = `How was your session with ${p.mentorName}?\n\nLeave a review: ${reviewUrl}`;

  return { html: emailWrapper(body), text };
}
