const express = require("express");
const router = express.Router();
const cacheMiddleware = require("../middlewares/redisMiddleware");

const {
  getPublicMovies,
  getPublicMovieById,
  searchMovies
} = require("../controllers/movieController");

/**
 * @swagger
 * tags:
 *   name: B2C - Movies
 *   description: Public movie listing and search endpoints (Consumer-facing)
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all available movies
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: List of movies
 */
router.get("/", cacheMiddleware(3600), getPublicMovies);

/**
 * @swagger
 * /api/movies/search:
 *   get:
 *     summary: Search movies by text
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching movies
 *       400:
 *         description: Search query 'q' is required
 */
router.get("/search", cacheMiddleware(3600), searchMovies);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movie details
 *       404:
 *         description: Movie not found
 */
router.get("/:id", cacheMiddleware(3600), getPublicMovieById);

module.exports = router;
