const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("../routes/authRoutes");
const User = require("../models/user");
const Otp = require("../models/Otp");
const redisClient = require("../utils/redisClient");
const dotenv = require("dotenv");

dotenv.config();

// Mock the sendEmail utility
jest.mock("../utils/sendEmail", () => {
  return jest.fn().mockResolvedValue(true);
});

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Authentication API Tests", () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cinebook";
  const TEST_URI = MONGO_URI.replace(/\/[^/?]+(\?.*)?$/, "/cinebook_test$1");

  beforeAll(async () => {
    await mongoose.connect(TEST_URI);
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Otp.deleteMany({});
    await mongoose.connection.close();
    if (redisClient.status === "ready") {
      await redisClient.flushdb();
    }
    await redisClient.quit();
  });

  const testUser = {
    name: "Test User",
    email: "tester@example.com",
    password: "Password123",
    otp: "123456"
  };

  it("POST /api/auth/send-otp - should send OTP successfully", async () => {
    const res = await request(app)
      .post("/api/auth/send-otp")
      .send({ email: testUser.email });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("OTP sent to your email!");
    
    // Verify OTP was stored in DB
    const otpRecord = await Otp.findOne({ email: testUser.email });
    expect(otpRecord).toBeDefined();
    // Update the testUser object with the actual generated OTP for the next test
    testUser.otp = otpRecord.otp;
  });

  it("POST /api/auth/signup - should register user with valid OTP", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("User registered successfully! You can now login.");
    
    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeDefined();
    expect(user.name).toBe(testUser.name);
  });

  it("POST /api/auth/login - should login and return JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.role).toBe("user");
  });

  it("POST /api/auth/login - should fail with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword"
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
