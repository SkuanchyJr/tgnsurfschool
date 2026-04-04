import nodemailer from "nodemailer";

// ─────────────────────────────────────────────
// Singleton SMTP Transporter
// ─────────────────────────────────────────────
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}

// ─────────────────────────────────────────────
// HTML Email Template Wrapper
// ─────────────────────────────────────────────
function emailTemplate(body: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>TGN Surf School</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;">
<tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
            <td style="background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%);padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                    🏄 TGN Surf School
                </h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;">
                    Tarragona · Escuela de Surf
                </p>
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
            <td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                    TGN Surf School · Tarragona, España<br/>
                    <a href="https://tgnsurfschool.com" style="color:#3F7FE3;text-decoration:none;font-weight:600;">tgnsurfschool.com</a>
                </p>
                <p style="margin:8px 0 0;color:#cbd5e1;font-size:11px;">
                    Este email fue enviado automáticamente. Por favor no respondas directamente.
                </p>
            </td>
        </tr>
    </table>
</td></tr>
</table>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Styled elements for email bodies
// ─────────────────────────────────────────────
export function emailHeading(text: string): string {
    return `<h2 style="margin:0 0 16px;color:#0F172A;font-size:22px;font-weight:800;">${text}</h2>`;
}

export function emailParagraph(text: string): string {
    return `<p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.7;">${text}</p>`;
}

export function emailInfoBox(items: { label: string; value: string }[]): string {
    const rows = items.map(i =>
        `<tr>
            <td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;white-space:nowrap;">${i.label}</td>
            <td style="padding:10px 16px;color:#0F172A;font-size:14px;font-weight:700;">${i.value}</td>
        </tr>`
    ).join("");
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;">
        ${rows}
    </table>`;
}

export function emailButton(text: string, url: string): string {
    return `<div style="text-align:center;margin:28px 0 8px;">
        <a href="${url}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#3F7FE3,#1E3A8A);color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;box-shadow:0 4px 12px rgba(63,127,227,0.3);">
            ${text}
        </a>
    </div>`;
}

export function emailDivider(): string {
    return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;
}

// ─────────────────────────────────────────────
// Core send function — SMTP via nodemailer
// ─────────────────────────────────────────────
export async function sendEmail(
    to: string,
    subject: string,
    bodyHtml: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const transport = getTransporter();
        await transport.sendMail({
            from: process.env.SMTP_FROM || "TGN Surf School <info@tgnsurfschool.com>",
            to,
            subject,
            html: emailTemplate(bodyHtml),
        });
        return { success: true };
    } catch (err: any) {
        console.error("[sendEmail] Error:", err.message);
        return { success: false, error: err.message };
    }
}
