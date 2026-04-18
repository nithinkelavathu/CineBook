const Movie = require("../models/Movie");

const getPublicMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies" });
  }
};

const getPublicMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movie details" });
  }
};

const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query 'q' is required" });
    }
    const movies = await Movie.find({ $text: { $search: q } });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error searching movies" });
  }
};

module.exports = {
  getPublicMovies,
  getPublicMovieById,
  searchMovies,
};
