const nodemailer = require("nodemailer");
const dns = require("dns").promises;

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpSecure = process.env.SMTP_SECURE === "true";

  const ipv4Addresses = await dns.resolve4(smtpHost);

  if (!ipv4Addresses || ipv4Addresses.length === 0) {
    throw new Error(`No IPv4 address found for ${smtpHost}`);
  }

  const ipv4Address = ipv4Addresses[0];

  console.log(`SMTP IPv4 address: ${ipv4Address}`);

  transporter = nodemailer.createTransport({
    host: ipv4Address,
    port: smtpPort,
    secure: smtpSecure,

    tls: {
      servername: smtpHost,
    },

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });

  return transporter;
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("SMTP email configuration is missing.");
  }

  const mailTransporter = await createTransporter();

  await mailTransporter.sendMail({
    from: `"DriveNow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "DriveNow - Reset Your Password",

    text: `You requested a password reset for your DriveNow account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        background: #f8fafc;
      ">
        <div style="
          background: #ffffff;
          padding: 30px;
          border-radius: 12px;
        ">

          <h1 style="margin: 0 0 20px;">
            DriveNow
          </h1>

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
            This password reset link will expire in
            <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request this password reset,
            you can safely ignore this email.
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
