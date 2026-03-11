import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account ✨</h2>
        <p style={styles.sub}>Join our community of creators</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={form.username}
            onChange={handleChange} style={styles.input} required />
          <input name="email" type="email" placeholder="Email" value={form.email}
            onChange={handleChange} style={styles.input} required />
          <input name="password" type="password" placeholder="Password (min 6 chars)"
            value={form.password} onChange={handleChange} style={styles.input} required minLength={6} />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" },
  card: { background: "#fff", padding: "2.5rem", borderRadius: "16px", width: "100%",
    maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" },
  title: { fontSize: "1.8rem", fontWeight: "700", color: "#1a1a2e", marginBottom: "0.25rem" },
  sub: { color: "#888", marginBottom: "1.5rem" },
  error: { background: "#ffe0e0", color: "#c0392b", padding: "0.75rem", borderRadius: "8px",
    marginBottom: "1rem", fontSize: "0.9rem" },
  input: { width: "100%", padding: "0.75rem 1rem", marginBottom: "1rem", border: "1.5px solid #e0e0e0",
    borderRadius: "8px", fontSize: "0.95rem", outline: "none", display: "block" },
  btn: { width: "100%", padding: "0.8rem", background: "#e94560", color: "#fff", border: "none",
    borderRadius: "8px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" },
  footer: { textAlign: "center", marginTop: "1.25rem", fontSize: "0.9rem", color: "#666" },
  link: { color: "#e94560", fontWeight: "600" },
};
