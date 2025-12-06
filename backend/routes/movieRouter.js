import express from "express";
import multer from "multer";
import {
  createMovie,
  getMovies,
  getMovieById,
  deleteMovie,
} from "../controllers/moviesController.js";

const movieRouter = express.Router();

// Use memoryStorage so files are available as buffers and not written to disk.
const storage = multer.memoryStorage();

const upload = multer({ storage }).fields([
  { name: "poster", maxCount: 1 },
  { name: "trailerUrl", maxCount: 1 },
  { name: "videoUrl", maxCount: 1 },
  { name: "ltThumbnail", maxCount: 1 },
  { name: "castFiles", maxCount: 20 },
  { name: "directorFiles", maxCount: 20 },
  { name: "producerFiles", maxCount: 20 },
  { name: "ltDirectorFiles", maxCount: 20 },
  { name: "ltProducerFiles", maxCount: 20 },
  { name: "ltSingerFiles", maxCount: 20 },
]);

movieRouter.post("/", upload, createMovie);
movieRouter.get("/", getMovies);
movieRouter.get("/:id", getMovieById);
movieRouter.delete("/:id", deleteMovie);

export default movieRouter;

