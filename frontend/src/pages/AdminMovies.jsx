import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    image: "", // NEW
    genre: "Action", // NEW
  });
  const [editingId, setEditingId] = useState(null);

  const { auth } = useContext(AuthContext);

  // Fetch Movies
  const fetchMovies = async () => {
    const res = await axios.get(
      "https://cinebook-xypk.onrender.com/api/admin/movies",
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    setMovies(res.data);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update Movie
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await axios.put(
        `https://cinebook-xypk.onrender.com/api/admin/movies/${editingId}`,
        form,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setEditingId(null);
    } else {
      await axios.post(
        "https://cinebook-xypk.onrender.com/api/admin/movies",
        form,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
    }

    setForm({ title: "", description: "", duration: "", price: "", image: "", genre: "Action" });
    fetchMovies();
  };

  // Delete Movie
  const deleteMovie = async (id) => {
    await axios.delete(
      `https://cinebook-xypk.onrender.com/api/admin/movies/${id}`,
      { headers: { Authorization: `Bearer ${auth.token}` } }
    );
    fetchMovies();
  };

  // Edit Movie
  const editMovie = (movie) => {
    setForm({
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      price: movie.price,
      image: movie.image || "",
      genre: movie.genre || "Action",
    });
    setEditingId(movie._id);
  };

  return (
    <AdminLayout>
      <h1>Manage Movies</h1>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="duration"
          placeholder="Duration (mins)"
          value={form.duration}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          placeholder="Ticket Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
        />
        <select
          name="genre"
          value={form.genre}
          onChange={handleChange}
          required
        >
          <option value="Action">Action</option>
          <option value="Comedy">Comedy</option>
          <option value="Sci-Fi">Sci-Fi</option>
        </select>
        <button type="submit">
          {editingId ? "Update Movie" : "Add Movie"}
        </button>
      </form>

      {/* Movie Table */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th>Title</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie._id}>
              <td>{movie.title}</td>
              <td>{movie.duration} mins</td>
              <td>₹{movie.price}</td>
              <td>
                <button
                  style={styles.editBtn}
                  onClick={() => editMovie(movie)}
                >
                  Edit
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteMovie(movie._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    backgroundColor: "white",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#2563eb",
    color: "white",
  },
  editBtn: {
    marginRight: "10px",
    backgroundColor: "#10b981",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
  },
};

export default AdminMovies;