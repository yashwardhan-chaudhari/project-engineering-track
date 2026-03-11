import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreatePost() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/posts", form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Post 📝</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Title</label>
          <input name="title" placeholder="Give your post a great title..."
            value={form.title} onChange={handleChange} style={styles.input} required />
          <label style={styles.label}>Content</label>
          <textarea name="content" placeholder="Write your content here..."
            value={form.content} onChange={handleChange} style={styles.textarea} required rows={8} />
          <div style={styles.actions}>
            <button type="button" onClick={() => navigate("/dashboard")} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", padding: "2rem" },
  card: { background: "#fff", padding: "2.5rem", borderRadius: "16px", width: "100%",
    maxWidth: "680px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title: { fontSize: "1.8rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "1.5rem" },
  error: { background: "#ffe0e0", color: "#c0392b", padding: "0.75rem", borderRadius: "8px",
    marginBottom: "1rem", fontSize: "0.9rem" },
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
