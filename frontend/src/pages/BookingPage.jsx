import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state;

  if (!bookingData) {
    return <h2 style={{ color: "white" }}>No booking data found</h2>;
  }

  // ✅ Now receiving ticketCount and dynamic rows/cols
  const {
    movie,
    selectedDate,
    selectedTheatre,
    selectedTime,
    ticketCount,
    rows = 8,  // Fallback if undefined
    cols = 10  // Fallback if undefined
  } = bookingData;

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSeats, setFetchingSeats] = useState(true);

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://cinebook-xypk.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  // Fetch true booked seats from the backend
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://cinebook-xypk.onrender.com/api/bookings/show-seats", {
          params: {
            movieId: movie._id,
            theatre: selectedTheatre,
            date: selectedDate,
            time: selectedTime,
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const bookedSeatIds = res.data.bookedSeats || [];

        // Generate the grid with accurate booked status
        const generatedSeats = [];
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
            generatedSeats.push({
              id: seatId,
              type: row < 2 ? "balcony" : "normal",
              booked: bookedSeatIds.includes(seatId),
            });
          }
        }
        setSeats(generatedSeats);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
      } finally {
        setFetchingSeats(false);
      }
    };

    fetchBookedSeats();
  }, [movie._id, selectedTheatre, selectedDate, selectedTime]);

  // ✅ UPDATED toggleSeat with limit
  const toggleSeat = (seat) => {
    if (seat.booked) return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.id));
    } else {
      if (selectedSeats.length >= ticketCount) {
        alert(`You can only select ${ticketCount} seats`);
        return;
      }
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  const ticketsTotal = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return sum + (seat?.type === "balcony" ? 300 : 200);
  }, 0);

  const subtotal = ticketsTotal;

  let discountPercentage = 0;
  if (userProfile?.subscription === "premium") {
    discountPercentage = 20;
  } else if (userProfile?.isFirstBooking) {
    discountPercentage = 10;
  }

  const discountApplied = (subtotal * discountPercentage) / 100;
  const finalTotal = subtotal - discountApplied;

  const handlePayment = async () => {
    if (selectedSeats.length !== ticketCount) {
      alert(`Please select exactly ${ticketCount} seats`);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // Save booking details temporarily so we can create it after Stripe succeeds
      const bookingDataToSave = {
        movie: movie._id,
        theatre: selectedTheatre,
        date: selectedDate,
        time: selectedTime,
        seats: selectedSeats,
        total: finalTotal,
        discountApplied
      };

      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingDataToSave));

      // Call Backend to generate Stripe Checkout URL
      const res = await axios.post(
        "https://cinebook-xypk.onrender.com/api/bookings/create-checkout-session",
        {
          total: finalTotal,
          movieTitle: movie.title
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect user to Stripe
      window.location.href = res.data.url;

    } catch (error) {
      console.error(error);
      alert("Failed to initialize payment.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{movie.title}</h2>
      <p>
        {selectedTheatre} | {selectedDate} | {selectedTime}
      </p>

      {/* ✅ Ticket info */}
      <h3>You selected {ticketCount} ticket(s)</h3>
      <p>
        Seats remaining to select:{" "}
        {ticketCount - selectedSeats.length}
      </p>

      {fetchingSeats ? (
        <h3 style={{ marginTop: "50px" }}>Loading seating layout...</h3>
      ) : (
        <div style={styles.seatContainer}>
          <div style={styles.screen}>SCREEN</div>
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} style={styles.row}>
              {seats
                .filter((seat) =>
                  seat.id.startsWith(String.fromCharCode(65 + rowIndex))
                )
                .map((seat) => {
                  const isSelected = selectedSeats.includes(seat.id);

                  return (
                    <div
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      style={{
                        ...styles.seat,
                        backgroundColor: seat.booked
                          ? "#dc2626"
                          : isSelected
                            ? "#f43f5e"
                            : seat.type === "balcony"
                              ? "#f59e0b"
                              : "#334155",
                        cursor: seat.booked ? "not-allowed" : "pointer",
                      }}
                    >
                      {seat.id}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      )}

      <div style={styles.legend}>
        <span>🟥 Booked</span>
        <span>🟨 Balcony ₹300</span>
        <span>⬜ Normal ₹200</span>
        <span>🟪 Selected</span>
      </div>

      <div style={styles.summary}>
        <p>Selected Seats: {selectedSeats.join(", ") || "None"}</p>
        <p>Subtotal: ₹{subtotal}</p>
        {discountPercentage > 0 && (
          <p style={{ color: "#10b981" }}>Discount Applied ({discountPercentage}%): -₹{discountApplied}</p>
        )}
        <h3>Total Amount: ₹{finalTotal}</h3>

        <button
          style={styles.payBtn}
          disabled={
            selectedSeats.length !== ticketCount || loading
          }
          onClick={handlePayment}
        >
          {loading ? "Processing Payment..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0f172a",
    color: "#fff",
    minHeight: "100vh",
    padding: "40px",
    textAlign: "center",
  },
  screen: {
    backgroundColor: "#e2e8f0",
    color: "#000",
    padding: "10px",
    margin: "20px auto",
    width: "60%",
    borderRadius: "5px",
  },
  seatContainer: {
    marginTop: "30px",
  },
  row: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },
  seat: {
    width: "50px",
    height: "50px",
    margin: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "0.2s",
  },
  summary: {
    marginTop: "30px",
  },
  payBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#f43f5e",
    color: "#fff",
    cursor: "pointer",
  },
  legend: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    fontSize: "16px",
  },
};

export default BookingPage;