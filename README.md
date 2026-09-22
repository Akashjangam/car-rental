# 🚗 DriveNow — MERN Stack Car Rental Platform

DriveNow is a full-stack car rental platform built using the MERN stack. It allows customers to browse available vehicles, make bookings, complete online payments, manage reservations, and submit reviews.

The platform also provides dedicated Admin and Dealer functionality for managing vehicles, bookings, users, payments, and rental operations.

---

## 📌 Project Overview

DriveNow is designed as a complete vehicle rental management system with three main roles:

- 👤 Customer / Member
- 🛠️ Dealer
- 👑 Admin

### Customer

Customers can:

- Register and log in
- Browse available cars
- Search and filter vehicles
- View detailed vehicle information
- Select pickup and return dates
- Create bookings
- Make online payments
- View booking details
- Cancel bookings
- View booking history
- Save favorite cars
- Submit reviews
- Reset forgotten passwords
- Switch between dark and light themes

### Dealer

Dealers can:

- Access their dealer dashboard
- Add vehicles
- Edit vehicle information
- Delete vehicles
- View their vehicles
- View booking information
- Track booking status
- Confirm bookings
- Cancel bookings
- Complete bookings
- View earnings and booking analytics

### Admin

Admins can:

- View platform statistics
- Manage vehicles
- Add vehicles
- Edit vehicles
- Delete vehicles
- Manage members
- Manage dealers
- View bookings
- Monitor rental activity
- View revenue and payment statistics

---

# 🛠️ Technologies Used

## Frontend

- React.js
- JavaScript
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Axios
- ESLint

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Multer
- Cloudinary
- Razorpay
- Nodemailer / Brevo

## Development Tools

- Git
- GitHub
- VS Code
- npm

---

# 📂 Project Structure

```text
CAR-RENTAL/
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── razorpay.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── carController.js
│   │   ├── dealerController.js
│   │   ├── paymentController.js
│   │   └── reviewController.js
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── dealerMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Car.js
│   │   ├── Review.js
│   │   ├── User.js
│   │   └── payment.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── carRoutes.js
│   │   ├── dealerRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reviewRoutes.js
│   │
│   ├── services/
│   │   └── emailService.js
│   │
│   ├── utils/
│   │   └── sendEmail.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── .gitignore
└── README.md
