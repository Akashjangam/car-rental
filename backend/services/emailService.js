require("dotenv").config();

const nodemailer = require("nodemailer");

/* =========================================================
   GMAIL SMTP CONFIGURATION
========================================================= */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";

const SMTP_PORT = Number(process.env.SMTP_PORT || 465);

const SMTP_SECURE =
  String(process.env.SMTP_SECURE).toLowerCase() === "true";

const SMTP_USER = process.env.SMTP_USER;

const SMTP_PASS = process.env.SMTP_PASS;

/* =========================================================
   CREATE EMAIL TRANSPORTER
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
   CHECK SMTP CONFIGURATION
========================================================= */

console.log("========== GMAIL SMTP CONFIG ==========");

console.log(
  "SMTP_HOST:",
  SMTP_HOST,
);

console.log(
  "SMTP_PORT:",
  SMTP_PORT,
);

console.log(
  "SMTP_SECURE:",
  SMTP_SECURE,
);

console.log(
  "SMTP_USER:",
  SMTP_USER || "NOT CONFIGURED",
);

console.log(
  "SMTP_PASS configured:",
  Boolean(SMTP_PASS),
);

console.log(
  "========================================",
);

/* =========================================================
   VERIFY GMAIL SMTP CONNECTION
========================================================= */

const verifySMTP = async () => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error(
      "Gmail SMTP verification skipped: SMTP_USER or SMTP_PASS is missing.",
    );

    return;
  }

  try {
    await transporter.verify();

    console.log(
      "Gmail SMTP connection verified successfully.",
    );
  } catch (error) {
    console.error(
      "Gmail SMTP verification failed:",
      error.message,
    );
  }
};

verifySMTP();

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

      user:
        booking?.user ||
        input?.user ||
        null,

      car:
        booking?.car ||
        input?.car ||
        null,

      payment:
        input?.payment ||
        booking?.payment ||
        null,
    };
  }

  return input?.toObject
    ? input.toObject()
    : input;
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  ).format(date);
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(value);
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
   SEND EMAIL
========================================================= */

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error(
      "Gmail email error: SMTP_USER or SMTP_PASS is not configured.",
    );

    return null;
  }

  if (!to) {
    console.error(
      "Gmail email error: recipient email is missing.",
    );

    return null;
  }

  try {
    console.log(
      `Sending email to ${to} through Gmail SMTP...`,
    );

    const result =
      await transporter.sendMail({
        from: `"DriveNow" <${SMTP_USER}>`,
        to,
        subject,
        html,
      });

    console.log(
      "Email sent successfully through Gmail SMTP.",
    );

    console.log(
      "Message ID:",
      result?.messageId || "N/A",
    );

    return result;
  } catch (error) {
    console.error(
      "=============================================",
    );

    console.error(
      "GMAIL SMTP EMAIL ERROR",
    );

    console.error(
      "=============================================",
    );

    console.error(
      "Message:",
      error.message,
    );

    console.error(
      "Code:",
      error.code || "N/A",
    );

    console.error(
      "Command:",
      error.command || "N/A",
    );

    console.error(
      "Response:",
      error.response || "N/A",
    );

    console.error(
      "=============================================",
    );

    return null;
  }
};

/* =========================================================
   COMMON EMAIL LAYOUT
========================================================= */

const emailLayout = ({
  title,
  content,
}) => {
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

const sendBookingConfirmationEmail = async (
  bookingInput,
  payment = null,
) => {
  try {
    const booking =
      normalizeBooking(bookingInput);

    if (!booking) {
      console.error(
        "Confirmation email error: booking data is missing.",
      );

      return null;
    }

    const bookingPayment =
      payment ||
      booking?.payment ||
      null;

    const customerEmail =
      booking?.user?.email ||
      booking?.email ||
      "";

    const customerName =
      booking?.user?.name ||
      booking?.name ||
      "Customer";

    const car =
      booking?.car || {};

    const bookingId =
      booking?._id?.toString?.() ||
      booking?.id ||
      "N/A";

    const carName =
      `${car?.brand || ""} ${car?.model || ""}`.trim() ||
      "Vehicle";

    const totalAmount =
      formatCurrency(
        booking?.totalAmount,
      );

    const razorpayPaymentId =
      bookingPayment?.transactionId ||
      bookingPayment?.paymentId ||
      bookingPayment?.razorpayPaymentId ||
      booking?.paymentId ||
      "";

    console.log(
      "========== CONFIRMATION EMAIL DEBUG ==========",
    );

    console.log(
      "Booking ID:",
      bookingId,
    );

    console.log(
      "Customer:",
      customerName,
      customerEmail,
    );

    console.log(
      "Car:",
      carName,
    );

    console.log(
      "Year:",
      car?.year || "N/A",
    );

    console.log(
      "Number Plate:",
      car?.numberPlate || "N/A",
    );

    console.log(
      "Pickup:",
      booking?.startDate,
    );

    console.log(
      "Return:",
      booking?.endDate,
    );

    console.log(
      "Total Amount:",
      booking?.totalAmount,
    );

    console.log(
      "Payment Status:",
      booking?.paymentStatus,
    );

    console.log(
      "Payment ID:",
      razorpayPaymentId || "N/A",
    );

    console.log(
      "Booking Status:",
      booking?.status,
    );

    console.log(
      "==============================================",
    );

    if (!customerEmail) {
      console.error(
        "Confirmation email not sent: customer email missing.",
      );

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
            ${escapeHtml(
              car?.year || "N/A",
            )}
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
            ${escapeHtml(
              car?.numberPlate || "N/A",
            )}
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
            ${escapeHtml(
              formatDateTime(
                booking?.startDate,
              ),
            )}
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
            ${escapeHtml(
              formatDateTime(
                booking?.endDate,
              ),
            )}
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
            ${escapeHtml(
              totalAmount,
            )}
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
            ${escapeHtml(
              booking?.paymentStatus ||
                "paid",
            )}
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
            ${escapeHtml(
              razorpayPaymentId ||
                "N/A",
            )}
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
            ${escapeHtml(
              booking?.status ||
                "confirmed",
            )}
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

    const result =
      await sendEmail({
        to: customerEmail,

        subject:
          "DriveNow - Booking Confirmation",

        html: emailLayout({
          title:
            "Booking Confirmation",

          content,
        }),
      });

    console.log(
      "CONFIRMATION EMAIL FUNCTION FINISHED.",
    );

    return result;
  } catch (error) {
    console.error(
      "Booking confirmation email error:",
      error,
    );

    return null;
  }
};

/* =========================================================
   BOOKING CANCELLATION EMAIL
========================================================= */

const sendBookingCancellationEmail = async (
  bookingInput,
) => {
  try {
    const booking =
      normalizeBooking(bookingInput);

    if (!booking) {
      console.error(
        "Cancellation email error: booking data is missing.",
      );

      return null;
    }

    const customerEmail =
      booking?.user?.email ||
      booking?.email ||
      "";

    const customerName =
      booking?.user?.name ||
      booking?.name ||
      "Customer";

    const car =
      booking?.car || {};

    const bookingId =
      booking?._id?.toString?.() ||
      booking?.id ||
      "N/A";

    const carName =
      `${car?.brand || ""} ${car?.model || ""}`.trim() ||
      "Vehicle";

    const totalAmount =
      formatCurrency(
        booking?.totalAmount,
      );

    const paymentStatus =
      booking?.paymentStatus ||
      "unpaid";

    console.log(
      "========== CANCELLATION EMAIL DATA ==========",
    );

    console.log(
      "Booking ID:",
      bookingId,
    );

    console.log(
      "Customer:",
      customerName,
      customerEmail,
    );

    console.log(
      "Car:",
      carName,
    );

    console.log(
      "Year:",
      car?.year || "N/A",
    );

    console.log(
      "Number Plate:",
      car?.numberPlate || "N/A",
    );

    console.log(
      "Pickup:",
      booking?.startDate,
    );

    console.log(
      "Return:",
      booking?.endDate,
    );

    console.log(
      "Total Amount:",
      booking?.totalAmount,
    );

    console.log(
      "Payment Status:",
      paymentStatus,
    );

    console.log(
      "Booking Status:",
      booking?.status,
    );

    console.log(
      "=============================================",
    );

    if (!customerEmail) {
      console.error(
        "Cancellation email not sent: customer email missing.",
      );

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
            ${escapeHtml(
              car?.year || "N/A",
            )}
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
            ${escapeHtml(
              car?.numberPlate || "N/A",
            )}
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
            ${escapeHtml(
              formatDateTime(
                booking?.startDate,
              ),
            )}
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
            ${escapeHtml(
              formatDateTime(
                booking?.endDate,
              ),
            )}
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
            ${escapeHtml(
              totalAmount,
            )}
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
            ${escapeHtml(
              paymentStatus,
            )}
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

    const result =
      await sendEmail({
        to: customerEmail,

        subject:
          "DriveNow - Booking Cancellation",

        html: emailLayout({
          title:
            "Booking Cancellation",

          content,
        }),
      });

    console.log(
      "CANCELLATION EMAIL FUNCTION FINISHED.",
    );

    return result;
  } catch (error) {
    console.error(
      "Booking cancellation email error:",
      error,
    );

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