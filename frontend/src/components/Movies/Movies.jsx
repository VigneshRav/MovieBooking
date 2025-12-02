// import React, { useEffect, useState } from "react";
// import { Tickets } from "lucide-react";
// import { Link } from "react-router-dom";
// import { moviesStyles } from "../../assets/dummyStyles";

// const API_BASE = "https://moviebooking-backend-vo9q.onrender.com";
// const PLACEHOLDER = "https://via.placeholder.com/400x600?text=No+Poster";

// const getUploadUrl = (maybe) => {
//   if (!maybe) return null;
//   if (typeof maybe !== "string") return null;
//   if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
//   return `${API_BASE}/uploads/${String(maybe).replace(/^uploads\//, "")}`;
// };

// export default function Movies() {
//   const [movies, setMovies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const ac = new AbortController();
//     setLoading(true);
//     setError(null);

//     async function loadFeaturedMovies() {
//       try {
//         const url = `${API_BASE}/api/movies?featured&limit=100`;
//         const res = await fetch(url, { signal: ac.signal });
//         if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//         const json = await res.json();

//         const items = json.items ?? (Array.isArray(json) ? json : []);

//         // Keep only featured items
//         const featuredOnly = items.filter(
//           (it) =>
//             it?.featured === true ||
//             it?.isFeatured === true ||
//             String(it?.type)?.toLowerCase() === "featured"
//         );

//         // ✅ Show only featured movies, even if none
//         setMovies(featuredOnly.slice(0, 6));
//         setLoading(false);
//       } catch (err) {
//         if (err.name === "AbortError") return;
//         console.error("Movies load error:", err);
//         setError("Unable to load featured movies.");
//         setLoading(false);
//       }
//     }

//     loadFeaturedMovies();
//     return () => ac.abort();
//   }, []);

//   return (
//     <section className={moviesStyles.container}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
//       `}</style>

//       <h2
//         className={moviesStyles.title}
//         style={{}}
        
//       >
//         Featured Movies
//       </h2>

//       {loading ? (
//         <div className="text-gray-300 py-12 text-center">Loading movies…</div>
//       ) : error ? (
//         <div className="text-red-400 py-12 text-center">{error}</div>
//       ) : movies.length === 0 ? (
//         <div className="text-gray-400 py-12 text-center">
//           No featured movies found.
//         </div>
//       ) : (
//         <div className={moviesStyles.grid}>
//           {movies.map((m) => {
//             const rawImg =
//               m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
//             const imgSrc = getUploadUrl(rawImg) || PLACEHOLDER;
//             const title = m.movieName || m.title || "Untitled";
//             const category =
//               (Array.isArray(m.categories) && m.categories[0]) ||
//               m.category ||
//               "General";
//             const movieId = m._id || m.id || title;

//             return (
//               <article
//                 key={movieId}
//                 className={moviesStyles.movieArticle}
//                 aria-labelledby={`movie-title-${movieId}`}
//               >
//                 <Link
//                   to={`/movie/${movieId}`}
//                   className={moviesStyles.movieLink}
//                   aria-label={`Open ${title} details`}
//                 >
//                   <img
//                     src={imgSrc}
//                     alt={title}
//                     loading="lazy"
//                     className={moviesStyles.movieImage}
//                     onError={(e) => {
//                       e.currentTarget.src = PLACEHOLDER;
//                     }}
//                   />
//                 </Link>

//                 <div className={moviesStyles.movieInfo}>
//                   <div className={moviesStyles.titleContainer}>
//                     <Tickets
//                       className={moviesStyles.ticketsIcon}
//                       aria-hidden="true"
//                     />
//                     <span
//                       id={`movie-title-${movieId}`}
//                       className={moviesStyles.movieTitle}
                      
//                     >
//                       {title}
//                     </span>
//                   </div>

//                   <div className={moviesStyles.categoryContainer}>
//                     <span className={moviesStyles.categoryText}>
//                       {category}
//                     </span>
//                   </div>
//                 </div>
//               </article>
//             );
//           })}
//         </div>
//       )}
//     </section>
//   );
// }


import React, { useEffect, useState } from "react";
import { Tickets } from "lucide-react";
import { Link } from "react-router-dom";
import { moviesStyles } from "../../assets/dummyStyles";

const API_BASE = "https://moviebooking-backend-vo9q.onrender.com";
const PLACEHOLDER = "https://placehold.co/400x600?text=No+Poster";


/**
 * getUploadUrl:
 * - returns full absolute URL when given a valid URL or server-side upload filename.
 * - returns `null` for clearly invalid values (so callers can use PLACEHOLDER).
 */
const getUploadUrl = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;

  const trimmed = maybe.trim();

  // If already an absolute URL, return it
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  // If it's already stored as "uploads/xxx" or "public/uploads/xxx"
  if (/^(uploads\/|public\/uploads\/)/i.test(trimmed)) {
    return `${API_BASE}/${trimmed.replace(/^public\//i, "")}`;
  }

  // If it looks like just a filename with extension (movie-123.png)
  if (/^[\w\-.]+?\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(trimmed)) {
    return `${API_BASE}/uploads/${trimmed}`;
  }

  // If value looks like "400x600?text=No+Poster" or contains query-like only, treat as invalid
  if (/^\d+x\d+\?/.test(trimmed) || /\s/.test(trimmed) || trimmed.includes("?")) {
    return null;
  }

  // last resort: join as uploads/
  return `${API_BASE}/uploads/${trimmed}`;
};

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    async function loadFeaturedMovies() {
      try {
        const url = `${API_BASE}/api/movies?featured&limit=100`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json = await res.json();

        const items = json.items ?? (Array.isArray(json) ? json : []);

        // Keep only featured items
        const featuredOnly = items.filter(
          (it) =>
            it?.featured === true ||
            it?.isFeatured === true ||
            String(it?.type)?.toLowerCase() === "featured"
        );

        setMovies(featuredOnly.slice(0, 6));
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Movies load error:", err);
        setError("Unable to load featured movies.");
        setLoading(false);
      }
    }

    loadFeaturedMovies();
    return () => ac.abort();
  }, []);

  return (
    <section className={moviesStyles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
      `}</style>

      <h2 className={moviesStyles.title}>Featured Movies</h2>

      {loading ? (
        <div className="text-gray-300 py-12 text-center">Loading movies…</div>
      ) : error ? (
        <div className="text-red-400 py-12 text-center">{error}</div>
      ) : movies.length === 0 ? (
        <div className="text-gray-400 py-12 text-center">No featured movies found.</div>
      ) : (
        <div className={moviesStyles.grid}>
          {movies.map((m) => {
            const rawImg = m.poster || m.latestTrailer?.thumbnail || m.thumbnail || null;
            const imgSrc = getUploadUrl(rawImg) || PLACEHOLDER;
            const title = m.movieName || m.title || "Untitled";
            const category = (Array.isArray(m.categories) && m.categories[0]) || m.category || "General";
            const movieId = m._id || m.id || title;

            return (
              <article
                key={movieId}
                className={moviesStyles.movieArticle}
                aria-labelledby={`movie-title-${movieId}`}
              >
                <Link
                  to={`/movie/${movieId}`}
                  className={moviesStyles.movieLink}
                  aria-label={`Open ${title} details`}
                >
                  <img
                    src={imgSrc}
                    alt={title}
                    loading="lazy"
                    className={moviesStyles.movieImage}
                    onError={(e) => {
                      // last-resort fallback
                      if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                </Link>

                <div className={moviesStyles.movieInfo}>
                  <div className={moviesStyles.titleContainer}>
                    <Tickets className={moviesStyles.ticketsIcon} aria-hidden="true" />
                    <span id={`movie-title-${movieId}`} className={moviesStyles.movieTitle}>
                      {title}
                    </span>
                  </div>

                  <div className={moviesStyles.categoryContainer}>
                    <span className={moviesStyles.categoryText}>{category}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
