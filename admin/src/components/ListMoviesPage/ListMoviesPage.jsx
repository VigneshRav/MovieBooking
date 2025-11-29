// import React, { useMemo, useState, useEffect, useRef } from "react";
// import axios from "axios";
// import {
//   Film,
//   Play,
//   Star,
//   Clock,
//   Calendar,
//   Ticket,
//   Play as PlayIcon,
//   Search,
//   X,
// } from "lucide-react";
// import { styles5, customStyles } from "../../assets/dummyStyles";

// const API_BASE = "https://moviebooking-backend-vo9q.onrender.com";

// function getImageUrl(maybe) {
//   // Convert filename, uploads/filename, or partial to a full uploads URL.
//   if (!maybe) return null;
//   if (typeof maybe !== "string") return null;
//   if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
//   // remove leading uploads/ if present
//   const cleaned = String(maybe).replace(/^uploads\//, "");
//   return `${API_BASE}/uploads/${cleaned}`;
// }

// export default function ListMoviesPage() {
//   const [movies, setMovies] = useState([]);
//   const [filterType, setFilterType] = useState("all");
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // debounce search
//   const searchRef = useRef();
//   useEffect(() => {
//     clearTimeout(searchRef.current);
//     searchRef.current = setTimeout(() => {
//       fetchMovies();
//     }, 300);
//     return () => clearTimeout(searchRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterType, search]);

//   // initial fetch
//   useEffect(() => {
//     fetchMovies();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function fetchMovies() {
//     try {
//       setLoading(true);
//       setError(null);
//       const params = {};
//       // When selecting featured/normal/releaseSoon we send type
//       if (
//         filterType &&
//         filterType !== "all" &&
//         filterType !== "latestTrailers"
//       ) {
//         params.type = filterType;
//       }

//       // For latest trailers we use a dedicated query flag handled server-side
//       if (filterType === "latestTrailers") {
//         params.latestTrailers = true;
//       }

//       if (search && search.trim()) params.search = search.trim();

//       const res = await axios.get(`${API_BASE}/api/movies`, { params });

//       let items = [];
//       if (res?.data?.success) {
//         items = res.data.items || [];
//       } else if (Array.isArray(res?.data)) {
//         items = res.data;
//       } else {
//         items = [];
//       }

//       // Normalize items so UI (which expects some top-level fields) works consistently,
//       // especially for latestTrailers where details may live in item.latestTrailer.
//       const normalized = items.map(normalizeMovie);
//       setMovies(normalized);
//       console.log("movies (normalized):", normalized);
//     } catch (err) {
//       console.error("fetchMovies error:", err);
//       setError(
//         err?.response?.data?.message || err.message || "Failed to load movies"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function normalizeMovie(item) {
//     // Clone so we don't mutate original
//     const obj = { ...item };

//     // Normalize top-level poster
//     obj.poster = getImageUrl(item.poster) || (item.poster ? item.poster : null);

//     // Normalize top-level cast/person previews (top-level arrays often store full URLs or file URL)
//     const normalizeTopPeople = (arr = []) =>
//       (arr || []).map((p) => ({
//         ...(p || {}),
//         preview:
//           p?.preview ||
//           getImageUrl(p?.file) ||
//           p?.file ||
//           p?.image ||
//           p?.url ||
//           null,
//       }));

//     obj.cast = normalizeTopPeople(item.cast);
//     obj.directors = normalizeTopPeople(item.directors);
//     obj.producers = normalizeTopPeople(item.producers);

//     // If the document contains a latestTrailer object (some DBs store trailer as nested object),
//     // expose useful fields at top-level and normalize person images which may be filenames.
//     if (
//       item.latestTrailer &&
//       (item.type === "latestTrailers" ||
//         item.latestTrailer.title ||
//         item.latestTrailer.thumbnail ||
//         item.latestTrailer.videoId)
//     ) {
//       const lt = item.latestTrailer || {};

//       // Title (trailers may use `title` instead of movieName)
//       obj.title = lt.title || item.title || item.movieName || null;

//       // Thumbnail might be saved as filename (for latestTrailer persons/files we store filename), or full URL
//       obj.thumbnail =
//         getImageUrl(lt.thumbnail) ||
//         getImageUrl(item.thumbnail) ||
//         lt.thumbnail ||
//         null;

//       // trailer link: could be in latestTrailer.videoId or top-level trailerUrl
//       obj.trailerUrl = lt.videoId || item.trailerUrl || lt.trailerUrl || null;

//       // genres/year/rating/duration/description may live on lt
//       obj.genres = lt.genres || item.genres || [];
//       obj.year = lt.year || item.year || null;
//       obj.rating = lt.rating ?? item.rating ?? null;
//       obj.duration = lt.duration || item.duration || null;
//       obj.description =
//         lt.description || item.description || item.story || null;

//       // Normalize latestTrailer persons (these often store file as filename)
//       const normalizeLatestPeople = (arr = []) =>
//         (arr || []).map((p) => ({
//           ...(p || {}),
//           preview: p?.preview || getImageUrl(p?.file) || p?.file || null,
//         }));

//       obj.directors = normalizeLatestPeople(
//         lt.directors || item.latestTrailer?.directors || item.directors || []
//       );
//       obj.producers = normalizeLatestPeople(
//         lt.producers || item.latestTrailer?.producers || item.producers || []
//       );
//       obj.singers = normalizeLatestPeople(
//         lt.singers || item.latestTrailer?.singers || []
//       );
//     } else {
//       // For non-latestTrailers, try to normalize thumbnail from other fields if present
//       obj.thumbnail = getImageUrl(item.thumbnail) || obj.poster || null;
//     }

//     // Ensure type is set (some older records may not have type)
//     obj.type =
//       obj.type || (obj.title && !obj.movieName ? "latestTrailers" : "normal");

//     // unify name/title usage for list/card UI
//     obj.displayTitle =
//       obj.movieName || obj.title || obj.movieName || "Untitled";

//     return obj;
//   }

//   const types = useMemo(
//     () => [
//       { key: "all", label: "All", icon: Film },
//       { key: "normal", label: "Normal", icon: Ticket },
//       { key: "featured", label: "Featured", icon: Star },
//       { key: "releaseSoon", label: "Coming Soon", icon: Calendar },
//       { key: "latestTrailers", label: "Trailers", icon: PlayIcon },
//     ],
//     []
//   );

//   const filtered = useMemo(() => {
//     // already requested filtered data from backend, but keep a guard to
//     // exclude any cinenews entries if present in the returned list
//     return (movies || []).filter((item) => item.type !== "cinenews");
//   }, [movies]);

//   // delete handler (calls backend and updates UI)
//   async function handleDelete(id) {
//     const item = movies.find((m) => m._id === id || m.id === id);
//     if (!item) return;
//     const title = item.movieName || item.title || "this item";
//     const ok = window.confirm(
//       `Delete "${title}"? This action cannot be undone.`
//     );
//     if (!ok) return;

//     try {
//       const targetId = item._id || item.id || id;
//       await axios.delete(`${API_BASE}/api/movies/${targetId}`);
//       setMovies((prev) => prev.filter((m) => (m._id || m.id) !== targetId));
//       if (selected && (selected._1d || selected.id) === targetId)
//         setSelected(null);
//     } catch (err) {
//       console.error("deleteMovie error:", err);
//       alert("Failed to delete movie. See console for details.");
//     }
//   }

//   return (
//     <div className={styles5.listMoviesContainer}>
//       <style>{customStyles}</style>

//       <div className={styles5.maxWidth7xl}>
//         {/* Header */}
//         <header className={styles5.listMoviesHeader}>
//           <div className={styles5.listMoviesHeaderInner}>
//             <div className="text-left">
//               <h1 className={styles5.listMoviesTitle}>Movies</h1>
//               <div className={styles5.listMoviesSubtitle}>
//                 {loading ? "Loading..." : `${filtered.length} items`}
//               </div>
//             </div>

//             {/* Search */}
//             <div className={styles5.searchContainer}>
//               <div className={styles5.searchBox}>
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search movies, stories, trailers..."
//                   className={styles5.searchInput}
//                 />
//                 <div className={styles5.searchIcon}>
//                   <Search size={20} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Filter Tabs */}
//           <div className={styles5.filterContainer}>
//             {types.map((t) => {
//               const IconComponent = t.icon;
//               return (
//                 <button
//                   key={t.key}
//                   onClick={() => {
//                     setFilterType(t.key);
//                     // fetchMovies will run due to useEffect
//                   }}
//                   className={`${styles5.filterButton} ${
//                     filterType === t.key
//                       ? styles5.filterButtonActive
//                       : styles5.filterButtonInactive
//                   }`}
//                 >
//                   <IconComponent size={16} />
//                   {t.label}
//                 </button>
//               );
//             })}
//           </div>
//         </header>

//         {/* Main Grid */}
//         <main className={styles5.mainGrid}>
//           <div className={styles5.leftColumn}>
//             <div className={styles5.cardsGrid}>
//               {error && (
//                 <div className={styles5.errorContainer}>
//                   <div className={styles5.errorMessage}>Error</div>
//                   <div className="text-sm mt-2">{error}</div>
//                   <div className="mt-3">
//                     <button
//                       onClick={fetchMovies}
//                       className={styles5.errorRetryButton}
//                     >
//                       Retry
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {!error && filtered.length === 0 && !loading && (
//                 <div className={styles5.emptyState}>
//                   <div className={styles5.emptyStateText}>No items found</div>
//                   <div className={styles5.emptyStateSubtext}>
//                     Try adjusting your search or filters
//                   </div>
//                 </div>
//               )}

//               {filtered.map((item) => (
//                 <Card
//                   key={item._id || item.id || item.title || item.displayTitle}
//                   item={item}
//                   onOpen={() => setSelected(item)}
//                   onDelete={() => handleDelete(item._id || item.id)}
//                 />
//               ))}

//               {loading && (
//                 <div className={styles5.loadingState}>
//                   <div className={styles5.loadingText}>Loading movies…</div>
//                 </div>
//               )}
//             </div>
//           </div>

//           <aside className={styles5.rightColumn}>
//             <div className={styles5.detailSidebar}>
//               <div className={styles5.detailHeader}>
//                 <h2 className={styles5.detailTitle}>
//                   Details
//                 </h2>
//                 <div className={styles5.detailLiveIndicator}>
//                   <div className={styles5.detailLiveDot}></div>
//                   <span className={styles5.detailLiveText}>Live</span>
//                 </div>
//               </div>

//               {selected ? (
//                 <DetailView item={selected} onClose={() => setSelected(null)} />
//               ) : (
//                 <div className={styles5.detailEmptyState}>
//                   <div className="flex items-center justify-center mb-3 w-full">
//                     <div className={styles5.detailEmptyIcon}>
//                       <Film size={60} className="text-red-600" />
//                     </div>
//                   </div>

//                   <div className={styles5.detailEmptyText}>
//                     Click "View Details" on a card
//                   </div>
//                   <div className={styles5.detailEmptySubtext}>
//                     Details will appear here after you click.
//                   </div>
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }

// /* ---------------- Card and helpers ---------------- */

// function Card({ item, onOpen, onDelete }) {
//   const getTypeColor = (type) => {
//     const colors = {
//       featured: "from-orange-500 to-red-600",
//       normal: "from-blue-500 to-purple-600",
//       releaseSoon: "from-green-500 to-emerald-600",
//       latestTrailers: "from-pink-500 to-rose-600",
//     };
//     return colors[type] || "from-gray-500 to-gray-600";
//   };

//   const posterOrThumb =
//     item.poster ||
//     item.thumbnail ||
//     item.image ||
//     item.latestTrailer?.thumbnail ||
//     null;

//   return (
//     <div
//       className={styles5.card}
//       onClick={onOpen}
//     >
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           if (typeof onDelete === "function") onDelete();
//         }}
//         title="Delete"
//         aria-label={`Delete ${item.movieName || item.title}`}
//         className={styles5.cardDeleteButton}
//       >
//         <X size={14} />
//       </button>

//       <div className="relative">
//         <img
//           src={posterOrThumb}
//           alt={item.movieName || item.title || item.displayTitle}
//           className={styles5.cardImage}
//         />
//       </div>

//       <div className={styles5.cardContent}>
//         <div className={styles5.cardHeader}>
//           <div className="flex-1 min-w-0">
//             <h3 className={styles5.cardTitle}>
//               {item.movieName || item.title || item.displayTitle}
//             </h3>
//             <div className={styles5.cardCategories}>
//               {(item.categories || item.genres || []).map((cat, index) => (
//                 <span
//                   key={index}
//                   className={styles5.cardCategory}
//                 >
//                   {cat}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* UPDATED: hide rating & duration for releaseSoon cards */}
//           <div className={styles5.cardRatingContainer}>
//             {item.type !== "releaseSoon" && (
//               <>
//                 {item.rating && (
//                   <div className={styles5.cardRating}>
//                     <Star
//                       className={styles5.cardRatingIcon}
//                       size={14}
//                       fill="currentColor"
//                     />
//                     <span className={styles5.cardRatingText}>
//                       {item.rating}
//                     </span>
//                   </div>
//                 )}
//                 {item.duration && (
//                   <div className={styles5.cardDuration}>
//                     <Clock className={styles5.cardDurationIcon} size={14} />
//                     <span className={styles5.cardDurationText}>
//                       {displayDuration(item)}
//                     </span>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         <p className={styles5.cardDescription}>
//           {(item.story || item.description || item.excerpt || "").slice(0, 150)}
//           {(item.story || item.description || item.excerpt || "").length >
//             150 && "..."}
//         </p>

//         <div className={styles5.cardActions}>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onOpen();
//               }}
//               className={styles5.cardViewButton}
//             >
//               <Play size={16} />
//               View Details
//             </button>

//             {item.trailerUrl && item.type !== "releaseSoon" && (
//               <a
//                 href={item.trailerUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 onClick={(e) => e.stopPropagation()}
//                 className={styles5.cardTrailerButton}
//               >
//                 <PlayIcon className={styles5.cardTrailerIcon} /> Trailer
//               </a>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function displayDuration(item) {
//   if (!item) return "";
//   // numeric (minutes)
//   if (item.duration && typeof item.duration === "number") {
//     const totalMins = item.duration;
//     if (totalMins < 60) return `${totalMins}m`;
//     const hours = Math.floor(totalMins / 60);
//     const mins = totalMins % 60;
//     return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
//   }
//   // object {hours, minutes}
//   if (item.duration && typeof item.duration === "object") {
//     const h = item.duration.hours ?? 0;
//     const m = item.duration.minutes ?? 0;
//     if (h && m) return `${h}h ${m}m`;
//     if (h) return `${h}h`;
//     return `${m}m`;
//   }
//   return "";
// }

// function formatSlot(s) {
//   try {
//     const d = s.date ? new Date(s.date + "T00:00:00") : null;
//     const dayName = d
//       ? d.toLocaleDateString(undefined, { weekday: "short" })
//       : "";
//     const dateStr = d ? d.toLocaleDateString() : s.date || "";
//     const time = s.time || "";
//     const ampm = s.ampm || "";
//     return `${dayName} ${dateStr} • ${time} ${ampm}`.trim();
//   } catch (e) {
//     return `${s.date || ""} ${s.time || ""} ${s.ampm || ""}`;
//   }
// }

// function PersonGrid({ list = [], roleLabel = "" }) {
//   if (!list || list.length === 0) return null;

//   return (
//     <div className={styles5.personGrid}>
//       <div className={styles5.personHeader}>
//         <div className={styles5.personDot}></div>
//         <div className={styles5.personTitle}>{roleLabel}</div>
//       </div>
//       <div className={styles5.personList}>
//         {list.map((p, i) => (
//           <div
//             key={i}
//             className={styles5.personItem}
//           >
//             <div className="relative">
//               <img
//                 src={p.preview || p.file || p.image || p.url || ""}
//                 alt={p.name || `${roleLabel}-${i}`}
//                 className={styles5.personAvatar}
//               />
//             </div>
//             <div className={styles5.personName}>
//               {p.name || "-"}
//             </div>
//             {p.role && p.role !== roleLabel && (
//               <div className={styles5.personRole}>
//                 {p.role}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function DetailView({ item, onClose }) {
//   const getTypeGradient = (type) => {
//     const gradients = {
//       featured: "from-orange-500 to-red-600",
//       normal: "from-blue-500 to-purple-600",
//       releaseSoon: "from-green-500 to-emerald-600",
//       latestTrailers: "from-pink-500 to-rose-600",
//     };
//     return gradients[type] || "from-gray-500 to-gray-600";
//   };

//   // final auditorium to display (fallback to "Audi 1")
//   const displayAuditorium =
//     item?.auditorium || item?.auditorium === "" ? item.auditorium : "Audi 1";

//   return (
//     <div className={styles5.detailContainer}>
//       {/* Header */}
//       <div className={styles5.detailHeaderContainer}>
//         <div className="flex-1">
//           <div className={styles5.detailTypeIndicator}>
//             <div
//               className={`${styles5.detailTypeDot} bg-gradient-to-r ${getTypeGradient(
//                 item.type
//               )}`}
//             ></div>
//             <span className={styles5.detailTypeText}>
//               {item.type === "featured" && "Featured Movie"}
//               {item.type === "normal" && "Now Showing"}
//               {item.type === "releaseSoon" && "Coming Soon"}
//               {item.type === "latestTrailers" && "Latest Trailer"}
//             </span>
//           </div>
//           <h2 className={styles5.detailContentTitle}>
//             {item.movieName || item.title || item.displayTitle}
//           </h2>
//         </div>
//         <button
//           onClick={onClose}
//           className={styles5.detailCloseButton}
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {/* Content based on type */}
//       <div className="space-y-6">
//         {/* Latest Trailers */}
//         {item.type === "latestTrailers" && (
//           <>
//             {item.thumbnail && (
//               <div className={styles5.detailThumbnail}>
//                 <img
//                   src={item.thumbnail}
//                   alt={item.title}
//                   className={styles5.detailThumbnailImage}
//                 />
//               </div>
//             )}

//             <div className={styles5.detailGrid}>
//               {item.genres && item.genres.length > 0 && (
//                 <div className={styles5.detailGridItem}>
//                   <div className={styles5.detailGridLabel}>
//                     Genres
//                   </div>
//                   <div className={styles5.detailGridValue}>
//                     {(item.genres || []).join(", ")}
//                   </div>
//                 </div>
//               )}
//               {item.year && (
//                 <div className={styles5.detailGridItem}>
//                   <div className={styles5.detailGridLabel}>
//                     Year
//                   </div>
//                   <div className={styles5.detailGridValue}>{item.year}</div>
//                 </div>
//               )}

//               {item.duration && (
//                 <div className={styles5.detailGridItem}>
//                   <div className={styles5.detailGridLabel}>
//                     Duration
//                   </div>
//                   <div className={styles5.detailGridValue}>
//                     {displayDuration(item)}
//                   </div>
//                 </div>
//               )}

//               {item.rating && (
//                 <div className={styles5.detailGridItem}>
//                   <div className={styles5.detailGridLabel}>
//                     Rating
//                   </div>
//                   <div className={styles5.detailRatingValue}>
//                     <Star size={16} fill="currentColor" />
//                     {item.rating}/10
//                   </div>
//                 </div>
//               )}

//               {/* NEW: Auditorium display for trailers too (if present) */}
//               <div className={styles5.detailGridItem}>
//                 <div className={styles5.detailGridLabel}>
//                   Auditorium
//                 </div>
//                 <div className={styles5.detailGridValue}>
//                   {displayAuditorium}
//                 </div>
//               </div>
//             </div>

//             <div className={styles5.detailDescription}>
//               <div className={styles5.descriptionLabel}>
//                 Description
//               </div>
//               <div className={styles5.descriptionText}>
//                 {item.description}
//               </div>
//             </div>

//             {item.trailerUrl && (
//               <a
//                 href={item.trailerUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className={styles5.watchTrailerButton}
//               >
//                 <Play size={20} />
//                 Watch Trailer Now
//               </a>
//             )}

//             <PersonGrid list={item.directors} roleLabel="Directors" />
//             <PersonGrid list={item.producers} roleLabel="Producers" />
//             <PersonGrid list={item.singers} roleLabel="Singers" />
//           </>
//         )}

//         {/* Normal & Featured Movies */}
//         {(item.type === "normal" || item.type === "featured") && (
//           <>
//             <div className="grid grid-cols-1 gap-6">
//               <div className={styles5.detailThumbnail}>
//                 <img
//                   src={item.poster}
//                   alt={item.movieName}
//                   className={styles5.detailPoster}
//                 />
//               </div>

//               <div className={styles5.detailInfoGrid}>
//                 <div className={styles5.detailInfoItem}>
//                   <div className={styles5.detailInfoLabel}>
//                     Rating
//                   </div>
//                   <div className={styles5.detailRatingValue}>
//                     <Star size={18} fill="currentColor" />
//                     {item.rating ?? "-"}
//                     /10
//                   </div>
//                 </div>

//                 <div className={styles5.detailInfoItem}>
//                   <div className={styles5.detailInfoLabel}>
//                     Duration
//                   </div>
//                   <div className={styles5.detailRatingValue}>
//                     <Clock size={18} />
//                     {displayDuration(item)}
//                   </div>
//                 </div>

//                 {/* NEW: Auditorium block */}
//                 <div className={styles5.detailInfoItem}>
//                   <div className={styles5.detailInfoLabel}>
//                     Auditorium
//                   </div>
//                   <div className={styles5.detailInfoValue}>
//                     {displayAuditorium}
//                   </div>
//                 </div>

//                 {item.seatPrices && (
//                   <>
//                     <div className={styles5.detailInfoItem}>
//                       <div className={styles5.detailInfoLabel}>
//                         Standard
//                       </div>
//                       <div className={styles5.seatPrice}>
//                         ₹{item.seatPrices.standard}
//                       </div>
//                     </div>

//                     <div className={styles5.detailInfoItem}>
//                       <div className={styles5.detailInfoLabel}>
//                         Recliner
//                       </div>
//                       <div className={styles5.seatPrice}>
//                         ₹{item.seatPrices.recliner}
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {item.trailerUrl && (
//                 <a
//                   href={item.trailerUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   className={`${styles5.cardTrailerButton} justify-center`}
//                 >
//                   <Play size={18} />
//                   Watch Official Trailer
//                 </a>
//               )}
//             </div>

//             <div className={styles5.storySection}>
//               <div className={styles5.storyLabel}>
//                 <div className={styles5.storyDot}></div>
//                 <div className={styles5.descriptionLabel}>
//                   Story
//                 </div>
//               </div>
//               <div className={styles5.storyText}>
//                 {item.story}
//               </div>
//             </div>

//             {(item.slots || []).length > 0 && (
//               <div className={styles5.showtimesSection}>
//                 <div className={styles5.showtimesHeader}>
//                   <Calendar size={20} className={styles5.showtimesIcon} />
//                   <div className={styles5.descriptionLabel}>
//                     Showtimes
//                   </div>
//                 </div>
//                 <div className={styles5.showtimesList}>
//                   {(item.slots || []).map((s, i) => (
//                     <div
//                       key={i}
//                       className={styles5.showtimeItem}
//                     >
//                       <div className={styles5.showtimeText}>
//                         {formatSlot(s)}
//                       </div>
//                       <div className={styles5.showtimeStatus}>
//                         <div className={styles5.showtimeDot}></div>
//                         <span className={styles5.showtimeStatusText}>
//                           AVAILABLE
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <PersonGrid list={item.cast} roleLabel="Cast" />
//             <PersonGrid list={item.directors} roleLabel="Directors" />
//             <PersonGrid list={item.producers} roleLabel="Producers" />
//           </>
//         )}

//         {/* Release Soon */}
//         {item.type === "releaseSoon" && (
//           <div className={styles5.releaseSoonContainer}>
//             <div className={styles5.releaseSoonImage}>
//               <img
//                 src={item.poster}
//                 alt={item.movieName}
//                 className={styles5.detailPoster}
//               />
//             </div>
//             <div className={styles5.releaseSoonText}>
//               Coming Soon
//             </div>
//             <div className={styles5.releaseSoonCategories}>
//               {(item.categories || []).map((cat, i) => (
//                 <span
//                   key={i}
//                   className={styles5.releaseSoonCategory}
//                 >
//                   {cat}
//                 </span>
//               ))}
//             </div>
//             <div className={styles5.releaseSoonMessage}>
//               Stay tuned for more updates!
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/components/ListMoviesPage/ListMoviesPage.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Film,
  Play,
  Star,
  Clock,
  Calendar,
  Ticket,
  Play as PlayIcon,
  Search,
  X,
  Edit2 as EditIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { styles5, customStyles } from "../../assets/dummyStyles";

const API_BASE = "https://moviebooking-backend-vo9q.onrender.com";

function getImageUrl(maybe) {
  if (!maybe) return null;
  if (typeof maybe !== "string") return maybe;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  const cleaned = String(maybe).replace(/^uploads\//, "");
  return `${API_BASE}/uploads/${cleaned}`;
}

export default function ListMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRef = useRef();
  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      fetchMovies();
    }, 300);
    return () => clearTimeout(searchRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, search]);

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterType && filterType !== "all" && filterType !== "latestTrailers") {
        params.type = filterType;
      }
      if (filterType === "latestTrailers") {
        params.latestTrailers = true;
      }
      if (search && search.trim()) params.search = search.trim();

      const res = await axios.get(`${API_BASE}/api/movies`, { params });

      let items = [];
      if (res?.data?.success) {
        items = res.data.items || [];
      } else if (Array.isArray(res?.data)) {
        items = res.data;
      } else {
        items = [];
      }

      const normalized = items.map(normalizeMovie);
      setMovies(normalized);
      console.log("movies (normalized):", normalized);
    } catch (err) {
      console.error("fetchMovies error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  function normalizeMovie(item) {
    const obj = { ...item };
    obj.poster = getImageUrl(item.poster) || (item.poster ? item.poster : null);

    const normalizeTopPeople = (arr = []) =>
      (arr || []).map((p) => ({
        ...(p || {}),
        preview: p?.preview || getImageUrl(p?.file) || p?.file || p?.image || p?.url || null,
      }));

    obj.cast = normalizeTopPeople(item.cast);
    obj.directors = normalizeTopPeople(item.directors);
    obj.producers = normalizeTopPeople(item.producers);

    if (
      item.latestTrailer &&
      (item.type === "latestTrailers" || item.latestTrailer.title || item.latestTrailer.thumbnail || item.latestTrailer.videoId)
    ) {
      const lt = item.latestTrailer || {};
      obj.title = lt.title || item.title || item.movieName || null;
      obj.thumbnail = getImageUrl(lt.thumbnail) || getImageUrl(item.thumbnail) || lt.thumbnail || null;
      obj.trailerUrl = lt.videoId || item.trailerUrl || lt.trailerUrl || null;
      obj.genres = lt.genres || item.genres || [];
      obj.year = lt.year || item.year || null;
      obj.rating = lt.rating ?? item.rating ?? null;
      obj.duration = lt.duration || item.duration || null;
      obj.description = lt.description || item.description || item.story || null;

      const normalizeLatestPeople = (arr = []) =>
        (arr || []).map((p) => ({
          ...(p || {}),
          preview: p?.preview || getImageUrl(p?.file) || p?.file || null,
        }));

      obj.directors = normalizeLatestPeople(lt.directors || item.latestTrailer?.directors || item.directors || []);
      obj.producers = normalizeLatestPeople(lt.producers || item.latestTrailer?.producers || item.producers || []);
      obj.singers = normalizeLatestPeople(lt.singers || item.latestTrailer?.singers || []);
    } else {
      obj.thumbnail = getImageUrl(item.thumbnail) || obj.poster || null;
    }

    obj.type = obj.type || (obj.title && !obj.movieName ? "latestTrailers" : "normal");
    obj.displayTitle = obj.movieName || obj.title || obj.movieName || "Untitled";

    return obj;
  }

  const types = useMemo(
    () => [
      { key: "all", label: "All", icon: Film },
      { key: "normal", label: "Normal", icon: Ticket },
      { key: "featured", label: "Featured", icon: Star },
      { key: "releaseSoon", label: "Coming Soon", icon: Calendar },
      { key: "latestTrailers", label: "Trailers", icon: PlayIcon },
    ],
    []
  );

  const filtered = useMemo(() => {
    return (movies || []).filter((item) => item.type !== "cinenews");
  }, [movies]);

  async function handleDelete(id) {
    const item = movies.find((m) => m._id === id || m.id === id);
    if (!item) return;
    const title = item.movieName || item.title || "this item";
    const ok = window.confirm(`Delete "${title}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      const targetId = item._id || item.id || id;
      await axios.delete(`${API_BASE}/api/movies/${targetId}`);
      setMovies((prev) => prev.filter((m) => (m._id || m.id) !== targetId));
      if (selected && (selected._id || selected.id) === targetId) setSelected(null);
    } catch (err) {
      console.error("deleteMovie error:", err);
      alert("Failed to delete movie. See console for details.");
    }
  }

  // onSave passed to DetailView -> update the movies array and selected
  function handleSaveUpdatedMovie(updated) {
    const normalized = normalizeMovie(updated);
    setMovies((prev) => {
      const exists = prev.some((p) => (p._id || p.id) === (normalized._id || normalized.id));
      if (!exists) return [normalized, ...prev];
      return prev.map((p) => ((p._id || p.id) === (normalized._id || normalized.id) ? normalized : p));
    });
    setSelected(normalized);
  }

  return (
    <div className={styles5.listMoviesContainer}>
      <style>{customStyles}</style>

      <div className={styles5.maxWidth7xl}>
        <header className={styles5.listMoviesHeader}>
          <div className={styles5.listMoviesHeaderInner}>
            <div className="text-left">
              <h1 className={styles5.listMoviesTitle}>Movies</h1>
              <div className={styles5.listMoviesSubtitle}>{loading ? "Loading..." : `${filtered.length} items`}</div>
            </div>

            <div className={styles5.searchContainer}>
              <div className={styles5.searchBox}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies, stories, trailers..." className={styles5.searchInput} />
                <div className={styles5.searchIcon}>
                  <Search size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className={styles5.filterContainer}>
            {types.map((t) => {
              const IconComponent = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setFilterType(t.key);
                  }}
                  className={`${styles5.filterButton} ${filterType === t.key ? styles5.filterButtonActive : styles5.filterButtonInactive}`}
                >
                  <IconComponent size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className={styles5.mainGrid}>
          <div className={styles5.leftColumn}>
            <div className={styles5.cardsGrid}>
              {error && (
                <div className={styles5.errorContainer}>
                  <div className={styles5.errorMessage}>Error</div>
                  <div className="text-sm mt-2">{error}</div>
                  <div className="mt-3">
                    <button onClick={fetchMovies} className={styles5.errorRetryButton}>
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {!error && filtered.length === 0 && !loading && (
                <div className={styles5.emptyState}>
                  <div className={styles5.emptyStateText}>No items found</div>
                  <div className={styles5.emptyStateSubtext}>Try adjusting your search or filters</div>
                </div>
              )}

              {filtered.map((item) => (
                <Card
                  key={item._id || item.id || item.title || item.displayTitle}
                  item={item}
                  onOpen={() => setSelected(item)}
                  onDelete={() => handleDelete(item._id || item.id)}
                />
              ))}

              {loading && (
                <div className={styles5.loadingState}>
                  <div className={styles5.loadingText}>Loading movies…</div>
                </div>
              )}
            </div>
          </div>

          <aside className={styles5.rightColumn}>
            <div className={styles5.detailSidebar}>
              <div className={styles5.detailHeader}>
                <h2 className={styles5.detailTitle}>Details</h2>
                <div className={styles5.detailLiveIndicator}>
                  <div className={styles5.detailLiveDot}></div>
                  <span className={styles5.detailLiveText}>Live</span>
                </div>
              </div>

              {selected ? (
                <DetailView item={selected} onClose={() => setSelected(null)} onSave={handleSaveUpdatedMovie} />
              ) : (
                <div className={styles5.detailEmptyState}>
                  <div className="flex items-center justify-center mb-3 w-full">
                    <div className={styles5.detailEmptyIcon}>
                      <Film size={60} className="text-red-600" />
                    </div>
                  </div>

                  <div className={styles5.detailEmptyText}>Click "View Details" on a card</div>
                  <div className={styles5.detailEmptySubtext}>Details will appear here after you click.</div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Card and helpers ---------------- */

function Card({ item, onOpen, onDelete }) {
  const posterOrThumb = item.poster || item.thumbnail || item.image || item.latestTrailer?.thumbnail || null;

  return (
    <div className={styles5.card} onClick={onOpen}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onDelete === "function") onDelete();
        }}
        title="Delete"
        aria-label={`Delete ${item.movieName || item.title}`}
        className={styles5.cardDeleteButton}
      >
        <X size={14} />
      </button>

      <div className="relative">
        <img src={posterOrThumb} alt={item.movieName || item.title || item.displayTitle} className={styles5.cardImage} />
      </div>

      <div className={styles5.cardContent}>
        <div className={styles5.cardHeader}>
          <div className="flex-1 min-w-0">
            <h3 className={styles5.cardTitle}>{item.movieName || item.title || item.displayTitle}</h3>
            <div className={styles5.cardCategories}>
              {(item.categories || item.genres || []).map((cat, index) => (
                <span key={index} className={styles5.cardCategory}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className={styles5.cardRatingContainer}>
            {item.type !== "releaseSoon" && (
              <>
                {item.rating && (
                  <div className={styles5.cardRating}>
                    <Star className={styles5.cardRatingIcon} size={14} fill="currentColor" />
                    <span className={styles5.cardRatingText}>{item.rating}</span>
                  </div>
                )}
                {item.duration && (
                  <div className={styles5.cardDuration}>
                    <Clock className={styles5.cardDurationIcon} size={14} />
                    <span className={styles5.cardDurationText}>{displayDuration(item)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className={styles5.cardDescription}>
          {(item.story || item.description || item.excerpt || "").slice(0, 150)}
          {(item.story || item.description || item.excerpt || "").length > 150 && "..."}
        </p>

        <div className={styles5.cardActions}>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className={styles5.cardViewButton}
            >
              <Play size={16} />
              View Details
            </button>

            {item.trailerUrl && item.type !== "releaseSoon" && (
              <a href={item.trailerUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={styles5.cardTrailerButton}>
                <PlayIcon className={styles5.cardTrailerIcon} /> Trailer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function displayDuration(item) {
  if (!item) return "";
  if (item.duration && typeof item.duration === "number") {
    const totalMins = item.duration;
    if (totalMins < 60) return `${totalMins}m`;
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }
  if (item.duration && typeof item.duration === "object") {
    const h = item.duration.hours ?? 0;
    const m = item.duration.minutes ?? 0;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  }
  return "";
}

function formatSlot(s) {
  try {
    const d = s.date ? new Date(s.date + "T00:00:00") : null;
    const dayName = d ? d.toLocaleDateString(undefined, { weekday: "short" }) : "";
    const dateStr = d ? d.toLocaleDateString() : s.date || "";
    const time = s.time || "";
    const ampm = s.ampm || "";
    return `${dayName} ${dateStr} • ${time} ${ampm}`.trim();
  } catch (e) {
    return `${s.date || ""} ${s.time || ""} ${s.ampm || ""}`;
  }
}

function PersonGrid({ list = [], roleLabel = "" }) {
  if (!list || list.length === 0) return null;

  return (
    <div className={styles5.personGrid}>
      <div className={styles5.personHeader}>
        <div className={styles5.personDot}></div>
        <div className={styles5.personTitle}>{roleLabel}</div>
      </div>
      <div className={styles5.personList}>
        {list.map((p, i) => (
          <div key={i} className={styles5.personItem}>
            <div className="relative">
              <img src={p.preview || p.file || p.image || p.url || ""} alt={p.name || `${roleLabel}-${i}`} className={styles5.personAvatar} />
            </div>
            <div className={styles5.personName}>{p.name || "-"}</div>
            {p.role && p.role !== roleLabel && <div className={styles5.personRole}>{p.role}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- DetailView + Edit form ---------------- */

function DetailView({ item, onClose, onSave }) {
  const [editing, setEditing] = useState(false);

  // Pass the item to the edit form when editing
  return (
    <div className={styles5.detailContainer}>
      <div className={styles5.detailHeaderContainer}>
        <div className="flex-1">
          <div className={styles5.detailTypeIndicator}>
            <div
              className={`${styles5.detailTypeDot} bg-gradient-to-r ${
                item.type === "featured"
                  ? "from-orange-500 to-red-600"
                  : item.type === "normal"
                  ? "from-blue-500 to-purple-600"
                  : item.type === "releaseSoon"
                  ? "from-green-500 to-emerald-600"
                  : "from-pink-500 to-rose-600"
              }`}
            ></div>
            <span className={styles5.detailTypeText}>
              {item.type === "featured" && "Featured Movie"}
              {item.type === "normal" && "Now Showing"}
              {item.type === "releaseSoon" && "Coming Soon"}
              {item.type === "latestTrailers" && "Latest Trailer"}
            </span>
          </div>
          <h2 className={styles5.detailContentTitle}>{item.movieName || item.title || item.displayTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setEditing((s) => !s)} className={styles5.editToggleButton} title={editing ? "Cancel edit" : "Edit movie"}>
            <EditIcon size={16} />
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={onClose} className={styles5.detailCloseButton}>
            <X size={20} />
          </button>
        </div>
      </div>

      {!editing && (
        <div className="space-y-6">
          {/* same content as before (read-only) */}
          {item.type === "latestTrailers" && (
            <>
              {item.thumbnail && (
                <div className={styles5.detailThumbnail}>
                  <img src={item.thumbnail} alt={item.title} className={styles5.detailThumbnailImage} />
                </div>
              )}

              <div className={styles5.detailGrid}>
                {item.genres && item.genres.length > 0 && (
                  <div className={styles5.detailGridItem}>
                    <div className={styles5.detailGridLabel}>Genres</div>
                    <div className={styles5.detailGridValue}>{(item.genres || []).join(", ")}</div>
                  </div>
                )}
                {item.year && (
                  <div className={styles5.detailGridItem}>
                    <div className={styles5.detailGridLabel}>Year</div>
                    <div className={styles5.detailGridValue}>{item.year}</div>
                  </div>
                )}
                {item.duration && (
                  <div className={styles5.detailGridItem}>
                    <div className={styles5.detailGridLabel}>Duration</div>
                    <div className={styles5.detailGridValue}>{displayDuration(item)}</div>
                  </div>
                )}
                {item.rating && (
                  <div className={styles5.detailGridItem}>
                    <div className={styles5.detailGridLabel}>Rating</div>
                    <div className={styles5.detailRatingValue}>
                      <Star size={16} fill="currentColor" />
                      {item.rating}/10
                    </div>
                  </div>
                )}

                <div className={styles5.detailGridItem}>
                  <div className={styles5.detailGridLabel}>Auditorium</div>
                  <div className={styles5.detailGridValue}>{item?.auditorium ?? "Audi 1"}</div>
                </div>
              </div>

              <div className={styles5.detailDescription}>
                <div className={styles5.descriptionLabel}>Description</div>
                <div className={styles5.descriptionText}>{item.description}</div>
              </div>

              {item.trailerUrl && (
                <a href={item.trailerUrl} target="_blank" rel="noreferrer" className={styles5.watchTrailerButton}>
                  <Play size={20} />
                  Watch Trailer Now
                </a>
              )}

              <PersonGrid list={item.directors} roleLabel="Directors" />
              <PersonGrid list={item.producers} roleLabel="Producers" />
              <PersonGrid list={item.singers} roleLabel="Singers" />
            </>
          )}

          {(item.type === "normal" || item.type === "featured") && (
            <>
              <div className="grid grid-cols-1 gap-6">
                <div className={styles5.detailThumbnail}>
                  <img src={item.poster} alt={item.movieName} className={styles5.detailPoster} />
                </div>

                <div className={styles5.detailInfoGrid}>
                  <div className={styles5.detailInfoItem}>
                    <div className={styles5.detailInfoLabel}>Rating</div>
                    <div className={styles5.detailRatingValue}>
                      <Star size={18} fill="currentColor" />
                      {item.rating ?? "-"}
                      /10
                    </div>
                  </div>

                  <div className={styles5.detailInfoItem}>
                    <div className={styles5.detailInfoLabel}>Duration</div>
                    <div className={styles5.detailRatingValue}>
                      <Clock size={18} />
                      {displayDuration(item)}
                    </div>
                  </div>

                  <div className={styles5.detailInfoItem}>
                    <div className={styles5.detailInfoLabel}>Auditorium</div>
                    <div className={styles5.detailInfoValue}>{item?.auditorium ?? "Audi 1"}</div>
                  </div>

                  {item.seatPrices && (
                    <>
                      <div className={styles5.detailInfoItem}>
                        <div className={styles5.detailInfoLabel}>Standard</div>
                        <div className={styles5.seatPrice}>₹{item.seatPrices.standard}</div>
                      </div>

                      <div className={styles5.detailInfoItem}>
                        <div className={styles5.detailInfoLabel}>Recliner</div>
                        <div className={styles5.seatPrice}>₹{item.seatPrices.recliner}</div>
                      </div>
                    </>
                  )}
                </div>

                {item.trailerUrl && (
                  <a href={item.trailerUrl} target="_blank" rel="noreferrer" className={`${styles5.cardTrailerButton} justify-center`}>
                    <Play size={18} />
                    Watch Official Trailer
                  </a>
                )}
              </div>

              <div className={styles5.storySection}>
                <div className={styles5.storyLabel}>
                  <div className={styles5.storyDot}></div>
                  <div className={styles5.descriptionLabel}>Story</div>
                </div>
                <div className={styles5.storyText}>{item.story}</div>
              </div>

              {(item.slots || []).length > 0 && (
                <div className={styles5.showtimesSection}>
                  <div className={styles5.showtimesHeader}>
                    <Calendar size={20} className={styles5.showtimesIcon} />
                    <div className={styles5.descriptionLabel}>Showtimes</div>
                  </div>
                  <div className={styles5.showtimesList}>
                    {(item.slots || []).map((s, i) => (
                      <div key={i} className={styles5.showtimeItem}>
                        <div className={styles5.showtimeText}>{formatSlot(s)}</div>
                        <div className={styles5.showtimeStatus}>
                          <div className={styles5.showtimeDot}></div>
                          <span className={styles5.showtimeStatusText}>AVAILABLE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <PersonGrid list={item.cast} roleLabel="Cast" />
              <PersonGrid list={item.directors} roleLabel="Directors" />
              <PersonGrid list={item.producers} roleLabel="Producers" />
            </>
          )}

          {item.type === "releaseSoon" && (
            <div className={styles5.releaseSoonContainer}>
              <div className={styles5.releaseSoonImage}>
                <img src={item.poster} alt={item.movieName} className={styles5.detailPoster} />
              </div>
              <div className={styles5.releaseSoonText}>Coming Soon</div>
              <div className={styles5.releaseSoonCategories}>
                {(item.categories || []).map((cat, i) => (
                  <span key={i} className={styles5.releaseSoonCategory}>
                    {cat}
                  </span>
                ))}
              </div>
              <div className={styles5.releaseSoonMessage}>Stay tuned for more updates!</div>
            </div>
          )}
        </div>
      )}

      {editing && <EditMovieForm initial={item} onCancel={() => setEditing(false)} onSaved={(updated) => { setEditing(false); onSave && onSave(updated); }} />}
    </div>
  );
}

/* ---------------- EditMovieForm ----------------
   - Edits all fields (text, arrays, slots, seatPrices, duration object/number, poster/thumbnail file uploads, people arrays)
   - Sends PUT request. Uses multipart/form-data if there are files, else JSON.
*/
function EditMovieForm({ initial = {}, onCancel, onSaved }) {
  const [form, setForm] = useState(() => deepCloneMovie(initial));
  const [posterFile, setPosterFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [personFiles, setPersonFiles] = useState({}); // { role_index: File }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function deepCloneMovie(src) {
    // safe shallow deep clone for editing
    const clone = JSON.parse(JSON.stringify(src || {}));
    // ensure arrays exist
    clone.cast = clone.cast || [];
    clone.directors = clone.directors || [];
    clone.producers = clone.producers || [];
    clone.singers = clone.singers || [];
    clone.slots = clone.slots || [];
    clone.seatPrices = clone.seatPrices || clone.seatPrices || { standard: "", recliner: "" };
    return clone;
  }

  useEffect(() => {
    setForm(deepCloneMovie(initial));
    setPosterFile(null);
    setThumbnailFile(null);
    setPersonFiles({});
    setError(null);
  }, [initial]);

  function setField(path, value) {
    setForm((prev) => {
      const copy = { ...prev };
      // support top-level fields only for simplicity
      copy[path] = value;
      return copy;
    });
  }

  function updatePerson(role, idx, field, value) {
    setForm((prev) => {
      const copy = { ...prev };
      copy[role] = Array.isArray(copy[role]) ? [...copy[role]] : [];
      copy[role][idx] = { ...(copy[role][idx] || {}), [field]: value };
      return copy;
    });
  }

  function addPerson(role) {
    setForm((prev) => {
      const copy = { ...prev };
      copy[role] = Array.isArray(copy[role]) ? [...copy[role]] : [];
      copy[role].push({ name: "", preview: "" });
      return copy;
    });
  }

  function removePerson(role, idx) {
    setForm((prev) => {
      const copy = { ...prev };
      copy[role] = (copy[role] || []).filter((_, i) => i !== idx);
      return copy;
    });
    // remove any referenced file
    setPersonFiles((pf) => {
      const cp = { ...pf };
      delete cp[`${role}_${idx}`];
      return cp;
    });
  }

  function addSlot() {
    setForm((prev) => ({ ...prev, slots: [...(prev.slots || []), { date: "", time: "", ampm: "" }] }));
  }

  function removeSlot(i) {
    setForm((prev) => ({ ...prev, slots: (prev.slots || []).filter((_, idx) => idx !== i) }));
  }

  function updateSlot(i, field, value) {
    setForm((prev) => {
      const cp = { ...prev };
      cp.slots = [...(cp.slots || [])];
      cp.slots[i] = { ...(cp.slots[i] || {}), [field]: value };
      return cp;
    });
  }

  function handlePosterChange(e) {
    const f = e.target.files?.[0] || null;
    setPosterFile(f);
    if (f) {
      setForm((p) => ({ ...p, posterPreview: URL.createObjectURL(f) }));
    }
  }
  function handleThumbnailChange(e) {
    const f = e.target.files?.[0] || null;
    setThumbnailFile(f);
    if (f) {
      setForm((p) => ({ ...p, thumbnailPreview: URL.createObjectURL(f) }));
    }
  }

  function handlePersonFileChange(role, idx, e) {
    const f = e.target.files?.[0] || null;
    setPersonFiles((pf) => ({ ...pf, [`${role}_${idx}`]: f }));
    if (f) {
      updatePerson(role, idx, "preview", URL.createObjectURL(f));
    }
  }

  function addCategory() {
    const val = (form.categories || form.genres || []).slice();
    val.push("");
    setField("categories", val);
  }
  function updateCategory(idx, value) {
    setForm((prev) => {
      const cp = { ...prev };
      cp.categories = [...(cp.categories || cp.genres || [])];
      cp.categories[idx] = value;
      return cp;
    });
  }
  function removeCategory(idx) {
    setForm((prev) => {
      const cp = { ...prev };
      cp.categories = (cp.categories || cp.genres || []).filter((_, i) => i !== idx);
      return cp;
    });
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const payload = { ...form };

      // Normalize categories/genres to an array of strings
      if (payload.categories && !Array.isArray(payload.categories) && payload.genres) {
        payload.categories = payload.genres;
      }

      // Convert seatPrices fields to numbers when possible
      if (payload.seatPrices) {
        payload.seatPrices = {
          standard: payload.seatPrices.standard ? Number(payload.seatPrices.standard) : payload.seatPrices.standard,
          recliner: payload.seatPrices.recliner ? Number(payload.seatPrices.recliner) : payload.seatPrices.recliner,
        };
      }

      // If posterFile/thumbnailFile or any personFiles exist, use FormData
      const hasFiles = posterFile || thumbnailFile || Object.keys(personFiles).length > 0;

      if (hasFiles) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        if (posterFile) fd.append("poster", posterFile);
        if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

        // append person files with keys like cast_0, directors_1 etc.
        Object.entries(personFiles).forEach(([k, file]) => {
          if (file) fd.append(k, file);
        });

        // send multipart
        const url = `${API_BASE}/api/movies/${encodeURIComponent(payload._id || payload.id)}`;
        const res = await axios.put(url, fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (res?.data) {
          onSaved && onSaved(res.data.success ? res.data.item || res.data : res.data);
        } else {
          onSaved && onSaved(payload);
        }
      } else {
        // send JSON
        const url = `${API_BASE}/api/movies/${encodeURIComponent(payload._id || payload.id)}`;
        const res = await axios.put(url, payload, { headers: { "Content-Type": "application/json" } });
        if (res?.data) {
          onSaved && onSaved(res.data.success ? res.data.item || res.data : res.data);
        } else {
          onSaved && onSaved(payload);
        }
      }
    } catch (err) {
      console.error("save movie error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to save movie");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles5.editContainer}>
      <div className={styles5.editHeader}>
        <h3 className={styles5.editTitle}>Edit Movie</h3>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className={styles5.editCancelButton}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className={styles5.editSaveButton}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className={styles5.editBody}>
        {error && <div className={styles5.errorMessage}>{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          {/* Basic fields */}
          <label className={styles5.formLabel}>
            Title / Movie Name
            <input className={styles5.formInput} value={form.movieName || form.title || ""} onChange={(e) => setField("movieName", e.target.value)} />
          </label>

          <label className={styles5.formLabel}>
            Story / Description
            <textarea className={styles5.formTextarea} value={form.story || form.description || ""} onChange={(e) => setField("story", e.target.value)} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className={styles5.formLabel}>
              Year
              <input type="number" className={styles5.formInput} value={form.year ?? ""} onChange={(e) => setField("year", e.target.value)} />
            </label>

            <label className={styles5.formLabel}>
              Rating
              <input type="number" min="0" max="10" step="0.1" className={styles5.formInput} value={form.rating ?? ""} onChange={(e) => setField("rating", e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className={styles5.formLabel}>
              Duration (minutes) — OR fill hours/minutes into object
              <input type="number" className={styles5.formInput} value={typeof form.duration === "number" ? form.duration : form.duration?.minutes ?? ""} onChange={(e) => setField("duration", Number(e.target.value))} />
            </label>

            <label className={styles5.formLabel}>
              Type
              <select className={styles5.formSelect} value={form.type || "normal"} onChange={(e) => setField("type", e.target.value)}>
                <option value="normal">Normal</option>
                <option value="featured">Featured</option>
                <option value="releaseSoon">Coming Soon</option>
                <option value="latestTrailers">Latest Trailers</option>
              </select>
            </label>
          </div>

          {/* Auditorium */}
          <label className={styles5.formLabel}>
            Auditorium
            <input className={styles5.formInput} value={form.auditorium ?? ""} onChange={(e) => setField("auditorium", e.target.value)} />
          </label>

          {/* seat prices */}
          <div className="grid grid-cols-2 gap-4">
            <label className={styles5.formLabel}>
              Seat Price — Standard
              <input type="number" className={styles5.formInput} value={form.seatPrices?.standard ?? ""} onChange={(e) => setField("seatPrices", { ...(form.seatPrices || {}), standard: e.target.value })} />
            </label>
            <label className={styles5.formLabel}>
              Seat Price — Recliner
              <input type="number" className={styles5.formInput} value={form.seatPrices?.recliner ?? ""} onChange={(e) => setField("seatPrices", { ...(form.seatPrices || {}), recliner: e.target.value })} />
            </label>
          </div>

          {/* Trailer URL */}
          <label className={styles5.formLabel}>
            Trailer URL
            <input className={styles5.formInput} value={form.trailerUrl ?? ""} onChange={(e) => setField("trailerUrl", e.target.value)} />
          </label>

          {/* Poster / Thumbnail uploads */}
          <div className="grid grid-cols-2 gap-4">
            <label className={styles5.formLabel}>
              Poster (file OR keep existing URL)
              <input type="file" accept="image/*" onChange={handlePosterChange} />
              <div className="mt-2">
                <img src={posterFile ? URL.createObjectURL(posterFile) : form.posterPreview || form.poster || getImageUrl(form.poster)} alt="poster-preview" style={{ maxWidth: "100%", maxHeight: 140 }} />
              </div>
            </label>

            <label className={styles5.formLabel}>
              Thumbnail (file OR keep existing URL)
              <input type="file" accept="image/*" onChange={handleThumbnailChange} />
              <div className="mt-2">
                <img src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : form.thumbnailPreview || form.thumbnail || getImageUrl(form.thumbnail)} alt="thumb-preview" style={{ maxWidth: "100%", maxHeight: 140 }} />
              </div>
            </label>
          </div>

          {/* categories/genres editable as list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={styles5.formLabel}>Categories / Genres</div>
              <button type="button" onClick={addCategory} className={styles5.smallButton}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(form.categories || form.genres || []).map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input className={styles5.formInput} value={c} onChange={(e) => updateCategory(idx, e.target.value)} />
                  <button type="button" onClick={() => removeCategory(idx)} className={styles5.iconButton}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* showtimes / slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={styles5.formLabel}>Showtimes / Slots</div>
              <button type="button" onClick={addSlot} className={styles5.smallButton}>
                <Plus size={14} /> Add slot
              </button>
            </div>

            <div className="space-y-2">
              {(form.slots || []).map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <input className={styles5.formInput} placeholder="YYYY-MM-DD" value={s.date || ""} onChange={(e) => updateSlot(i, "date", e.target.value)} />
                  <input className={styles5.formInput} placeholder="Time (e.g. 07:30 PM or 19:30)" value={s.time || ""} onChange={(e) => updateSlot(i, "time", e.target.value)} />
                  <input className={styles5.formInput} placeholder="AM/PM" value={s.ampm || ""} onChange={(e) => updateSlot(i, "ampm", e.target.value)} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => removeSlot(i)} className={styles5.iconButton}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* People arrays: cast, directors, producers, singers */}
          {["cast", "directors", "producers", "singers"].map((role) => (
            <div key={role}>
              <div className="flex items-center justify-between mb-2">
                <div className={styles5.formLabel}>{role.charAt(0).toUpperCase() + role.slice(1)}</div>
                <button type="button" onClick={() => addPerson(role)} className={styles5.smallButton}>
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="space-y-2">
                {(form[role] || []).map((p, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                    <input placeholder="Name" className={styles5.formInput} value={p.name || ""} onChange={(e) => updatePerson(role, idx, "name", e.target.value)} />
                    <input placeholder="Role label" className={styles5.formInput} value={p.role || ""} onChange={(e) => updatePerson(role, idx, "role", e.target.value)} />
                    <input placeholder="Image URL (or upload file)" className={styles5.formInput} value={p.preview || p.file || ""} onChange={(e) => updatePerson(role, idx, "preview", e.target.value)} />
                    <input type="file" accept="image/*" onChange={(e) => handlePersonFileChange(role, idx, e)} />
                    <div>
                      <img src={p.preview || p.file || ""} alt={p.name || `${role}-${idx}`} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }} />
                    </div>
                    <div>
                      <button type="button" onClick={() => removePerson(role, idx)} className={styles5.iconButton}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
