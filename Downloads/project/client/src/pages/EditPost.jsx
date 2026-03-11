import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditPost() {
  // useParams extracts the :id from the URL /edit/:id
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch the post on mount to pre-fill the form
  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts/${id}`);
      const { title, content } = res.data.post;
      // Pre-fill the form with existing data
      setForm({ title, content });
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("You are not authorized to edit this post.");
      } else if (status === 404) {
        setError("Post not found.");
      } else {
        setError("Failed to load post.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await axios.put(`/api/posts/${id}`, form);
      navigate("/dashboard");
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError("You are not authorized to edit this post.");
      } else {
        setError(err.response?.data?.message || "Failed to update post.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "3rem" }}>Loading post...</p>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Post ✏️</h2>
        <p style={styles.sub}>Update your post below</p>

        {error && <div style={styles.error}>{error}</div>}

        {!error && (
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Post title"
            />

            <label style={styles.label}>Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              style={styles.textarea}
              required
              rows={10}
              placeholder="Post content"
            />

            <div style={styles.actions}>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} style={styles.submitBtn}>
                {saving ? "Saving..." : "Update Post"}
              </button>
            </div>
          </form>
        )}

        {error && (
          <button onClick={() => navigate("/dashboard")} style={styles.cancelBtn}>
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", padding: "2rem" },
  card: { background: "#fff", padding: "2.5rem", borderRadius: "16px", width: "100%",
    maxWidth: "680px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title: { fontSize: "1.8rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "0.25rem" },
  sub: { color: "#888", marginBottom: "1.75rem" },
  error: { background: "#ffe0e0", color: "#c0392b", padding: "0.75rem", borderRadius: "8px",
    marginBottom: "1.25rem", fontSize: "0.9rem" },
  label: { display: "block", fontWeight: "600", marginBottom: "0.4rem", color: "#444", fontSize: "0.9rem" },
  input: { width: "100%", padding: "0.75rem 1rem", marginBottom: "1.25rem", border: "1.5px solid #e0e0e0",
    borderRadius: "8px", fontSize: "0.95rem", outline: "none", display: "block" },
  textarea: { width: "100%", padding: "0.75rem 1rem", marginBottom: "1.5rem", border: "1.5px solid #e0e0e0",
    borderRadius: "8px", fontSize: "0.95rem", outline: "none", display: "block",
    resize: "vertical", fontFamily: "inherit" },
  actions: { display: "flex", gap: "1rem", justifyContent: "flex-end" },
  cancelBtn: { padding: "0.7rem 1.5rem", background: "#f0f2f5", border: "none",
    borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  submitBtn: { padding: "0.7rem 1.5rem", background: "#e94560", color: "#fff", border: "none",
    borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};
