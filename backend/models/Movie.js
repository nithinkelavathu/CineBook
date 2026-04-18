const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: String
  },
  language: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  showTime: {
    type: String
  },
  image: {
    type: String
  },
  genre: {
    type: String,
    default: "All"
  }
}, { timestamps: true });

// Add text index for solr-like search functionality
movieSchema.index({ title: 'text', description: 'text', genre: 'text' });

// Add index for query optimization
movieSchema.index({ showTime: 1, price: 1 });

module.exports = mongoose.model("Movie", movieSchema);