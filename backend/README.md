## 🎬 MovieBooking Backend (Node.js + Express)

This is the REST API backend for the MovieBooking system.
It handles authentication, movie data, showtime management, seat booking, Stripe payments, and email notifications.

---

## 🚀 Tech Stack:-

- Node.js

- Express.js

- MongoDB + Mongoose

- Cloudinary (uploads)

- JWT Authentication

- Stripe Payments

- Nodemailer

---

## 🧩 Core Functionalities:-

## 🔐 Authentication:

- Register / Login

- JWT tokens

- Role-based Access (User / Admin)

## 🎬 Movies API:

- Add / Edit / Delete movies

- Cloudinary image upload

- Fetch movies, search, filter

## 🏟 Theater & Showtimes:

- Manage theaters, screens, schedules

- Store seat layouts

- Real-time seat lock

## 🎟 Bookings:

- Create booking

- Verify seat availability

- Generate unique booking ID

- Save transaction info

## ⚡ Payments (Stripe):

- Create checkout session

- Verify payment success

## 📧 Email Notifications:

- Booking confirmation

- Change/cancellation reminders

---

## 📌 Important API Routes:-

## Auth:

| Method | Route              | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register user |
| POST   | /api/auth/login    | Login         |

## Movies:

| Method | Route           | Description     |
| ------ | --------------- | --------------- |
| GET    | /api/movies     | List all movies |
| POST   | /api/movies     | Add movie       |
| PUT    | /api/movies/:id | Update movie    |
| DELETE | /api/movies/:id | Delete movie    |

## Bookings:

| Method | Route         |                |
| ------ | ------------- | -------------- |
| POST   | /api/bookings | Create booking |

## Payment:

| Method | Route                                 |
| ------ | ------------------------------------- |
| POST   | /api/payments/create-checkout-session |

---

## ⚙ Install & Run:-

- cd backend

- npm install

- npm run dev
