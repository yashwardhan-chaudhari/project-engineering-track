import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/posts/my");
      setPosts(res.data.posts);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    // Confirmation dialog before destructive action
    const confirmed = window.confirm("Are you sure you want to delete this post? This cannot be undone.");
    if (!confirmed) return;

    // Optimistic UI update — remove from state immediately
    const previousPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p._id !== postId));

    try {
      await axios.delete(`/api/posts/${postId}`);
      setSuccessMsg("Post deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      // Rollback on failure
      setPosts(previousPosts);
      setError(err.response?.data?.message || "Failed to delete post");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/edit/${postId}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Dashboard</h1>
          <p style={styles.sub}>Manage your posts, {user?.username}</p>
        </div>
        <Link to="/create" style={styles.createBtn}>+ New Post</Link>
      </div>

      {successMsg && <div style={styles.success}>{successMsg}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: "3rem" }}>Loading your posts...</p>
      ) : posts.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't created any posts yet.</p>
          <Link to="/create" style={styles.createBtn}>Create your first post →</Link>
        </div>
      ) : (
        <div style={styles.list}>
          {posts.map((post) => (
            <div key={post._id} style={styles.card}>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{post.title}</h3>
                <p style={styles.cardContent}>{post.content.substring(0, 120)}...</p>
                <span style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={styles.cardActions}>
                {/* Edit Button */}
                <button onClick={() => handleEdit(post._id)} style={styles.editBtn}>
                  ✏️ Edit
                </button>
                {/* Delete Button */}
                <button onClick={() => handleDelete(post._id)} style={styles.deleteBtn}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "860px", margin: "0 auto", padding: "2rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" },
  title: { fontSize: "2rem", fontWeight: "700", color: "#1a1a2e" },
  sub: { color: "#888", marginTop: "0.25rem" },
  createBtn: { background: "#e94560", color: "#fff", padding: "0.6rem 1.4rem",
    borderRadius: "8px", fontWeight: "600", fontSize: "0.95rem" },
  success: { background: "#d4edda", color: "#155724", padding: "0.75rem 1rem",
    borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.9rem" },
  error: { background: "#ffe0e0", color: "#c0392b", padding: "0.75rem 1rem",
    borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.9rem" },
  empty: { textAlign: "center", padding: "4rem", color: "#888", display: "flex",
    flexDirection: "column", alignItems: "center", gap: "1.25rem" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    gap: "1rem", flexWrap: "wrap" },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: "1.1rem", fontWeight: "600", color: "#1a1a2e", marginBottom: "0.4rem" },
  cardContent: { color: "#666", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "0.5rem" },
  date: { fontSize: "0.8rem", color: "#aaa" },
  cardActions: { display: "flex", gap: "0.6rem", flexShrink: 0 },
  editBtn: { padding: "0.5rem 1rem", background: "#1a1a2e", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "0.88rem" },
  deleteBtn: { padding: "0.5rem 1rem", background: "#ffe0e0", color: "#c0392b",
    border: "1.5px solid #f5c6cb", borderRadius: "8px", cursor: "pointer",
    fontWeight: "500", fontSize: "0.88rem" },
};
