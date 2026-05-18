/**
 * Email Reminder Module
 * Handles subscription expiry reminders
 * MVP: Placeholder - ready for integration with email service
 */

import { prisma } from "@/lib/prisma";

export interface ReminderOptions {
  userId: string;
  subscriptionId: string;
  reminderType: "three_days_before" | "one_day_before" | "expiry_day";
  expiryDate: Date;
}

/**
 * Send subscription expiry reminder
 * MVP: Placeholder - will integrate with email service (Nodemailer, SendGrid, etc.)
 */
export async function sendExpiryReminder(
  options: ReminderOptions
): Promise<{ sent: boolean; messageId?: string }> {
  try {
    // MVP: Placeholder for actual email sending
    // In production, this would integrate with:
    // - Nodemailer (local SMTP)
    // - SendGrid (cloud)
    // - AWS SES
    // - Postmark
    // etc.

    console.log(`[REMINDER] ${options.reminderType} for user ${options.userId}`);

    // Log that reminder was sent
    await prisma.emailReminderLog.create({
      data: {
        userId: options.userId,
        subscriptionId: options.subscriptionId,
        reminderType: options.reminderType,
        sentAt: new Date(),
      },
    });

    return {
      sent: true,
      messageId: `reminder_${Date.now()}`,
    };
  } catch (error) {
    console.error("Error sending reminder:", error);
    return { sent: false };
  }
}

/**
 * Check if a reminder has already been sent in this period
 */
export async function hasReminderBeenSent(
  userId: string,
  reminderType: string
): Promise<boolean> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const log = await prisma.emailReminderLog.findFirst({
      where: {
        userId,
        reminderType,
        sentAt: {
          gte: today,
        },
      },
    });

    return !!log;
  } catch (error) {
    console.error("Error checking reminder status:", error);
    return false;
  }
}

/**
 * Batch send reminders to expiring subscriptions
 * This would be triggered by a cron job
 * MVP: Placeholder for actual implementation
 */
export async function sendBatchReminders(): Promise<{
  sent: number;
  failed: number;
}> {
  console.log("[BATCH REMINDERS] Job started");

  // MVP: This would be implemented in a cron job handler
  // that queries for subscriptions expiring in 3 days, 1 day, etc.

  return { sent: 0, failed: 0 };
}
