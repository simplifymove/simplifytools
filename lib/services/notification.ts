// lib/services/notification.ts
// Notification service - Email, Slack, Discord support

import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export interface NotificationPayload {
  type?: 'email' | 'slack' | 'discord';
  success?: boolean;
  subject?: string;
  message?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  commandError?: string;
  results: {
    total: number;
    passed: number;
    failed: number;
    errors: number;
    success: number | string;
    expectedTools?: number;
    completedTools?: number;
  };
}

// Configure email transporter
let emailTransporter: nodemailer.Transporter | null = null;

function getEmailTransporter(): nodemailer.Transporter {
  if (emailTransporter) {
    return emailTransporter;
  }

  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return emailTransporter;
}

// Send email notification
export async function sendEmailNotification(
  recipient: string,
  payload: NotificationPayload,
  auditJobId: string,
): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();

    const statusColor = payload.success ? '#22c55e' : '#ef4444';
    const statusText = payload.success ? 'PASSED ✓' : 'FAILED ✗';
    const commandErrorHtml = payload.commandError
      ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-weight: bold; margin-bottom: 6px;">Audit command failed before completing tool checks</div>
            <div style="font-size: 13px; line-height: 1.5;">${payload.commandError}</div>
          </div>
        `
      : '';
    const expectedToolsHtml = typeof payload.results.expectedTools === 'number'
      ? `
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Expected Tools</div>
              <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${payload.results.expectedTools}</div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Completed Tools</div>
              <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${payload.results.completedTools ?? payload.results.total}</div>
            </div>
        `
      : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Audit Test Report</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">SimplifyConvert QA Dashboard</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <div style="background: ${statusColor}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-size: 18px; font-weight: bold;">
            Status: ${statusText}
          </div>

          ${commandErrorHtml}
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            ${expectedToolsHtml}
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Total Tests</div>
              <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${payload.results.total}</div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Passed</div>
              <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${payload.results.passed}</div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Failed</div>
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${payload.results.failed}</div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Errors</div>
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${payload.results.errors}</div>
            </div>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Success Rate</div>
            <div style="height: 30px; background: #e5e7eb; border-radius: 15px; overflow: hidden;">
              <div style="height: 100%; background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); width: ${payload.results.success}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                ${payload.results.success}%
              </div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/audit-testing" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View Full Report
            </a>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
            <p>Job ID: ${auditJobId}</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@simplifyconvert.com',
      to: recipient,
      subject: `[${payload.success ? 'PASSED' : 'FAILED'}] SimplifyConvert Audit Report`,
      html,
    });

    // Log notification
    await prisma.notificationLog.create({
      data: {
        auditJobId,
        type: 'email',
        recipient,
        status: 'sent',
        message: `Email sent successfully. Message ID: ${info.messageId}`,
      },
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Log failure
    await prisma.notificationLog.create({
      data: {
        auditJobId,
        type: 'email',
        recipient,
        status: 'failed',
        errorMessage: message,
      },
    }).catch(() => {
      // Ignore DB error if it occurs
    });

    console.error('Failed to send email notification:', error);
    return false;
  }
}

// Send Slack notification
export async function sendSlackNotification(
  webhookUrl: string,
  payload: NotificationPayload,
  auditJobId: string,
): Promise<boolean> {
  try {
    const color = payload.success ? '#22c55e' : '#ef4444';

    const message = {
      attachments: [
        {
          color,
          title: 'SimplifyConvert Audit Test Report',
          title_link: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/audit-testing`,
          fields: [
            {
              title: 'Status',
              value: payload.success ? '✓ PASSED' : '✗ FAILED',
              short: true,
            },
            {
              title: 'Total Tests',
              value: `${payload.results.total}`,
              short: true,
            },
            {
              title: 'Passed',
              value: `${payload.results.passed}`,
              short: true,
            },
            {
              title: 'Failed',
              value: `${payload.results.failed}`,
              short: true,
            },
            {
              title: 'Errors',
              value: `${payload.results.errors}`,
              short: true,
            },
            {
              title: 'Success Rate',
              value: `${payload.results.success}%`,
              short: true,
            },
          ],
          footer: `Job ID: ${auditJobId}`,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook returned ${response.status}`);
    }

    await prisma.notificationLog.create({
      data: {
        auditJobId,
        type: 'slack',
        recipient: webhookUrl,
        status: 'sent',
        message: 'Slack notification sent successfully',
      },
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await prisma.notificationLog.create({
      data: {
        auditJobId,
        type: 'slack',
        recipient: webhookUrl,
        status: 'failed',
        errorMessage: message,
      },
    }).catch(() => {
      // Ignore DB error
    });

    console.error('Failed to send Slack notification:', error);
    return false;
  }
}

// Send Discord notification
export async function sendDiscordNotification(
  webhookUrl: string,
  payload: NotificationPayload,
  auditJobId: string,
): Promise<boolean> {
  try {
    const color = payload.success ? 34543 : 15548997; // Green : Red in decimal

    const embed = {
      title: 'SimplifyConvert Audit Report',
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/audit-testing`,
      color,
      fields: [
        {
          name: 'Status',
          value: payload.success ? '✓ PASSED' : '✗ FAILED',
          inline: true,
        },
        {
          name: 'Total',
          value: `${payload.results.total}`,
          inline: true,
        },
        {
          name: 'Passed',
          value: `${payload.results.passed}`,
          inline: true,
        },
        {
          name: 'Failed',
          value: `${payload.results.failed}`,
          inline: true,
        },
        {
          name: 'Errors',
          value: `${payload.results.errors}`,
          inline: true,
        },
        {
          name: 'Success Rate',
          value: `${payload.results.success}%`,
          inline: true,
        },
      ],
      footer: {
        text: `Job ID: ${auditJobId}`,
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook returned ${response.status}`);
    }

    await prisma.notificationLog.create({
      data: {
        auditJobId,
        type: 'discord',
        recipient: webhookUrl,
        status: 'sent',
        message: 'Discord notification sent successfully',
      },
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await prisma.notificationLog.create({
      data: {
        auditJobId,
        type: 'discord',
        recipient: webhookUrl,
        status: 'failed',
        errorMessage: message,
      },
    }).catch(() => {
      // Ignore DB error
    });

    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

// Main notification function
export async function createNotification(
  auditJobId: string,
  userId: string,
  payload: NotificationPayload,
): Promise<void> {
  try {
    // Get user preferences (would normally come from a notification settings table)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.email) {
      console.warn(`User ${userId} has no email address`);
      return;
    }

    // Send email notification
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      await sendEmailNotification(user.email, payload, auditJobId);
    }

    // Send Slack if webhook configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackNotification(process.env.SLACK_WEBHOOK_URL, payload, auditJobId);
    }

    // Send Discord if webhook configured
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(process.env.DISCORD_WEBHOOK_URL, payload, auditJobId);
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export default {
  sendEmailNotification,
  sendSlackNotification,
  sendDiscordNotification,
  createNotification,
};
