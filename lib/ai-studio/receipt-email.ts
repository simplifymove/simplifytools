import { Prisma } from '@prisma/client';
import { renderSimplifyConvertEmail, escapeHtml } from '@/lib/email/templates';
import { sendSmtpEmail } from '@/lib/email/smtp';
import { prisma } from '@/lib/prisma';

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatCredits(value: Prisma.Decimal | number) {
  const amount = value instanceof Prisma.Decimal ? value.toNumber() : value;

  return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatMoney(amountMinor: number, currency: string) {
  const majorAmount = amountMinor / 100;

  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2,
  }).format(majorAmount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

function getAppUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://simplifyconvert.com'
  ).replace(/\/$/, '');
}

function getPaymentReference(purchase: {
  providerPaymentId: string | null;
  providerCheckoutSessionId: string | null;
  providerOrderId: string | null;
}) {
  return (
    purchase.providerPaymentId ||
    purchase.providerCheckoutSessionId ||
    purchase.providerOrderId ||
    'Not available'
  );
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;color:#64748b;font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function renderReceiptEmail(input: {
  planName: string;
  creditsPurchased: string;
  amountPaid: string;
  currency: string;
  paymentProvider: string;
  paymentReference: string;
  purchaseDate: string;
  walletBalance?: string;
}) {
  const appUrl = `${getAppUrl()}/ai-studio`;
  const balanceRow = input.walletBalance
    ? detailRow('Current wallet balance', `${input.walletBalance} credits`)
    : '';

  const bodyHtml = `
    <p style="margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:700;">Thank you for your purchase</p>
    <p style="margin:0 0 22px;color:#475569;font-size:14px;line-height:1.7;">
      Your SimplifyConvert AI Studio credits have been added to your account.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin:0 0 24px;">
      ${detailRow('Plan name', input.planName)}
      ${detailRow('Credits purchased', input.creditsPurchased)}
      ${detailRow('Amount paid', input.amountPaid)}
      ${detailRow('Currency', input.currency)}
      ${detailRow('Payment provider', input.paymentProvider)}
      ${detailRow('Payment/order/session ID', input.paymentReference)}
      ${detailRow('Purchase date/time', input.purchaseDate)}
      ${balanceRow}
    </table>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${escapeHtml(appUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-size:14px;font-weight:700;">Open AI Studio</a>
    </p>
    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">
      Need help? Contact us at <a href="mailto:info@simplifyconvert.com" style="color:#0891b2;">info@simplifyconvert.com</a>.
    </p>
  `;

  return renderSimplifyConvertEmail({
    title: 'SimplifyConvert AI Studio',
    preheader: 'Thank you for your AI Studio purchase.',
    bodyHtml,
    footerHtml: '<p style="margin:0;">This is an automated email.</p>',
  });
}

export async function sendAiStudioPurchaseReceiptEmail(purchaseId: string) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "AiStudioPlanPurchase" WHERE id = ${purchaseId} FOR UPDATE`;

        const purchase = await tx.aiStudioPlanPurchase.findUnique({
          where: { id: purchaseId },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        });

        if (
          !purchase ||
          purchase.status !== 'paid' ||
          purchase.receiptEmailSentAt ||
          !purchase.user.email
        ) {
          return false;
        }

        const wallet = await tx.aiStudioWallet.findUnique({
          where: { userId: purchase.userId },
          select: {
            balanceCredits: true,
          },
        });

        const paymentReference = getPaymentReference(purchase);
        const html = renderReceiptEmail({
          planName: titleCase(purchase.planId),
          creditsPurchased: formatCredits(purchase.creditsGranted),
          amountPaid: formatMoney(purchase.grossAmountMinor, purchase.currency),
          currency: purchase.currency,
          paymentProvider: titleCase(purchase.provider),
          paymentReference,
          purchaseDate: formatDate(purchase.paidAt || purchase.createdAt),
          walletBalance: wallet
            ? formatCredits(wallet.balanceCredits)
            : undefined,
        });

        await sendSmtpEmail({
          to: purchase.user.email,
          subject: 'Your SimplifyConvert AI Studio receipt',
          html,
          text: [
            'SimplifyConvert AI Studio',
            'Thank you for your purchase.',
            `Plan name: ${titleCase(purchase.planId)}`,
            `Credits purchased: ${formatCredits(purchase.creditsGranted)}`,
            `Amount paid: ${formatMoney(purchase.grossAmountMinor, purchase.currency)}`,
            `Currency: ${purchase.currency}`,
            `Payment provider: ${titleCase(purchase.provider)}`,
            `Payment/order/session ID: ${paymentReference}`,
            `Purchase date/time: ${formatDate(purchase.paidAt || purchase.createdAt)}`,
            wallet
              ? `Current wallet balance: ${formatCredits(wallet.balanceCredits)} credits`
              : '',
            `Open AI Studio: ${getAppUrl()}/ai-studio`,
            'Support: info@simplifyconvert.com',
            'This is an automated email.',
          ]
            .filter(Boolean)
            .join('\n'),
          replyTo: 'info@simplifyconvert.com',
        });

        await tx.aiStudioPlanPurchase.update({
          where: { id: purchase.id },
          data: {
            receiptEmailSentAt: new Date(),
          },
        });

        return true;
      },
      {
        maxWait: 5000,
        timeout: 20000,
      },
    );
  } catch (error) {
    console.error(
      '[ai-studio-receipt-email] Failed to send purchase receipt:',
      {
        purchaseId,
        error: error instanceof Error ? error.message : error,
      },
    );

    return false;
  }
}
