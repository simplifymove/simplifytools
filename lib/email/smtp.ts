import nodemailer from 'nodemailer';

interface SendSmtpEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getSmtpPort() {
  return Number.parseInt(process.env.SMTP_PORT || '587', 10);
}

export function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
  );
}

function getSmtpTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: getSmtpPort(),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

export async function sendSmtpEmail(options: SendSmtpEmailOptions) {
  if (!hasSmtpConfig()) {
    throw new Error('SMTP configuration is missing');
  }

  return getSmtpTransporter().sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_FROM ||
      'info@simplifyconvert.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
}
