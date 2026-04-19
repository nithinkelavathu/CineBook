import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MovieDetails from "./pages/MovieDetails";
import BookingPage from "./pages/BookingPage";
import BookingSuccess from "./pages/BookingSuccess";
import PaymentProcessing from "./pages/PaymentProcessing"; 
import SnacksPaymentProcessing from "./pages/SnacksPaymentProcessing"; 
import MyBookings from "./pages/MyBookings";
import SnacksSelection from "./pages/SnacksSelection"; 

import AdminMovies from "./pages/AdminMovies";      
import AdminUsers from "./pages/AdminUsers";        
import AdminBookings from "./pages/AdminBookings";  

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Home Redirect */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected User Dashboard */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Movie Details Page */}
      <Route
        path="/movie/:id"
        element={
          <ProtectedRoute role="user">
            <MovieDetails />
          </ProtectedRoute>
        }
      />

      {/* Protected Booking Page */}
      <Route
        path="/booking"
        element={
          <ProtectedRoute role="user">
            <BookingPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADD Snacks Selection Route */}
      <Route
        path="/snacks-selection"
        element={
          <ProtectedRoute role="user">
            <SnacksSelection />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADD Payment Processing Route */}
      <Route
        path="/payment-processing"
        element={
          <ProtectedRoute role="user">
            <PaymentProcessing />
          </ProtectedRoute>
        }
      />
      {/* ✅ ADD Snacks Payment Processing Route */}
      <Route
        path="/snacks-payment-processing"
        element={
          <ProtectedRoute role="user">
            <SnacksPaymentProcessing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-success"
        element={
          <ProtectedRoute role="user">
            <BookingSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute role="user">
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* ✅ Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/movies"
        element={
          <ProtectedRoute role="admin">
            <AdminMovies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute role="admin">
            <AdminBookings />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />

    </Routes>
  );
}

export default App;