const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const adminRoutes = require("../routes/adminRoutes");
const User = require("../models/user");
const Movie = require("../models/Movie");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

describe("Admin API Tests", () => {
  const TEST_URI = process.env.MONGO_URI.replace(/\/[^/]+$/, "/cinebook_test");
  let adminToken;
  let userToken;
  let testMovieId;

  beforeAll(async () => {
    await mongoose.connect(TEST_URI);
    const redisClient = require("../utils/redisClient");
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    
    // 1. Create Admin User
    const admin = await User.create({
      name: "Admin Tester",
      email: "admin@test.com",
      password: "AdminPassword123",
      role: "admin"
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET);

    // 2. Create Regular User
    const user = await User.create({
      name: "Regular User",
      email: "user@test.com",
      password: "UserPassword123",
      role: "user"
    });
    userToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    // 3. Create a Movie to test update/delete
    const movie = await Movie.create({
      title: "Admin Test Movie",
      price: 300,
      genre: "Thriller"
    });
    testMovieId = movie._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Movie.deleteMany({});
    await mongoose.connection.close();
    const redisClient = require("../utils/redisClient");
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    redisClient.quit();
  });

  it("GET /api/admin/dashboard - should fail for non-admin user", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toBe("Access denied. Admin only.");
  });

  it("GET /api/admin/dashboard - should succeed for admin user", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("totalUsers");
    expect(res.body).toHaveProperty("totalMovies");
  });

  it("POST /api/admin/movies - should add a movie as admin", async () => {
    const res = await request(app)
      .post("/api/admin/movies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "New Admin Movie",
        price: 350,
        genre: "Horror"
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toBe("New Admin Movie");
  });

  it("PUT /api/admin/movies/:id - should update a movie as admin", async () => {
    const res = await request(app)
      .put(`/api/admin/movies/${testMovieId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        price: 400
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.price).toBe(400);
  });

  it("DELETE /api/admin/movies/:id - should delete a movie as admin", async () => {
    const res = await request(app)
      .delete(`/api/admin/movies/${testMovieId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Movie deleted");
    
    const movie = await Movie.findById(testMovieId);
    expect(movie).toBeNull();
  });
});
