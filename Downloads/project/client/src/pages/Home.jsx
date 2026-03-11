import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts?page=${page}&limit=6`);
      setPosts(res.data.posts);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Latest Posts</h1>
        <p style={styles.sub}>Discover stories from our creators</p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>No posts yet. Be the first to create one!</p>
      ) : (
        <>
          <div style={styles.grid}>
            {posts.map((post) => (
              <div key={post._id} style={styles.card}>
                <h2 style={styles.cardTitle}>{post.title}</h2>
                <p style={styles.cardContent}>{post.content.substring(0, 150)}...</p>
                <div style={styles.cardFooter}>
                  <span style={styles.author}>By {post.author?.username || "Unknown"}</span>
                  <span style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >← Prev</button>
            <span style={styles.pageInfo}>Page {page} of {pagination.pages || 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= (pagination.pages || 1)}
              style={styles.pageBtn}
            >Next →</button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "1100px", margin: "0 auto", padding: "2rem" },
  header: { textAlign: "center", marginBottom: "2.5rem" },
  title: { fontSize: "2.2rem", fontWeight: "700", color: "#1a1a2e" },
  sub: { color: "#666", marginTop: "0.4rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)", transition: "transform 0.2s",
    cursor: "default" },
  cardTitle: { fontSize: "1.15rem", fontWeight: "600", marginBottom: "0.75rem", color: "#1a1a2e" },
  cardContent: { color: "#555", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1rem" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1px solid #eee", paddingTop: "0.75rem" },
  author: { fontSize: "0.85rem", color: "#e94560", fontWeight: "500" },
  date: { fontSize: "0.8rem", color: "#aaa" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center",
    gap: "1rem", marginTop: "2.5rem" },
  pageBtn: { background: "#1a1a2e", color: "#fff", border: "none", padding: "0.5rem 1.2rem",
    borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", disabled: { opacity: 0.5 } },
  pageInfo: { fontSize: "0.9rem", color: "#555" },
};
