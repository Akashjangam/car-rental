const RESEND_API_URL = "https://api.resend.com/emails";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "DriveNow <onboarding@resend.dev>";

/* =========================================================
   FORMAT HELPERS
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* =========================================================
   SEND EMAIL USING RESEND
========================================================= */

const sendEmail = async ({ to, subject, html }) => {
  if (!RESEND_API_KEY) {
    console.error("Resend email error: RESEND_API_KEY is not configured.");

    return null;
  }

  if (!to) {
    console.error("Resend email error: recipient email is missing.");

    return null;
  }

  try {
    console.log(`Sending email to ${to} through Resend...`);

    const response = await fetch(RESEND_API_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,

        to: [to],

        subject,

        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);

      return null;
    }

    console.log("Email sent successfully through Resend.");

    console.log("Resend Email ID:", data?.id || "N/A");

    return data;
  } catch (error) {
    console.error("Resend email error:", error.message);

    return null;
  }
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

const sendBookingConfirmationEmail = async (booking, payment = null) => {
  try {
    const customerEmail = booking?.user?.email || booking?.email || "";

    const customerName = booking?.user?.name || booking?.name || "Customer";

    const car = booking?.car || {};

    const bookingId = booking?._id || booking?.id || "N/A";

    let razorpayPaymentId = "";

    if (typeof payment === "string") {
      razorpayPaymentId = payment;
    } else {
      razorpayPaymentId =
        payment?.transactionId ||
        payment?.paymentId ||
        payment?.razorpayPaymentId ||
        booking?.razorpayPaymentId ||
        "";
    }

    const carName = `${car.brand || ""} ${car.model || ""}`.trim() || "Vehicle";

    const totalAmount = formatCurrency(booking?.totalAmount);

    console.log(
      `Sending confirmation email to ${customerEmail} through Resend...`,
    );

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

          <td style="padding:11px 0;color:#64748b;">
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

          <td style="padding:11px 0;color:#64748b;">
            Year
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(car.year || "N/A")}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Number Plate
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(car.numberPlate || "N/A")}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Pickup
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(formatDateTime(booking?.startDate))}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Return
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(formatDateTime(booking?.endDate))}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
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

          <td style="padding:11px 0;color:#64748b;">
            Payment Status
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#16a34a;
            "
          >
            Paid
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Payment ID
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(razorpayPaymentId || "N/A")}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Booking Status
          </td>

          <td
            style="
              padding:11px 0;
              font-weight:600;
              color:#0ea5e9;
            "
          >
            Confirmed
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

    return await sendEmail({
      to: customerEmail,

      subject: "DriveNow - Booking Confirmation",

      html: emailLayout({
        title: "Booking Confirmation",

        content,
      }),
    });
  } catch (error) {
    console.error("Booking confirmation email error:", error);

    return null;
  }
};

/* =========================================================
   BOOKING CANCELLATION EMAIL
========================================================= */

const sendBookingCancellationEmail = async (booking) => {
  try {
    const customerEmail = booking?.user?.email || booking?.email || "";

    const customerName = booking?.user?.name || booking?.name || "Customer";

    const car = booking?.car || {};

    const bookingId = booking?._id || booking?.id || "N/A";

    const carName = `${car.brand || ""} ${car.model || ""}`.trim() || "Vehicle";

    const totalAmount = formatCurrency(booking?.totalAmount);

    const paymentStatus = booking?.paymentStatus || "unpaid";

    console.log("========== CANCELLATION EMAIL START ==========");

    console.log(`Cancellation email recipient: ${customerEmail}`);

    console.log(`Cancellation booking ID: ${bookingId}`);

    console.log("Sending cancellation email through Resend...");

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

          <td style="padding:11px 0;color:#64748b;">
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

          <td style="padding:11px 0;color:#64748b;">
            Year
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(car.year || "N/A")}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Number Plate
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(car.numberPlate || "N/A")}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Pickup
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(formatDateTime(booking?.startDate))}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
            Return
          </td>

          <td style="padding:11px 0;color:#111827;">
            ${escapeHtml(formatDateTime(booking?.endDate))}
          </td>

        </tr>

        <tr>

          <td style="padding:11px 0;color:#64748b;">
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

          <td style="padding:11px 0;color:#64748b;">
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

          <td style="padding:11px 0;color:#64748b;">
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
        it will be processed according to the payment
        provider's refund process.
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
   EXPORTS
========================================================= */

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
};
