import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const PaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("Processing your payment and generating your tickets...");

  useEffect(() => {
    const finalizeBooking = async () => {
      if (!sessionId) {
        setStatus("Invalid payment session.");
        return;
      }

      const pendingBookingStr = sessionStorage.getItem("pendingBooking");
      if (!pendingBookingStr) {
        setStatus("No pending booking found. It may have already been processed.");
        setTimeout(() => navigate("/user"), 3000);
        return;
      }

      try {
        const bookingData = JSON.parse(pendingBookingStr);
        const token = localStorage.getItem("token");

        // We assume payment was successful since we are on success_url.
        // In a strict production environment, we should verify the session_id status with Stripe here.
        
        const res = await axios.post(
          "http://localhost:5000/api/bookings",
          bookingData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Clear the storage
        sessionStorage.removeItem("pendingBooking");

        setStatus("Tickets confirmed successfully! Redirecting...");

        // Proceed to snacks selection (preserves original flow)
        setTimeout(() => {
          navigate("/snacks-selection", {
            state: { booking: res.data },
          });
        }, 1500);

      } catch (error) {
        console.error("Booking Finalization Error:", error);
        setStatus("Payment succeeded but ticket generation failed. Please contact support.");
      }
    };

    finalizeBooking();
  }, [sessionId, navigate]);

  return (
    <div style={styles.container}>
      <h2>Payment Processing...</h2>
      <p>{status}</p>
      {status.includes("Processing") && <div className="spinner"></div>}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0f172a",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  }
};

export default PaymentProcessing;
