import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import path from "path";

import movieRouter from "./routes/movieRouter.js";
import userRouter from "./routes/userRouter.js";
import bookingRouter from "./routes/bookingRouter.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// STATIC FOR IMAGES
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/bookings", bookingRouter);

app.get("/", (_, res) => res.send("API Working"));

app.listen(PORT, () =>
  console.log(`Server running → http://localhost:${PORT}`)
);
