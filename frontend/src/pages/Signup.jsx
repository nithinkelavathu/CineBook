import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ⏱ Countdown Timer Logic
  React.useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!validatePassword(password)) {
      alert("Password must be at least 6 characters and include uppercase, lowercase, and number");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", { email });
      alert("Verification code sent to your email! 📧");
      setTimer(300); // Reset timer
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        otp,
      });

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundShapes}>
        <div style={styles.shape1}></div>
        <div style={styles.shape2}></div>
      </div>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <span style={styles.logoIcon}>{step === 1 ? "🍿" : "🛡️"}</span>
          <h2 style={styles.title}>{step === 1 ? "Create Account" : "Verify Email"}</h2>
          <p style={styles.subtitle}>
            {step === 1 
              ? "Join CineBook to book tickets easily" 
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputRow}>
              <div style={{ ...styles.inputGroup, flex: 1, marginRight: '10px' }}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 1, marginLeft: '10px' }}>
                <label style={styles.label}>Confirm</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>One-Time Password (OTP)</label>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{...styles.input, textAlign: "center", fontSize: "24px", letterSpacing: "8px"}}
                maxLength="6"
                required
              />
              <div style={{display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "14px"}}>
                <span style={{color: timer > 0 ? "#94a3b8" : "#f43f5e"}}>
                  {timer > 0 ? `Expires in: ${formatTime(timer)}` : "Code expired!"}
                </span>
                <span 
                  style={{
                    color: timer === 0 && !loading ? "#3b82f6" : "#4b5563",
                    cursor: timer === 0 && !loading ? "pointer" : "default",
                    fontWeight: "600",
                    textDecoration: timer === 0 ? "underline" : "none"
                  }}
                  onClick={timer === 0 && !loading ? handleSendOtp : null}
                >
                  Resend OTP
                </span>
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={loading || timer === 0}>
              {loading ? "Verifying..." : "Verify & Signup"}
            </button>

            <button 
              type="button" 
              style={{...styles.button, background: "transparent", border: "1px solid #3b82f6", color: "#3b82f6", boxShadow: "none", marginTop: "10px"}} 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back to Details
            </button>
          </form>
        )}

        <p style={styles.note}>
          Already have an account?{" "}
          <span 
            style={styles.link} 
            onClick={() => navigate("/login")}
          >
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  backgroundShapes: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
    overflow: "hidden",
  },
  shape1: {
    position: "absolute",
    top: "-10%",
    right: "-5%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(244,63,94,0.15) 0%, rgba(15,23,42,0) 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  shape2: {
    position: "absolute",
    bottom: "-15%",
    left: "-10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "40px 50px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logoIcon: {
    fontSize: "42px",
    display: "block",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputRow: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
  },
  label: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  input: {
    padding: "13px 15px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "15px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  note: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "14px",
    color: "#94a3b8",
  },
  link: {
    color: "#3b82f6",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },
};

const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('cinebook-signup-styles')) {
      const style = document.createElement('style');
      style.id = 'cinebook-signup-styles';
      style.innerHTML = `
          input:focus {
              border-color: #3b82f6 !important;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
          }
          button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5) !important;
          }
          button:active {
              transform: translateY(1px);
          }
      `;
      document.head.appendChild(style);
  }
};
injectStyles();

export default Signup;