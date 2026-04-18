import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserDashboard = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("https://cinebook-xypk.onrender.com/api/movies");
        setMovies(res.data);
      } catch (error) {
        console.error("Failed to fetch movies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div style={styles.container}>

      {/* Top Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.logoIcon}>🍿</span>
          <h2 style={styles.logo}>CineBook</h2>
        </div>

        <div style={styles.navCenter}>
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input type="text" placeholder="Search movies, theatres..." style={styles.search} />
          </div>
        </div>

        <div style={styles.navRight}>
          <span style={styles.welcomeText}>Hi, {auth?.role || 'User'}</span>
          <button onClick={() => navigate("/my-bookings")} style={styles.navBtnPrimary}>My Bookings</button>
          <button onClick={handleLogout} style={styles.navBtnSecondary}>Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Experience Cinema Like Never Before</h1>
          <p style={styles.heroSubtitle}>Book tickets for the latest blockbusters in premium theatres near you.</p>
          <button style={styles.heroBtn} onClick={() => document.getElementById('movies-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Movies
          </button>
        </div>
        <div style={styles.heroOverlay}></div>
      </div>

      <div style={styles.mainContent} id="movies-section">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Now Showing</h2>
          <div style={styles.filters}>
            {["All", "Action", "Comedy", "Sci-Fi"].map(genre => (
              <span
                key={genre}
                style={selectedGenre === genre ? styles.filterActive : styles.filterItem}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.movieGrid}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading premium movies...</p>
            </div>
          ) : movies.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '48px' }}>📽️</span>
              <p>No movies showing currently. Check back later!</p>
            </div>
          ) : (
            movies.filter(m => selectedGenre === "All" || m.genre === selectedGenre).length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '48px' }}>🍿</span>
                <p>No {selectedGenre} movies found.</p>
              </div>
            ) : (
              movies.filter(m => selectedGenre === "All" || m.genre === selectedGenre).map((movie) => (
                <div key={movie._id} style={styles.card} className="movie-card">
                  <div style={styles.imageContainer}>
                    <img
                      src={movie.image || "https://fakeimg.pl/300x450?text=No+Image"}
                      alt={movie.title}
                      style={styles.image}
                      className="movie-image"
                    />
                    <div style={styles.imageOverlay}>
                      <span style={styles.ratingBadge}>⭐ 4.5</span>
                    </div>
                  </div>
                  <div style={styles.cardContent}>
                    <h3 style={styles.movieTitle}>{movie.title}</h3>
                    <div style={styles.movieMeta}>
                      <span style={styles.moviePrice}>₹{movie.price}</span>
                      <span style={styles.movieFormat}>2D / 3D</span>
                    </div>
                    <button
                      style={styles.bookBtn}
                      onClick={() => navigate(`/movie/${movie._id}`)}
                      className="book-btn"
                    >
                      Book Tickets
                    </button>
                  </div>
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#09090b", // Deepers dark background
    color: "#fafafa",
    minHeight: "100vh",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 5%",
    backgroundColor: "rgba(9, 9, 11, 0.85)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logo: {
    margin: 0,
    color: "#f43f5e",
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  navCenter: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    padding: "8px 16px",
    width: "100%",
    maxWidth: "400px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "all 0.3s",
  },
  searchIcon: {
    fontSize: "14px",
    marginRight: "10px",
    opacity: 0.5,
  },
  search: {
    background: "transparent",
    border: "none",
    color: "#fff",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  welcomeText: {
    color: "#a1a1aa",
    fontSize: "14px",
    fontWeight: "500",
  },
  navBtnPrimary: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  navBtnSecondary: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "transparent",
    color: "#fafafa",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  hero: {
    position: "relative",
    height: "500px",
    display: "flex",
    alignItems: "center",
    padding: "0 5%",
    backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    marginBottom: "40px",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, rgba(9,9,11,1) 0%, rgba(9,9,11,0.7) 50%, rgba(9,9,11,0) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "600px",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "20px",
    background: "linear-gradient(to right, #ffffff, #a1a1aa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#d4d4d8",
    lineHeight: "1.6",
    marginBottom: "30px",
  },
  heroBtn: {
    padding: "14px 32px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(225, 29, 72, 0.4)",
    transition: "transform 0.2s ease",
  },
  mainContent: {
    padding: "0 5% 60px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    paddingBottom: "15px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },
  filters: {
    display: "flex",
    gap: "20px",
  },
  filterActive: {
    color: "#f43f5e",
    fontWeight: "600",
    cursor: "pointer",
    paddingBottom: "13px",
    borderBottom: "2px solid #f43f5e",
    marginBottom: "-16px",
  },
  filterItem: {
    color: "#a1a1aa",
    cursor: "pointer",
    fontWeight: "500",
    transition: "color 0.2s",
  },
  movieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "35px",
  },
  loadingContainer: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    color: "#a1a1aa",
  },
  spinner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#f43f5e",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 0",
    color: "#a1a1aa",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: "15px",
    border: "1px dashed rgba(255,255,255,0.1)",
  },
  card: {
    backgroundColor: "#18181b",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "360px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(to top, rgba(24, 24, 27, 1) 0%, rgba(24, 24, 27, 0) 40%)",
    pointerEvents: "none",
  },
  ratingBadge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    color: "#fbbf24",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  cardContent: {
    padding: "15px 20px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  movieTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  movieMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  moviePrice: {
    color: "#f43f5e",
    fontWeight: "700",
    fontSize: "16px",
  },
  movieFormat: {
    color: "#a1a1aa",
    fontSize: "12px",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  bookBtn: {
    border: "none",
    width: "100%",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    color: "#f43f5e",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "auto",
  },
};

const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('cinebook-dashboard-styles')) {
    const style = document.createElement('style');
    style.id = 'cinebook-dashboard-styles';
    style.innerHTML = `
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          .movie-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            border-color: rgba(244, 63, 94, 0.3);
          }
          
          .movie-card:hover .movie-image {
            transform: scale(1.08);
          }
          
          .book-btn:hover {
            background-color: #f43f5e !important;
            color: white !important;
          }
          
          input[type="text"]:focus {
            border-color: rgba(244, 63, 94, 0.5) !important;
            box-shadow: 0 0 0 2px rgba(244, 63, 94, 0.1) !important;
          }
      `;
    document.head.appendChild(style);
  }
};
injectStyles();

export default UserDashboard;