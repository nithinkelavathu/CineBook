const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminMiddleware");

const {
  getDashboardStats,
  addMovie,
  getMovies,
  updateMovie,
  deleteMovie,
  getUsers,
  promoteUser,
  toggleSubscription,
  getBookings,
  cancelBooking,
} = require("../controllers/adminController");

/**
 * @swagger
 * tags:
 *   name: B2B - Admin
 *   description: Administrative operations for partners and management (Business-facing)
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/dashboard", protect, adminOnly, getDashboardStats);

/* Movies */
/**
 * @swagger
 * /api/admin/movies:
 *   post:
 *     summary: Add a new movie
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Movie created
 *   get:
 *     summary: Get all movies (admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of movies
 */
router.post("/movies", protect, adminOnly, addMovie);
router.get("/movies", protect, adminOnly, getMovies);

/**
 * @swagger
 * /api/admin/movies/{id}:
 *   put:
 *     summary: Update a movie
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Movie updated
 *   delete:
 *     summary: Delete a movie
 *     tags: [Admin]
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
 *         description: Movie deleted
 */
router.put("/movies/:id", protect, adminOnly, updateMovie);
router.delete("/movies/:id", protect, adminOnly, deleteMovie);

/* Users */
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", protect, adminOnly, getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/promote:
 *   put:
 *     summary: Promote a user to admin
 *     tags: [Admin]
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
 *         description: User promoted
 */
router.put("/users/:id/promote", protect, adminOnly, promoteUser);
router.put("/users/:id/subscription", protect, adminOnly, toggleSubscription);

/* Bookings */
/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get("/bookings", protect, adminOnly, getBookings);

/**
 * @swagger
 * /api/admin/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a user booking
 *     tags: [Admin]
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
 *         description: Booking cancelled
 */
router.put("/bookings/:id/cancel", protect, adminOnly, cancelBooking);

module.exports = router;