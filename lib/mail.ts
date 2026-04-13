import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'softsols.pk',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER || 'noreply@softsols.pk',
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Handle various server certificate formats
  }
});

export const renderEmail = (title: string, content: string) => `
  <div style="font-family: 'Times New Roman', Times, serif; color: #002d5e; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #002d5e; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">PJPS</h1>
      <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">PAKISTAN JOURNAL OF PHARMACEUTICAL SCIENCES</p>
    </div>
    <div style="padding: 40px; line-height: 1.6;">
      <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 25px;">${title}</h2>
      <div style="color: #334155; font-size: 15px;">
        ${content}
      </div>
    </div>
    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold;">OFFICIAL PJPS COMMUNICATION</p>
      <p style="margin: 5px 0; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Pakistan Journal of Pharmaceutical Sciences. All rights reserved.<br/>
        Developed by <a href="https://softsols.pk/" style="color: #002d5e; text-decoration: none; font-weight: bold;">Softsols Pakistan</a>
      </p>
    </div>
  </div>
`;

export const sendEmail = async ({ 
  to, 
  subject, 
  html, 
  title,
  attachments
}: { 
  to: string; 
  subject: string; 
  html: string; 
  title?: string;
  attachments?: any[];
}) => {
  try {
    const finalHtml = title ? renderEmail(title, html) : html;
    const info = await transporter.sendMail({
      from: `"PJPS" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@softsols.pk'}>`,
      to,
      subject,
      html: finalHtml,
      attachments
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
