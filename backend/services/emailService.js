const nodemailer = require("nodemailer");

/* =====================================================
   SMTP TRANSPORTER
===================================================== */

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =====================================================
   SEND BOOKING CONFIRMATION EMAIL
===================================================== */

const sendBookingConfirmationEmail = async ({ user, booking, payment }) => {
  try {
    if (!user?.email) {
      console.log("No customer email found. Confirmation email not sent.");

      return null;
    }

    const car = booking?.car || {};

    const formatDateTime = (date) => {
      if (!date) return "N/A";

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
      }

      return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatPrice = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));
    };

    const carName =
      `${car.brand || ""} ${car.model || ""}`.trim() || "Rental Car";

    const bookingId = booking?._id?.toString() || booking?.id || "N/A";

    const paymentId =
      payment?.transactionId ||
      payment?.paymentId ||
      payment?._id?.toString() ||
      payment?.id ||
      "N/A";

    const mailOptions = {
      from: `"DriveNow" <${process.env.SMTP_USER}>`,
      to: user.email,

      subject: `DriveNow Booking Confirmed - ${bookingId}`,

      text: `
Hello ${user.name || "Customer"},

Your DriveNow car rental booking has been confirmed successfully.

BOOKING DETAILS
================================

Booking ID:
${bookingId}

Car:
${carName}

Year:
${car.year || "N/A"}

Number Plate:
${car.numberPlate || "N/A"}

Pickup:
${formatDateTime(booking.startDate)}

Return:
${formatDateTime(booking.endDate)}

Total Amount:
${formatPrice(booking.totalAmount)}

Payment Status:
Paid

Payment ID:
${paymentId}

Booking Status:
Confirmed

Please keep this email for your records.

Thank you for choosing DriveNow.

DriveNow Team
      `.trim(),

      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>DriveNow Booking Confirmation</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div style="padding:30px 15px;">

    <div
      style="
        max-width:650px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 15px rgba(0,0,0,0.08);
      "
    >

      <div
        style="
          background:#111827;
          color:#ffffff;
          padding:25px 30px;
        "
      >
        <h1 style="margin:0;font-size:28px;">
          DriveNow
        </h1>

        <p
          style="
            margin:8px 0 0;
            color:#d1d5db;
            font-size:15px;
          "
        >
          Booking Confirmation
        </p>
      </div>

      <div style="padding:30px;">

        <h2
          style="
            margin:0 0 20px;
            color:#111827;
          "
        >
          Booking Confirmed! 🚗
        </h2>

        <p
          style="
            color:#374151;
            font-size:15px;
          "
        >
          Hello ${user.name || "Customer"},
        </p>

        <p
          style="
            color:#374151;
            font-size:15px;
            line-height:1.6;
          "
        >
          Your DriveNow car rental booking
          has been confirmed successfully.
        </p>

        <div
          style="
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
            margin:25px 0;
          "
        >

          <h3
            style="
              margin:0 0 18px;
              color:#111827;
            "
          >
            Booking Details
          </h3>

          <p>
            <strong>Booking ID:</strong>
            ${bookingId}
          </p>

          <p>
            <strong>Car:</strong>
            ${carName}
          </p>

          <p>
            <strong>Year:</strong>
            ${car.year || "N/A"}
          </p>

          <p>
            <strong>Number Plate:</strong>
            ${car.numberPlate || "N/A"}
          </p>

          <p>
            <strong>Pickup:</strong>
            ${formatDateTime(booking.startDate)}
          </p>

          <p>
            <strong>Return:</strong>
            ${formatDateTime(booking.endDate)}
          </p>

          <p>
            <strong>Total Amount:</strong>
            ${formatPrice(booking.totalAmount)}
          </p>

          <p>
            <strong>Payment Status:</strong>

            <span
              style="
                color:#16a34a;
                font-weight:bold;
              "
            >
              Paid
            </span>
          </p>

          <p>
            <strong>Payment ID:</strong>
            ${paymentId}
          </p>

          <p>
            <strong>Booking Status:</strong>

            <span
              style="
                color:#16a34a;
                font-weight:bold;
              "
            >
              Confirmed
            </span>
          </p>

        </div>

        <p
          style="
            color:#374151;
            font-size:15px;
            line-height:1.6;
          "
        >
          Please keep this email for your records.
        </p>

        <p
          style="
            color:#374151;
            font-size:15px;
            line-height:1.6;
          "
        >
          Thank you for choosing
          <strong>DriveNow</strong>.
        </p>

        <p
          style="
            margin-bottom:0;
            color:#111827;
            font-weight:bold;
          "
        >
          DriveNow Team
        </p>

      </div>
    </div>
  </div>
</body>
</html>
      `,
    };

    console.log(`Sending confirmation email to ${user.email}...`);

    const info = await transporter.sendMail(mailOptions);

    console.log(
      "Booking confirmation email sent successfully:",
      info.messageId,
    );

    return info;
  } catch (error) {
    console.error("Booking confirmation email error:", error.message);

    return null;
  }
};

/* =====================================================
   SEND BOOKING CANCELLATION EMAIL
===================================================== */

const sendBookingCancellationEmail = async ({ user, booking }) => {
  try {
    console.log("========== CANCELLATION EMAIL START ==========");

    if (!user?.email) {
      console.log("No customer email found. Cancellation email not sent.");

      return null;
    }

    const car = booking?.car || {};

    const formatDateTime = (date) => {
      if (!date) return "N/A";

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
      }

      return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatPrice = (amount) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));
    };

    const carName =
      `${car.brand || ""} ${car.model || ""}`.trim() || "Rental Car";

    const bookingId = booking?._id?.toString() || booking?.id || "N/A";

    const paymentStatus = booking?.paymentStatus || "unpaid";

    console.log("Cancellation email recipient:", user.email);

    console.log("Cancellation booking ID:", bookingId);

    const mailOptions = {
      from: `"DriveNow" <${process.env.SMTP_USER}>`,

      to: user.email,

      subject: `DriveNow Booking Cancelled - ${bookingId}`,

      text: `
Hello ${user.name || "Customer"},

Your DriveNow car rental booking has been cancelled successfully.

BOOKING DETAILS
================================

Booking ID:
${bookingId}

Car:
${carName}

Year:
${car.year || "N/A"}

Number Plate:
${car.numberPlate || "N/A"}

Pickup:
${formatDateTime(booking.startDate)}

Return:
${formatDateTime(booking.endDate)}

Total Amount:
${formatPrice(booking.totalAmount)}

Payment Status:
${paymentStatus}

Booking Status:
Cancelled

Please keep this email for your records.

Thank you for choosing DriveNow.

DriveNow Team
      `.trim(),

      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>DriveNow Booking Cancelled</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div style="padding:30px 15px;">

    <div
      style="
        max-width:650px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
        box-shadow:0 4px 15px rgba(0,0,0,0.08);
      "
    >

      <!-- HEADER -->

      <div
        style="
          background:#111827;
          color:#ffffff;
          padding:25px 30px;
        "
      >

        <h1
          style="
            margin:0;
            font-size:28px;
          "
        >
          DriveNow
        </h1>

        <p
          style="
            margin:8px 0 0;
            color:#d1d5db;
            font-size:15px;
          "
        >
          Booking Cancellation
        </p>

      </div>

      <!-- CONTENT -->

      <div style="padding:30px;">

        <h2
          style="
            margin:0 0 20px;
            color:#111827;
          "
        >
          Booking Cancelled
        </h2>

        <p
          style="
            color:#374151;
            font-size:15px;
          "
        >
          Hello ${user.name || "Customer"},
        </p>

        <p
          style="
            color:#374151;
            font-size:15px;
            line-height:1.6;
          "
        >
          Your DriveNow car rental booking has been
          <strong>cancelled successfully</strong>.
        </p>

        <!-- DETAILS -->

        <div
          style="
            background:#f9fafb;
            border:1px solid #e5e7eb;
            border-radius:10px;
            padding:20px;
            margin:25px 0;
          "
        >

          <h3
            style="
              margin:0 0 18px;
              color:#111827;
            "
          >
            Booking Details
          </h3>

          <p>
            <strong>Booking ID:</strong>
            ${bookingId}
          </p>

          <p>
            <strong>Car:</strong>
            ${carName}
          </p>

          <p>
            <strong>Year:</strong>
            ${car.year || "N/A"}
          </p>

          <p>
            <strong>Number Plate:</strong>
            ${car.numberPlate || "N/A"}
          </p>

          <p>
            <strong>Pickup:</strong>
            ${formatDateTime(booking.startDate)}
          </p>

          <p>
            <strong>Return:</strong>
            ${formatDateTime(booking.endDate)}
          </p>

          <p>
            <strong>Total Amount:</strong>
            ${formatPrice(booking.totalAmount)}
          </p>

          <p>
            <strong>Payment Status:</strong>
            ${paymentStatus}
          </p>

          <p>
            <strong>Booking Status:</strong>

            <span
              style="
                color:#dc2626;
                font-weight:bold;
              "
            >
              Cancelled
            </span>
          </p>

        </div>

        <p
          style="
            color:#374151;
            font-size:15px;
            line-height:1.6;
          "
        >
          Please keep this email for your records.
        </p>

        <p
          style="
            color:#374151;
            font-size:15px;
            line-height:1.6;
          "
        >
          Thank you for choosing
          <strong>DriveNow</strong>.
        </p>

        <p
          style="
            margin-bottom:0;
            color:#111827;
            font-weight:bold;
          "
        >
          DriveNow Team
        </p>

      </div>
    </div>
  </div>
</body>
</html>
      `,
    };

    console.log("Sending cancellation email...");

    const info = await transporter.sendMail(mailOptions);

    console.log(
      "Booking cancellation email sent successfully:",
      info.messageId,
    );

    console.log("========== CANCELLATION EMAIL END ==========");

    return info;
  } catch (error) {
    console.error("========== CANCELLATION EMAIL ERROR ==========");

    console.error(error);

    console.error("Error message:", error.message);

    return null;
  }
};

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
};
