import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/movies/${id}`);
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // ✅ Added rows and cols for dynamic theatre sizes
  const theatres = [
    {
      name: "PVR Cinemas",
      rows: 10,
      cols: 15,
      shows: {
        Yesterday: ["4:00 PM", "9:00 PM"],
        Today: ["10:00 AM", "1:30 PM", "6:00 PM", "9:30 PM"],
        Tomorrow: ["11:00 AM", "3:00 PM", "8:00 PM"],
        Fri: ["9:30 AM", "12:30 PM", "4:30 PM"],
        Sat: ["10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"],
        Sun: ["11:00 AM", "3:00 PM", "7:00 PM"],
      },
    },
    {
      name: "INOX",
      rows: 8,
      cols: 12,
      shows: {
        Yesterday: ["2:00 PM", "7:30 PM"],
        Today: ["11:00 AM", "2:30 PM", "7:00 PM"],
        Tomorrow: ["12:00 PM", "4:00 PM", "9:00 PM"],
        Fri: ["10:30 AM", "1:30 PM"],
        Sat: ["9:00 AM", "12:00 PM", "5:00 PM"],
        Sun: ["10:00 AM", "6:00 PM"],
      },
    },
    {
      name: "Cinepolis",
      rows: 6,
      cols: 10,
      shows: {
        Yesterday: ["1:00 PM", "6:45 PM"],
        Today: ["9:00 AM", "12:30 PM", "5:00 PM", "10:00 PM"],
        Tomorrow: ["10:30 AM", "3:30 PM", "9:30 PM"],
        Fri: ["11:00 AM", "4:00 PM"],
        Sat: ["9:30 AM", "1:30 PM", "6:30 PM"],
        Sun: ["12:00 PM", "8:00 PM"],
      },
    },
  ];

  const dates = ["Yesterday", "Today", "Tomorrow", "Fri", "Sat", "Sun"];

  if (loading) return <h2>Loading movie details...</h2>;
  if (!movie) return <h2>Movie not found</h2>;

  const handleTimeClick = (theatre, time) => {
    const count = prompt("Enter number of tickets (1-10):");

    if (!count) return;

    const ticketCount = parseInt(count);

    if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 10) {
      alert("Please enter a valid number between 1 and 10");
      return;
    }

    // ✅ Pass rows and cols to the booking page
    navigate("/booking", {
      state: {
        movie,
        selectedDate,
        selectedTheatre: theatre.name,
        selectedTime: time,
        ticketCount,
        rows: theatre.rows,
        cols: theatre.cols
      },
    });
  };

  return (
    <div style={styles.container}>
      {/* Movie Info */}
      <div style={styles.movieSection}>
        <img src={movie.image || "https://fakeimg.pl/500x700?text=No+Image"} alt={movie.title} style={styles.image} />
        <div>
          <h1>{movie.title}</h1>
          <p>{movie.description}</p>
          <p><strong>Duration:</strong> {movie.duration} mins</p>
          <p><strong>Price:</strong> ₹{movie.price}</p>
        </div>
      </div>

      {/* Date Selection */}
      <h3>Select Date</h3>
      <div style={styles.dateContainer}>
        {dates.map((date, index) => (
          <button
            key={index}
            style={{
              ...styles.dateBtn,
              backgroundColor: selectedDate === date ? "#f43f5e" : "#1e293b",
            }}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </button>
        ))}
      </div>

      {/* Theatre & Timings */}
      {selectedDate && (
        <>
          <h3 style={{ marginTop: "30px" }}>Select Theatre & Show Time</h3>

          {theatres.map((theatre, index) => (
            <div key={index} style={styles.theatreCard}>
              <h4>{theatre.name}</h4>

              <div style={styles.timingContainer}>
                {theatre.shows[selectedDate]?.map((time, i) => (
                  <button
                    key={i}
                    style={styles.timeBtn}
                    onClick={() => handleTimeClick(theatre, time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0f172a",
    color: "#fff",
    minHeight: "100vh",
    padding: "40px",
  },
  movieSection: {
    display: "flex",
    gap: "30px",
    marginBottom: "30px",
  },
  image: {
    width: "200px",
    borderRadius: "12px",
  },
  dateContainer: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  dateBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },
  theatreCard: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "15px",
  },
  timingContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  timeBtn: {
    padding: "8px 15px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#334155",
    color: "#fff",
    cursor: "pointer",
  },
};

export default MovieDetails;