// backend/tests/movie.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const movieRoutes = require("../routes/movieRoutes");
const dotenv = require("dotenv");

dotenv.config();

// Create an express app for testing router
const app = express();
app.use(express.json());
app.use("/api/movies", movieRoutes);

describe("Movie API Tests", () => {
  const TEST_URI = process.env.MONGO_URI.replace(/\/[^/]+$/, "/cinebook_test");

  beforeAll(async () => {
    await mongoose.connect(TEST_URI);
    const redisClient = require("../utils/redisClient");
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
  });

  afterAll(async () => {
    // Properly clean up connections after test
    await mongoose.connection.close();
    // close the redis client as well
    const redisClient = require("../utils/redisClient");
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    redisClient.quit();
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
