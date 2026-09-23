import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an OTP email to a user for account verification.
 */
export const sendOtpEmail = async (email, otp) => {
  const fromName = process.env.FROM_NAME || "TruthScan AI";
  const fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || "no-reply@truthscan.ai";

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: `Your TruthScan AI Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #F5F1E8; padding: 24px; color: #111111;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 2px solid #111111; padding: 32px; box-shadow: 4px 4px 0px #111111;">
          <h2 style="font-size: 24px; font-weight: bold; text-transform: uppercase; margin-top: 0; color: #111111; border-bottom: 2px solid #111111; padding-bottom: 12px;">
            TruthScan AI
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #333333;">
            Hello investigator,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #333333;">
            Use the following 6-digit verification code to activate your account clearance. This code will expire in <strong>5 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #B7FF3C; border: 2px solid #111111; padding: 12px 24px; box-shadow: 3px 3px 0px #111111; color: #111111;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 12px; color: #666666; line-height: 1.5; border-top: 1px solid #eeeeee; padding-top: 16px;">
            If you did not request this verification code, please disregard this email.
          </p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] OTP email dispatched to ${email}, messageId: ${info.messageId}`);
  return info;
};

export default { sendOtpEmail };
