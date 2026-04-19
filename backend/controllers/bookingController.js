// backend/controllers/bookingController.js

const Booking = require("../models/Booking");
const sendEmail = require("../utils/sendEmail");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 🎟 Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { movie, theatre, date, time, seats, total, snacks, snacksCost, discountApplied } = req.body;

    console.log("Creating booking for user:", req.user?.email);

    const booking = await Booking.create({
      user: req.user._id,
      movie,
      theatre,
      date,
      time,
      seats,
      total,
      snacks: snacks || [],
      snacksCost: snacksCost || 0,
      discountApplied: discountApplied || 0,
    });

    // Mark user as no longer first booking
    if (req.user.isFirstBooking) {
      req.user.isFirstBooking = false;
      await req.user.save();
    }

    // Attempt to send email confirmation
    if (req.user && req.user.email) {
      console.log("Triggering email to:", req.user.email);
      const emailMessage = `
Hello ${req.user.name},

Your booking is confirmed! 🎬
Movie ID: ${movie}
Theatre: ${theatre}
Date: ${date}
Time: ${time}
Seats: ${seats.join(", ")}
Total Paid: ₹${total}

Enjoy the show!
CineBook Team
      `;
      await sendEmail({
        email: req.user.email,
        subject: "CineBook - Booking Confirmation 🍿",
        message: emailMessage,
      });
    } else {
      console.log("No user email found to send confirmation.");
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 💳 Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { total, movieTitle } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Movie Tickets: ${movieTitle || "CineBook"}`,
            },
            unit_amount: total * 100, // Stripe expects amount in paise (cents)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://cine-book-delta.vercel.app/payment-processing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://cine-book-delta.vercel.app/booking`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: error.message || "Stripe session creation failed" });
  }
};

// 💳 Create Stripe Checkout Session for SNACKS
exports.createSnacksCheckoutSession = async (req, res) => {
  try {
    const { total, bookingId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Snack Order for Booking #${bookingId.slice(-6)}`,
            },
            unit_amount: total * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Redirect to a specific snacks processing page
      success_url: `https://cine-book-delta.vercel.app/snacks-payment-processing?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `https://cine-book-delta.vercel.app/my-bookings`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Snacks Error:", error);
    res.status(500).json({ message: error.message || "Stripe session creation failed" });
  }
};

// 📄 Get My Bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("movie", "title image")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ❌ Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only booking owner can delete
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 🪑 Get Booked Seats for a Show
exports.getBookedSeats = async (req, res) => {
  try {
    const { movieId, theatre, date, time } = req.query;

    if (!movieId || !theatre || !date || !time) {
      return res.status(400).json({ message: "Missing query parameters" });
    }

    const bookings = await Booking.find({
      movie: movieId,
      theatre,
      date,
      time,
      status: "confirmed",
    });

    // Flatten all booked seats arrays into one array
    const bookedSeats = bookings.flatMap((booking) => booking.seats);

    res.json({ bookedSeats });
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 🍿 Add Snacks to Booking (AFTER ticket payment)
exports.updateSnacks = async (req, res) => {
  try {
    const { snacks, snacksCost } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Append new snacks to the existing array
    booking.snacks.push(...snacks);
    booking.snacksCost += snacksCost;
    booking.total += snacksCost; // Add to overall total
    await booking.save();

    // Send Snacks confirmation email
    if (req.user && req.user.email) {
      const snacksList = snacks.map(s => `${s.quantity}x ${s.name}`).join(", ");
      const snacksEmailMessage = `
Hello ${req.user.name},

Your snacks order for CineBook is confirmed! 🍿🥤
Order Details: ${snacksList}
Snacks Total: ₹${snacksCost}

Your snacks will be delivered to your seat during the show. Enjoy!
CineBook Canteen Team
      `;
      
      await sendEmail({
        email: req.user.email,
        subject: "CineBook - Snacks Order Confirmed! 🍿",
        message: snacksEmailMessage,
      });
    }

    res.json(booking);
  } catch (error) {
    console.error("Snacks Update Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};