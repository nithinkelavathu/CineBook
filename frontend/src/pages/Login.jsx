import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ use login helper

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      const { token, role } = res.data;

      // ✅ Use context login function
      login(token, role);

      // ✅ Redirect based on role
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "user") {
        navigate("/user");
      } else {
        alert("Invalid role received from server");
      }

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
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
          <span style={styles.logoIcon}>🎬</span>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to continue to CineBook</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p style={styles.note}>
          Don't have an account?{" "}
          <span 
            style={styles.link} 
            onClick={() => navigate("/signup")}
          >
            Create one now
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a", // Deep slate background
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
    top: "-15%",
    left: "-10%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(244,63,94,0.15) 0%, rgba(15,23,42,0) 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  shape2: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
  },
  card: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.7)", // Semi-transparent card
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "40px 50px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "35px",
  },
  logoIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#94a3b8",
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  label: {
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "8px",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#ffffff",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(225, 29, 72, 0.4)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  note: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "14px",
    color: "#94a3b8",
  },
  link: {
    color: "#f43f5e",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },
};

// Simple global CSS for the hover effects and inputs
const injectStyles = () => {
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.innerHTML = `
            input:focus {
                border-color: #f43f5e !important;
                box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2) !important;
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(225, 29, 72, 0.5) !important;
            }
            button:active {
                transform: translateY(1px);
            }
        `;
        document.head.appendChild(style);
    }
};
injectStyles();

export default Login;