// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "movie-posters",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//   },
// });

// const upload = multer({ storage });

// export default upload;

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "moviebooking",
    resource_type: "auto", // allows images, thumbnails, videos
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4"],
    public_id: `movie-${Date.now()}-${Math.round(Math.random() * 1e5)}`
  }),
});

const upload = multer({ storage });

export default upload;

