require("dotenv").config();

/* =========================================================
   BREVO EMAIL API CONFIGURATION
========================================================= */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL;

const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || "DriveNow";

/* =========================================================
   CHECK BREVO CONFIGURATION
========================================================= */

console.log("========== BREVO EMAIL CONFIG ==========");

console.log("BREVO_API_KEY configured:", Boolean(BREVO_API_KEY));

console.log("BREVO_FROM_EMAIL:", BREVO_FROM_EMAIL || "NOT CONFIGURED");

console.log("BREVO_FROM_NAME:", BREVO_FROM_NAME);

console.log("========================================");

/* =========================================================
   SEND EMAIL THROUGH BREVO HTTPS API
========================================================= */

const sendEmail = async ({ to, subject, html }) => {
  if (!BREVO_API_KEY) {
    console.error("Brevo email error: BREVO_API_KEY is not configured.");

    return null;
  }

  if (!BREVO_FROM_EMAIL) {
    console.error("Brevo email error: BREVO_FROM_EMAIL is not configured.");

    return null;
  }

  if (!to) {
    console.error("Brevo email error: recipient email is missing.");

    return null;
  }

  try {
    console.log(`Sending email to ${to} through Brevo HTTPS API...`);

    const response = await fetch(BREVO_API_URL, {
      method: "POST",

      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },

      body: JSON.stringify({
        sender: {
          name: BREVO_FROM_NAME,
          email: BREVO_FROM_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent: html,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("=============================================");

      console.error("BREVO EMAIL ERROR");

      console.error("=============================================");

      console.error("HTTP Status:", response.status);

      console.error("Response:", data);

      console.error("=============================================");

      return null;
    }

    console.log("Email sent successfully through Brevo HTTPS API.");

    console.log("Message ID:", data?.messageId || "N/A");

    return data;
  } catch (error) {
    console.error("=============================================");

    console.error("BREVO EMAIL CONNECTION ERROR");

    console.error("=============================================");

    console.error("Message:", error.message);

    console.error("Code:", error.code || "N/A");

    console.error("=============================================");

    return null;
  }
};

/* =========================================================
   NORMALIZE BOOKING
========================================================= */

const normalizeBooking = (input) => {
  if (!input) {
    return null;
  }

  /*
    Supports:

    Direct booking:
    {
      _id,
      user,
      car,
      startDate,
      endDate,
      totalAmount
    }

    Wrapped booking:
    {
      booking,
      user,
      payment
    }
  */

  if (input.booking) {
    const booking = input.booking?.toObject
      ? input.booking.toObject()
      : input.booking;

    return {
      ...booking,

      user: booking?.user || input?.user || null,

      car: booking?.car || input?.car || null,

      payment: input?.payment || booking?.payment || null,
    };
  }

  return input?.toObject ? input.toObject() : input;
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

/* =========================================================
   ESCAPE HTML
========================================================= */

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* =========================================================
   COMMON EMAIL LAYOUT
========================================================= */

const emailLayout = ({ title, content }) => {
  return `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${escapeHtml(title)}</title>

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
        max-width:650px;
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

        ${content}

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
`;
};

/* =========================================================
   BOOKING CONFIRMATION EMAIL
========================================================= */

const sendBookingConfirmationEmail = async (bookingInput, payment = null) => {
  try {
    const booking = normalizeBooking(bookingInput);

    if (!booking) {
      console.error("Confirmation email error: booking data is missing.");

      return null;
    }

    const bookingPayment = payment || booking?.payment || null;

    const customerEmail = booking?.user?.email || booking?.email || "";

    const customerName = booking?.user?.name || booking?.name || "Customer";

    const car = booking?.car || {};

    const bookingId = booking?._id?.toString?.() || booking?.id || "N/A";

    const carName =
      `${car?.brand || ""} ${car?.model || ""}`.trim() || "Vehicle";

    const totalAmount = formatCurrency(booking?.totalAmount);

    const razorpayPaymentId =
      bookingPayment?.transactionId ||
      bookingPayment?.paymentId ||
      bookingPayment?.razorpayPaymentId ||
      booking?.paymentId ||
      "";

    console.log("========== CONFIRMATION EMAIL DEBUG ==========");

    console.log("Booking ID:", bookingId);

    console.log("Customer:", customerName, customerEmail);

    console.log("Car:", carName);

    console.log("Year:", car?.year || "N/A");

    console.log("Number Plate:", car?.numberPlate || "N/A");

    console.log("Pickup:", booking?.startDate);

    console.log("Return:", booking?.endDate);

    console.log("Total Amount:", booking?.totalAmount);

    console.log("Payment Status:", booking?.paymentStatus);

    console.log("Payment ID:", razorpayPaymentId || "N/A");

    console.log("Booking Status:", booking?.status);

    console.log("==============================================");

    if (!customerEmail) {
      console.error("Confirmation email not sent: customer email missing.");

      return null;
    }

    const content = `
      <h1
        style="
          margin:0;
          font-size:28px;
          color:#111827;
        "
      >
        Booking Confirmed! 🚗
      </h1>

      <p
        style="
          margin:15px 0 25px;
          color:#64748b;
          font-size:15px;
          line-height:1.7;
        "
      >
        Hello ${escapeHtml(customerName)},
        <br />
        Your DriveNow booking has been confirmed successfully.
      </p>

      <div
        style="
          background:#ecfdf5;
          border:1px solid #bbf7d0;
          border-radius:12px;
          padding:16px;
          margin-bottom:24px;
          color:#166534;
        "
      >

        <strong>
          Payment successful
        </strong>

        <br />

        Your vehicle reservation is confirmed.

      </div>

      <table
        style="
          width:100%;
          border-collapse:collapse;
          font-size:14px;
        "
      >

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
              width:42%;
            "
          >
            Booking ID
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#111827;
            "
          >
            ${escapeHtml(bookingId)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Car
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#111827;
            "
          >
            ${escapeHtml(carName)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Year
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(car?.year || "N/A")}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Number Plate
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(car?.numberPlate || "N/A")}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Pickup
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(formatDateTime(booking?.startDate))}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Return
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(formatDateTime(booking?.endDate))}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Total Amount
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:700;
              color:#111827;
            "
          >
            ${escapeHtml(totalAmount)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Payment Status
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#16a34a;
            "
          >
            ${escapeHtml(booking?.paymentStatus || "paid")}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Payment ID
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(razorpayPaymentId || "N/A")}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Booking Status
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#0ea5e9;
            "
          >
            ${escapeHtml(booking?.status || "confirmed")}
          </td>

        </tr>

      </table>

      <div
        style="
          margin-top:25px;
          padding:16px;
          border-radius:10px;
          background:#f8fafc;
          color:#64748b;
          font-size:13px;
          line-height:1.6;
        "
      >
        Please keep this email for your booking records.
      </div>
    `;

    const result = await sendEmail({
      to: customerEmail,

      subject: "DriveNow - Booking Confirmation",

      html: emailLayout({
        title: "Booking Confirmation",

        content,
      }),
    });

    console.log("CONFIRMATION EMAIL FUNCTION FINISHED.");

    return result;
  } catch (error) {
    console.error("Booking confirmation email error:", error);

    return null;
  }
};

/* =========================================================
   BOOKING CANCELLATION EMAIL
========================================================= */

const sendBookingCancellationEmail = async (bookingInput) => {
  try {
    const booking = normalizeBooking(bookingInput);

    if (!booking) {
      console.error("Cancellation email error: booking data is missing.");

      return null;
    }

    const customerEmail = booking?.user?.email || booking?.email || "";

    const customerName = booking?.user?.name || booking?.name || "Customer";

    const car = booking?.car || {};

    const bookingId = booking?._id?.toString?.() || booking?.id || "N/A";

    const carName =
      `${car?.brand || ""} ${car?.model || ""}`.trim() || "Vehicle";

    const totalAmount = formatCurrency(booking?.totalAmount);

    const paymentStatus = booking?.paymentStatus || "unpaid";

    console.log("========== CANCELLATION EMAIL DATA ==========");

    console.log("Booking ID:", bookingId);

    console.log("Customer:", customerName, customerEmail);

    console.log("Car:", carName);

    console.log("Year:", car?.year || "N/A");

    console.log("Number Plate:", car?.numberPlate || "N/A");

    console.log("Pickup:", booking?.startDate);

    console.log("Return:", booking?.endDate);

    console.log("Total Amount:", booking?.totalAmount);

    console.log("Payment Status:", paymentStatus);

    console.log("Booking Status:", booking?.status);

    console.log("=============================================");

    if (!customerEmail) {
      console.error("Cancellation email not sent: customer email missing.");

      return null;
    }

    const content = `
      <h1
        style="
          margin:0;
          font-size:28px;
          color:#111827;
        "
      >
        Booking Cancelled
      </h1>

      <p
        style="
          margin:15px 0 25px;
          color:#64748b;
          font-size:15px;
          line-height:1.7;
        "
      >
        Hello ${escapeHtml(customerName)},
        <br />
        Your DriveNow car rental booking has been
        cancelled successfully.
      </p>

      <div
        style="
          background:#fff7ed;
          border:1px solid #fed7aa;
          border-radius:12px;
          padding:16px;
          margin-bottom:24px;
          color:#9a3412;
        "
      >

        <strong>
          Booking cancelled
        </strong>

        <br />

        Your reservation is no longer active.

      </div>

      <table
        style="
          width:100%;
          border-collapse:collapse;
          font-size:14px;
        "
      >

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
              width:42%;
            "
          >
            Booking ID
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#111827;
            "
          >
            ${escapeHtml(bookingId)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Car
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#111827;
            "
          >
            ${escapeHtml(carName)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Year
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(car?.year || "N/A")}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Number Plate
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(car?.numberPlate || "N/A")}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Pickup
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(formatDateTime(booking?.startDate))}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Return
          </td>

          <td
            style="
              padding:11px 0;
              color:#111827;
            "
          >
            ${escapeHtml(formatDateTime(booking?.endDate))}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Total Amount
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:700;
              color:#111827;
            "
          >
            ${escapeHtml(totalAmount)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Payment Status
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#111827;
            "
          >
            ${escapeHtml(paymentStatus)}
          </td>

        </tr>

        <tr>

          <td
            style="
              padding:11px 0;
              color:#64748b;
            "
          >
            Booking Status
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#dc2626;
            "
          >
            Cancelled
          </td>

        </tr>

      </table>

      <div
        style="
          margin-top:25px;
          padding:16px;
          border-radius:10px;
          background:#f8fafc;
          color:#64748b;
          font-size:13px;
          line-height:1.6;
        "
      >
        If a refund applies to your booking,
        it will be processed according to the
        payment provider's refund process.
      </div>
    `;

    const result = await sendEmail({
      to: customerEmail,

      subject: "DriveNow - Booking Cancellation",

      html: emailLayout({
        title: "Booking Cancellation",

        content,
      }),
    });

    console.log("CANCELLATION EMAIL FUNCTION FINISHED.");

    return result;
  } catch (error) {
    console.error("Booking cancellation email error:", error);

    return null;
  }
};

/* =========================================================
   SEND PASSWORD RESET EMAIL (BREVO HTTP API)
========================================================= */

const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!email || !resetUrl) {
    throw new Error("Email address and reset URL are required.");
  }

  try {
    console.log("========================================");
    console.log("PASSWORD RESET EMAIL (BREVO)");
    console.log("Recipient:", email);
    console.log("Reset URL:", resetUrl);
    console.log("========================================");

    const content = `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">Reset Your Password</h2>
        <p style="font-size: 15px; color: #4b5563; margin: 0; line-height: 1.6;">
          We received a request to reset the password for your DriveNow account.
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 13px; color: #6b7280; line-height: 1.6; margin-top: 24px;">
        This password reset link will expire in 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.
      </p>
      <p style="font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 12px;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
      </p>
    `;

    const result = await sendEmail({
      to: email,
      subject: "DriveNow - Reset Your Password",
      html: emailLayout({
        title: "Reset Your Password",
        content,
      }),
    });

    console.log("PASSWORD RESET EMAIL FINISHED.");
    return result;
  } catch (error) {
    console.error("Password reset email error:", error);
    throw error;
  }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendPasswordResetEmail,
};

