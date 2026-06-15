import nodemailer from 'nodemailer'

export const config = { maxDuration: 60 }

const FROM = '"NextEdge IT Training" <info@nextedgeforit.com>'

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@nextedgeforit.com',
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
})

function buildHtml(recipientName, body) {
  const htmlBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
      <div style="margin-bottom:6px;">
        <span style="display:inline-block;width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;font-size:18px;font-weight:700;color:#fff;line-height:40px;text-align:center;margin-right:10px;vertical-align:middle;">N</span>
        <span style="font-size:20px;font-weight:700;color:#ffffff;vertical-align:middle;letter-spacing:-0.3px;">NextEdge</span>
      </div>
      <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:4px 0 0;">IT Training School &nbsp;·&nbsp; Doha, Qatar</p>
    </div>

    <div style="padding:40px 40px 32px;">
      <p style="color:#475569;font-size:15px;margin:0 0 20px 0;">Dear <strong style="color:#1e293b;">${recipientName || 'Student'}</strong>,</p>
      <div style="color:#334155;font-size:15px;line-height:1.75;margin:0 0 32px 0;">${htmlBody}</div>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px 0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;line-height:1.7;">
        NextEdge IT Training School &nbsp;·&nbsp; Doha, Qatar<br>
        <a href="mailto:info@nextedgeforit.com" style="color:#6366f1;text-decoration:none;">info@nextedgeforit.com</a>
      </p>
    </div>
  </div>
  <p style="text-align:center;color:#cbd5e1;font-size:11px;margin:16px 0 32px;">You are receiving this because you are enrolled with NextEdge IT Training School.</p>
</body>
</html>`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { recipients, subject, body } = req.body ?? {}

  if (!Array.isArray(recipients) || recipients.length === 0)
    return res.status(400).json({ error: 'recipients array is required' })
  if (!subject?.trim())
    return res.status(400).json({ error: 'subject is required' })
  if (!body?.trim())
    return res.status(400).json({ error: 'body is required' })

  if (!process.env.SMTP_PASS)
    return res.status(500).json({ error: 'SMTP_PASS environment variable is not set in Vercel' })

  const results = await Promise.allSettled(
    recipients.map(({ name, email }) =>
      transporter.sendMail({
        from: FROM,
        to: `"${name}" <${email}>`,
        subject,
        text: `Dear ${name},\n\n${body}\n\n---\nNextEdge IT Training School\nDoha, Qatar\ninfo@nextedgeforit.com`,
        html: buildHtml(name, body),
      })
        .then(() => ({ email, name, success: true }))
        .catch(err => ({ email, name, success: false, error: err.message }))
    )
  )

  return res.status(200).json({
    results: results.map(r => r.value ?? r.reason),
  })
}
