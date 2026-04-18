const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bookingRoutes = require("../routes/bookingRoutes");
const User = require("../models/user");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const dotenv = require("dotenv");

dotenv.config();

// 1. Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: "test_session_id", url: "http://test.com" }),
      },
    },
  }));
});

// 2. Mock Nodemailer
jest.mock("../utils/sendEmail", () => {
  return jest.fn().mockResolvedValue(true);
});

const app = express();
app.use(express.json());
app.use("/api/bookings", bookingRoutes);

describe("Booking API Tests", () => {
  const TEST_URI = process.env.MONGO_URI.replace(/\/[^/]+$/, "/cinebook_test");
  let token;
  let userId;
  let testMovieId;

  beforeAll(async () => {
    await mongoose.connect(TEST_URI);
    const redisClient = require("../utils/redisClient");
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    
    // Create a user and a movie for the tests
    const user = await User.create({
      name: "Booking Tester",
      email: "booking@test.com",
      password: "HashedPassword123"
    });
    userId = user._id;
    token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    const movie = await Movie.create({
      title: "Test Movie",
      price: 250,
      genre: "Action"
    });
    testMovieId = movie._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Booking.deleteMany({});
    await mongoose.connection.close();
    const redisClient = require("../utils/redisClient");
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    redisClient.quit();
  });

  it("POST /api/bookings/create-checkout-session - should return stripe session", async () => {
    const res = await request(app)
      .post("/api/bookings/create-checkout-session")
      .set("Authorization", `Bearer ${token}`)
      .send({ total: 500, movieTitle: "Test Movie" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", "test_session_id");
  });

  it("POST /api/bookings - should create a new booking", async () => {
    const bookingData = {
      movie: testMovieId,
      theatre: "Cineplex 1",
      date: "2024-05-01",
      time: "18:00",
      seats: ["A1", "A2"],
      total: 500
    };

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(bookingData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.movie.toString()).toBe(testMovieId.toString());
    expect(res.body.seats).toContain("A1");
  });

  it("GET /api/bookings/my - should return user bookings", async () => {
    const res = await request(app)
      .get("/api/bookings/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /api/bookings/show-seats - should return booked seats", async () => {
    const res = await request(app)
      .get(`/api/bookings/show-seats?movieId=${testMovieId}&theatre=Cineplex 1&date=2024-05-01&time=18:00`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.bookedSeats).toContain("A1");
    expect(res.body.bookedSeats).toContain("A2");
  });
});
