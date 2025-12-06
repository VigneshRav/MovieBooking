import React, { useEffect, useState } from "react";
import { Tickets } from "lucide-react";
import { Link } from "react-router-dom";
import { moviesStyles } from "../../assets/dummyStyles";

const API_BASE = "https://moviebooking-backend-vo9q.onrender.com";
const PLACEHOLDER = "https://placehold.co/400x600?text=No+Poster";

const getUploadUrl = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe !== "string") return null;

  const trimmed = maybe.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  if (/^(uploads\/|public\/uploads\/)/i.test(trimmed)) {
    return `${API_BASE}/${trimmed.replace(/^public\//i, "")}`;
  }

  if (/^[\w\-.]+?\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(trimmed)) {
    return `${API_BASE}/uploads/${trimmed}`;
  }

  if (/^\d+x\d+\?/.test(trimmed) || /\s/.test(trimmed) || trimmed.includes("?")) {
    return null;
  }

  return `${API_BASE}/uploads/${trimmed}`;
};

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    async function loadFeaturedMovies() {
      try {
        const url = `${API_BASE}/api/movies?featured&limit=100`;
        const res = await fetch(url, { signal: ac.signal });

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const json = await res.json();
        const items = json.items ?? [];

        const featuredOnly = items.filter(
          (it) =>
            it?.featured === true ||
            it?.isFeatured === true ||
            String(it?.type)?.toLowerCase() === "featured"
        );

        setMovies(featuredOnly.slice(0, 6));
      } catch (err) {
        if (err.name !== "AbortError") setError("Unable to load featured movies.");
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedMovies();
    return () => ac.abort();
  }, []);

  return (
    <section className={moviesStyles.container}>
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
            const movieId = m._id || m.id;

            return (
              <article key={movieId} className={moviesStyles.movieArticle}>
                <Link
                  to={`/movies/${movieId}`}
                  state={{ movie: m }}
                  className={moviesStyles.movieLink}
                >
                  <img
                    src={imgSrc}
                    alt={title}
                    className={moviesStyles.movieImage}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== PLACEHOLDER) e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                </Link>

                <div className={moviesStyles.movieInfo}>
                  <div className={moviesStyles.titleContainer}>
                    <Tickets className={moviesStyles.ticketsIcon} />
                    <span className={moviesStyles.movieTitle}>{title}</span>
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
