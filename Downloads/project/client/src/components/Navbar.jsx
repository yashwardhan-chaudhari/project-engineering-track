import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>✍️ Creator's Platform</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <span style={styles.greeting}>Hi, {user.username}</span>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/create" style={styles.link}>New Post</Link>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "1rem 2rem", background: "#1a1a2e", color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  brand: { fontSize: "1.3rem", fontWeight: "700", color: "#e94560" },
  links: { display: "flex", alignItems: "center", gap: "1rem" },
  greeting: { fontSize: "0.9rem", color: "#aaa" },
  link: { color: "#fff", fontSize: "0.95rem", transition: "color 0.2s" },
  btn: { background: "#e94560", color: "#fff", border: "none", padding: "0.4rem 1rem",
    borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" },
};
