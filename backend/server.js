// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const movieRoutes = require("./routes/movieRoutes"); // NEW

const { errorHandler } = require("./middlewares/errorMiddleware");
const redisClient = require("./utils/redisClient"); // ✅ Import for cleanup

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CineBook API",
      version: "1.0.0",
      description: "Movie Ticketing Booking API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
      {
        url: "https://cinebook-xypk.onrender.com",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/movies", movieRoutes); // NEW

// Global error handler
app.use(errorHandler);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected 🔥");
    app.listen(5000, () =>
      console.log("Server running on port 5000 🚀")
    );
  })
  .catch((err) => console.error(err));

// ✅ Cleanup Logic: Clear Redis cache when backend is closed
const gracefulShutdown = async () => {
    if (redisClient.status === "ready") {
        console.log("\n🧹 Cleaning up Redis cache...");
        try {
            await redisClient.flushdb();
            console.log("✅ Redis cache cleared.");
        } catch (err) {
            console.error("❌ Error clearing Redis:", err);
        }
    }
    console.log("👋 Backend shutting down. Goodbye!");
    process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);