// backend/tests/movie.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const movieRoutes = require("../routes/movieRoutes");
const redisClient = require("../utils/redisClient");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/movies", movieRoutes);

describe("Movie API Tests", () => {
  // Use a safer default if MONGO_URI is missing
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cinebook";
  const TEST_URI = MONGO_URI.replace(/\/[^/?]+(\?.*)?$/, "/cinebook_test$1");

  beforeAll(async () => {
    await mongoose.connect(TEST_URI);
    // Compatibility: redisClient handles connection status internally
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
  });

  afterAll(async () => {
    // Properly clean up connections after test
    await mongoose.connection.close();
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    await redisClient.quit();
  });

  it("GET /api/movies - should get all movies", async () => {
    const res = await request(app).get("/api/movies");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("GET /api/movies/search?q=movie - should return matching results or empty array", async () => {
    const res = await request(app).get("/api/movies/search?q=movie");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("GET /api/movies/search - should fail if no query is provided", async () => {
    const res = await request(app).get("/api/movies/search");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("Search query 'q' is required");
  });
});
