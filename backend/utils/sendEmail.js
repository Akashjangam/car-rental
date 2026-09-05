const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("SMTP email configuration is missing.");
  }

  await transporter.sendMail({
    from: `"DriveNow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "DriveNow - Reset Your Password",
    text: `You requested a password reset for your DriveNow account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f8fafc;">
        <div style="background: #ffffff; padding: 30px; border-radius: 12px;">
          <h1 style="margin: 0 0 20px;">DriveNow</h1>

          <h2>Password Reset</h2>

          <p>
            You requested to reset the password for your DriveNow account.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background: #30AFFF;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This password reset link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request this password reset, you can safely ignore
            this email.
          </p>

          <p style="margin-top: 30px; color: #64748b;">
            DriveNow Car Rental
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendPasswordResetEmail;