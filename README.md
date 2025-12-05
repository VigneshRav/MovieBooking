## 🎬 MovieBooking — Full-Stack Movie Ticket Booking System

- A complete MERN-stack application for booking movie tickets, managing showtimes, selecting seats, handling payments, and managing admins/theaters.

- The system includes Frontend (User App), Backend (Node.js API), and Admin Panel, each deployed separately.

---

## 🚀 Tech Stack:-

**Frontend & Admin**

- React.js / Express.js

- TailwindCSS

- Axios

- React Router

- Context API / Redux (if used)

**Backend**

- Node.js

- Express.js

- MongoDB + Mongoose

- Cloudinary (Image Uploads)

- JWT Authentication

- Stripe Payment Integration

- Nodemailer (Email confirmations)

**Deployment**

- Backend → Render

- Frontend → Netlify

- Admin Panel → Netlify

---

## 🎯 Features Overview:-

## ✔ Movie Search & Discovery:

- Search by movie name, genre, language, date

- Movie details page with cast, trailer, rating, description

## ✔ Showtime and Theater Selection:

- List of theaters showing selected movie

- Showtimes grouped by date & time

## ✔ Interactive Seat Booking:

- Real-time seat availability

- Seat lock during checkout

- Pricing based on premium/normal seating

## ✔ Secure Payments (Stripe):

- Card payments

- Webhooks ready (optional)

## ✔ Booking Confirmation:

- Email receipt + PDF ticket (if implemented)

- Booking details include: movie name, showtime, seats, theater, transaction ID

## ✔ Admin Panel:

- Add / Edit / Delete Movies

- Upload posters via Cloudinary

- Manage Theaters & Screens

- Add / Edit / Delete Showtimes

- Real-time booking analytics

---

## 📊 Analytics & Reports (If implemented):-

- Daily booking reports

- Movie-wise sales

- Seat occupancy rates

- Show performance insights

---

## 🔧 How to Run the Project Locally:-

## 1️⃣ Clone the Repository:

- git clone https://github.com/VigneshRav/MovieBooking.git
cd MovieBooking

## 2️⃣ Install Dependencies:

**Inside each folder:**

- cd backend && npm install

- cd ../frontend && npm install

- cd ../admin && npm install

## 3️⃣ Create Env Files:

**Each subfolder needs its own .env file**

**Example backend .env:**

- MONGODB_URL=your_mongodb_url

- PORT=your_port_number

- STRIPE_SECRET_KEY=XXX

- JWT_SECRET=XXX

- RENDER_EXTERNAL_URL=https://moviebooking-backend-vo9q.onrender.com

- CLOUDINARY_CLOUD_NAME=XXX

- CLOUDINARY_API_KEY=XXX

- CLOUDINARY_API_SECRET=XXX

---

## 🚀 Deployment URLs:-

Frontend URL: https://movie-booking-frontend.netlify.app

Admin Panel: https://movie-booking-admin.netlify.app

Backend API: https://moviebooking-backend-vo9q.onrender.com

Replace with your actual deployment URLs.

---

## 🙋‍♂️ Author & Contact:-

- Developed by: Vignesh R

- GitHub: @VigneshRav

- Email: vignesh212000@gmail.com

