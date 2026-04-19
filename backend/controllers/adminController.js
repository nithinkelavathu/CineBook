const User = require("../models/user");
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const redisClient = require("../utils/redisClient");


/* ================= DASHBOARD ================= */

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalMovies = await Movie.countDocuments();

    const confirmedBookings = await Booking.find({
      status: "confirmed",
    }).populate("movie", "title");

    const totalRevenue = confirmedBookings.reduce(
      (acc, booking) => acc + booking.total,
      0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyRevenue = 0;
    let snacksRevenue = 0;
    let ticketRevenue = 0;
    const revenuePerMovie = {};

    confirmedBookings.forEach((booking) => {
      // Daily revenue
      if (new Date(booking.createdAt) >= today) {
        dailyRevenue += booking.total;
      }
      
      // Breakdown
      const sCost = booking.snacksCost || 0;
      snacksRevenue += sCost;
      ticketRevenue += (booking.total - sCost);

      // Group by movie
      const movieTitle = booking.movie ? booking.movie.title : "Unknown";
      if (!revenuePerMovie[movieTitle]) {
        revenuePerMovie[movieTitle] = 0;
      }
      revenuePerMovie[movieTitle] += booking.total;
    });

    const totalProfit = (ticketRevenue * 0.3) + (snacksRevenue * 0.5);

    res.json({
      totalUsers,
      totalBookings,
      totalMovies,
      totalRevenue,
      dailyRevenue,
      totalProfit,
      revenuePerMovie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

/* ================= MOVIES ================= */

const addMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);

    // ✅ Invalidate Redis Cache
    if (redisClient.status === "ready") {
      await redisClient.del("cache:/api/movies");
      await redisClient.del("cache:/api/movies/search");
    }

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Error adding movie" });
  }
};

const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies" });
  }
};

const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!movie)
      return res.status(404).json({ message: "Movie not found" });

    // ✅ Invalidate Redis Cache
    if (redisClient.status === "ready") {
      await redisClient.del("cache:/api/movies");
      await redisClient.del("cache:/api/movies/search");
      await redisClient.del(`cache:/api/movies/${req.params.id}`);
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Error updating movie" });
  }
};

const deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);

    // ✅ Invalidate Redis Cache
    if (redisClient.status === "ready") {
      await redisClient.del("cache:/api/movies");
      await redisClient.del("cache:/api/movies/search");
      await redisClient.del(`cache:/api/movies/${req.params.id}`);
    }

    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting movie" });
  }
};

/* ================= USERS ================= */

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error promoting user" });
  }
};

const toggleSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.subscription = user.subscription === "premium" ? "none" : "premium";
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error toggling subscription" });
  }
};

/* ================= BOOKINGS ================= */

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("movie", "title");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking" });
  }
};

module.exports = {
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
};