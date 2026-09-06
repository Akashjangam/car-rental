const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  if (!email || !resetUrl) {
    throw new Error("Email address and reset URL are required.");
  }

  const { data, error } = await resend.emails.send({
    from: "DriveNow <onboarding@resend.dev>",
    to: [email],
    subject: "DriveNow - Reset Your Password",

    text: `You requested a password reset for your DriveNow account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, you can safely ignore this email.`,

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

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Failed to send password reset email.");
  }

  console.log("Password reset email sent:", data?.id);

  return data;
};

module.exports = sendPasswordResetEmail;