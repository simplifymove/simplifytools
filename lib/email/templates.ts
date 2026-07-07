export function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface BrandedEmailTemplateOptions {
  title: string;
  preheader: string;
  bodyHtml: string;
  footerHtml?: string;
}

export function renderSimplifyConvertEmail({
  title,
  preheader,
  bodyHtml,
  footerHtml,
}: BrandedEmailTemplateOptions) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f7f8fb;color:#0f172a;font-family:Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f8fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0f172a;padding:24px;color:#ffffff;">
                <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#67e8f9;">SimplifyConvert</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
                ${footerHtml || '<p style="margin:0;">This is an automated email.</p>'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
