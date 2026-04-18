// backend/routes/bookingRoutes.js

const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  deleteBooking,
  getBookedSeats,
  updateSnacks,
  createCheckoutSession,      // ADDED
  createSnacksCheckoutSession, // ADDED
} = require("../controllers/bookingController");

const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/bookings/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns session url
 */
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

/**
 * @swagger
 * /api/bookings/{id}/snacks/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session for snacks
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               snacks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Returns session url
 */
router.post("/:id/snacks/create-checkout-session", authMiddleware, createSnacksCheckoutSession); // NEW

/**
 * @swagger
 * tags:
 *   name: B2C - Bookings
 *   description: Ticket booking and snacks management endpoints (Consumer-facing)
 */

/**
 * @swagger
 * /api/bookings/show-seats:
 *   get:
 *     summary: Get all booked seats for a specific show
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: theatre
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: time
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Returns an array of booked seat IDs
 */
router.get("/show-seats", authMiddleware, getBookedSeats);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movie:
 *                 type: string
 *                 description: Movie ID
 *               theatre:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *               total:
 *                 type: number
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post("/", authMiddleware, createBooking);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Get bookings for the currently logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's bookings
 */
router.get("/my", authMiddleware, getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (only owner)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
router.delete("/:id", authMiddleware, deleteBooking);

/**
 * @swagger
 * /api/bookings/{id}/snacks:
 *   put:
 *     summary: Add snacks to an existing booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id/snacks", authMiddleware, updateSnacks);

module.exports = router;