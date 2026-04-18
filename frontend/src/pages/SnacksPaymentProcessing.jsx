import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const SnacksPaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying snack payment...");
  const processingRef = useRef(false);

  useEffect(() => {
    const finalizeSnacks = async () => {
      // Prevent double-run due to React StrictMode
      if (processingRef.current) return;
      processingRef.current = true;

      const sessionId = searchParams.get("session_id");
      const bookingId = searchParams.get("booking_id");
      const pendingSnacksData = sessionStorage.getItem("pendingSnacks");

      if (!sessionId || !bookingId || !pendingSnacksData) {
        setStatus("Invalid session or missing snacks data.");
        setTimeout(() => navigate("/my-bookings"), 3000);
        return;
      }

      try {
        const { snacks, snacksCost } = JSON.parse(pendingSnacksData);
        const token = localStorage.getItem("token");

        setStatus("🍭 Finishing your snacks order...");

        // Call our original update snacks endpoint
        const res = await axios.put(
          `https://cinebook-xypk.onrender.com/api/bookings/${bookingId}/snacks`,
          { snacks, snacksCost },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStatus("✅ Snacks added successfully! Taking you to your ticket...");

        // Clear storage
        sessionStorage.removeItem("pendingSnacks");

        // Redirect to booking success page to show updated ticket
        setTimeout(() => {
          navigate("/booking-success", { state: res.data });
        }, 2000);

      } catch (error) {
        console.error("Finalize Snacks Error:", error);
        setStatus("❌ Failed to update snacks. Don't worry, your payment was processed. Please contact support.");
        setTimeout(() => navigate("/my-bookings"), 5000);
      }
    };

    finalizeSnacks();
  }, [navigate, searchParams]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.loader}></div>
        <h2 style={styles.text}>{status}</h2>
        <p style={styles.subtext}>Please do not close this window.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    maxWidth: "400px",
    width: "90%",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "5px solid #334155",
    borderTop: "5px solid #10b981",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px auto",
  },
  text: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  subtext: {
    color: "#94a3b8",
    fontSize: "14px",
  },
};

// Add CSS animation for loader
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default SnacksPaymentProcessing;
