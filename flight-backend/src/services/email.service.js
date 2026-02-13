import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT || 587),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.SMTP_FROM || process.env.SMTP_USER || 'info@mashrok.online',
  secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
};

const isConfigured = () =>
  Boolean(smtpConfig.host && smtpConfig.user && smtpConfig.pass && smtpConfig.from);

let cachedTransporter = null;

const getTransporter = () => {
  if (!isConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });
  return cachedTransporter;
};

export async function sendBookingEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('email_not_configured');
    return { ok: false, skipped: true };
  }
  if (!to) return { ok: false, skipped: true };
  await transporter.sendMail({
    from: smtpConfig.from,
    to,
    subject,
    html,
    text,
  });
  return { ok: true };
}
