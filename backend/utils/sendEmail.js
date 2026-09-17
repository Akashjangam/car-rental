require("dotenv").config();

const nodemailer = require("nodemailer");

/* =========================================================
   GMAIL SMTP CONFIGURATION
========================================================= */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";

const SMTP_PORT = Number(process.env.SMTP_PORT || 465);

const SMTP_SECURE = String(process.env.SMTP_SECURE).toLowerCase() === "true";

const SMTP_USER = process.env.SMTP_USER;

const SMTP_PASS = process.env.SMTP_PASS;

/* =========================================================
   CREATE TRANSPORTER
========================================================= */

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,

  port: SMTP_PORT,

  secure: SMTP_SECURE,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/* =========================================================
   SEND PASSWORD RESET EMAIL
========================================================= */

const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER or SMTP_PASS is missing.");
  }

  if (!email || !resetUrl) {
    throw new Error("Email address and reset URL are required.");
  }

  try {
    console.log("========================================");

    console.log("PASSWORD RESET EMAIL");

    console.log("========================================");

    console.log("Sending password reset email to:", email);

    const info = await transporter.sendMail({
      from: `"DriveNow" <${SMTP_USER}>`,

      to: email,

      subject: "DriveNow - Reset Your Password",

      text: `You requested a password reset for your DriveNow account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.`,

      html: `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>DriveNow - Reset Your Password</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f9fc;
    font-family:Arial,Helvetica,sans-serif;
    color:#172033;
  "
>

  <div
    style="
      width:100%;
      padding:40px 15px;
      box-sizing:border-box;
    "
  >

    <div
      style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border:1px solid #e5edf4;
        border-radius:16px;
        overflow:hidden;
      "
    >

      <!-- HEADER -->

      <div
        style="
          padding:28px 30px;
          border-bottom:1px solid #e5edf4;
          background:#ffffff;
        "
      >

        <div
          style="
            font-size:24px;
            font-weight:700;
            color:#111827;
          "
        >
          Drive<span style="color:#0ea5e9;">Now</span>
        </div>

        <div
          style="
            margin-top:6px;
            font-size:13px;
            color:#64748b;
          "
        >
          Car Rental
        </div>

      </div>

      <!-- CONTENT -->

      <div style="padding:30px;">

        <h2
          style="
            margin:0 0 20px;
            color:#111827;
          "
        >
          Password Reset
        </h2>

        <p
          style="
            color:#475569;
            line-height:1.7;
          "
        >
          You requested to reset the password
          for your DriveNow account.
        </p>

        <p
          style="
            color:#475569;
            line-height:1.7;
          "
        >
          Click the button below to create
          a new password:
        </p>

        <p style="margin:30px 0;">

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 24px;
              background:#30AFFF;
              color:#ffffff;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

        </p>

        <p
          style="
            color:#475569;
            line-height:1.7;
          "
        >
          This password reset link will expire
          in <strong>15 minutes</strong>.
        </p>

        <p
          style="
            color:#475569;
            line-height:1.7;
          "
        >
          If you did not request this password
          reset, you can safely ignore this email.
        </p>

        <p
          style="
            margin-top:30px;
            color:#64748b;
          "
        >
          DriveNow Car Rental
        </p>

      </div>

      <!-- FOOTER -->

      <div
        style="
          padding:22px 30px;
          border-top:1px solid #e5edf4;
          background:#f8fbfd;
          color:#64748b;
          font-size:12px;
          line-height:1.6;
        "
      >

        <div>
          © ${new Date().getFullYear()} DriveNow.
          All rights reserved.
        </div>

        <div style="margin-top:5px;">
          Thank you for choosing DriveNow.
        </div>

      </div>

    </div>

  </div>

</body>

</html>
`,
    });

    console.log("Password reset email sent successfully.");

    console.log("Message ID:", info?.messageId || "N/A");

    console.log("========================================");

    return info;
  } catch (error) {
    console.error("========================================");

    console.error("PASSWORD RESET EMAIL ERROR");

    console.error("========================================");

    console.error("Message:", error.message);

    console.error("Code:", error.code || "N/A");

    console.error("Command:", error.command || "N/A");

    console.error("Response:", error.response || "N/A");

    console.error("========================================");

    throw new Error(error.message || "Failed to send password reset email.");
  }
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = sendPasswordResetEmail;
