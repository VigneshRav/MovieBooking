// import cors from 'cors';
// import 'dotenv/config';
// import express from 'express';
// import { connectDB } from './config/db.js';
// import path from 'path';
// import movieRouter from './routes/movieRouter.js';
// import userRouter from './routes/userRouter.js';
// import bookingRouter from './routes/bookingRouter.js';

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors())
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Database Connection
// connectDB();

// // Routes
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); 
// app.use("/api/auth", userRouter)
// app.use("/api/movies", movieRouter);
// app.use("/api/bookings", bookingRouter);


// app.get('/', (req, res) => {
//     res.send('API Working');
// });

// app.listen(port, () => {
//     console.log(`Server Started on http://localhost:${port}`);
// });

import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

import movieRouter from "./routes/movieRouter.js";
import userRouter from "./routes/userRouter.js";
import bookingRouter from "./routes/bookingRouter.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// STATIC FOR IMAGES
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/bookings", bookingRouter);

app.get("/", (_, res) => res.send("API Working"));

app.listen(PORT, () =>
  console.log(`Server running → http://localhost:${PORT}`)
);
