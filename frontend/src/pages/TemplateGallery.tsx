import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listTemplates } from "../api/mock";
import type { TemplateDTO } from "../types/portfolio";

const TemplateGallery: React.FC = () => {
  const [items, setItems] = useState<TemplateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 🔹 Read resumeId from the current URL (?resumeId=...)
  const qs = new URLSearchParams(window.location.search);
  const resumeId = qs.get("resumeId") || "";

  useEffect(() => {
    listTemplates()
      .then(setItems)
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Helper to open the editor with template + optional resumeId
  function openEditor(templateKey: string) {
    const base = `/editor?template=${templateKey}`;
    const url = resumeId ? `${base}&resumeId=${resumeId}` : base;
    window.location.assign(url);
  }

  return (
    <div style={styles.container}>
      {/* floating shapes for depth */}
      <div style={styles.shape1} />
      <div style={styles.shape2} />
      <div style={styles.shape3} />

      <div style={styles.content}>
        <h1 style={styles.title}>Choose a Template</h1>
        <p style={styles.subtitle}>
          Pick a starting point. You can customize colors, content, and layout later.
        </p>

        {loading && <div style={styles.loading}>Loading templates…</div>}
        {err && <div style={styles.error}>Error: {err}</div>}

        {!loading && !err && (
          <div style={styles.grid}>
            {items.map((t) => (
              <div
                key={t.key}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardIconWrap}>
                    <div style={styles.cardIcon}>
                      {t.key === "modern" ? "🧩" : "📄"}
                    </div>
                  </div>
                  <h2 style={styles.cardTitle}>{t.name}</h2>
                </div>

                <p style={styles.cardText}>{t.description}</p>

                {/* preview area (placeholder if no image) */}
                {t.preview_image ? (
                  <img src={t.preview_image} alt={t.name} style={styles.preview} />
                ) : (
                  <div style={styles.previewPlaceholder} />
                )}

                <div style={styles.cardActions}>
                  <button
                    style={styles.primaryButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 30px rgba(102,126,234,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 18px rgba(102,126,234,0.25)";
                    }}
                    // 🔹 This now respects resumeId if present
                    onClick={() => openEditor(t.key)}
                  >
                    Use {t.name}
                  </button>

                  <Link
                    to="/templates"
                    style={styles.linkGhost}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.footerHint}>
          Not sure where to start? Try{" "}
          <span style={styles.accent}>Classic</span> for a clean resume-to-portfolio
          layout.
        </div>
      </div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "40px 0 80px",
  },
  content: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 32px",
    color: "white",
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: 44,
    fontWeight: 900,
    letterSpacing: -1,
    margin: "6px 0 8px",
  },
  subtitle: {
    fontSize: 17,
    opacity: 0.95,
    maxWidth: 720,
    lineHeight: 1.6,
    marginBottom: 28,
  },
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  card: {
    background: "white",
    color: "#1a202c",
    borderRadius: 16,
    padding: "22px 20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    transition: "all .25s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  cardIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(102,126,234,0.35)",
  },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 20, fontWeight: 800, margin: 0 },
  cardText: {
    color: "#4a5568",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "6px 0 14px",
  },
  preview: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 14,
  },
  previewPlaceholder: {
    height: 140,
    borderRadius: 12,
    background:
      "linear-gradient(135deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.12) 100%)",
    border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 14,
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  primaryButton: {
    background: "#ffffff",
    color: "#667eea",
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
    boxShadow: "0 8px 18px rgba(102,126,234,0.25)",
    cursor: "pointer",
    transition: "all .2s ease",
  },
  linkGhost: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: 600,
    opacity: 0.9,
  },
  loading: { padding: "24px 0", fontSize: 16 },
  error: { padding: "24px 0", fontSize: 16, color: "#fee2e2", fontWeight: 600 },
  footerHint: {
    marginTop: 22,
    fontSize: 14,
    opacity: 0.95,
  },
  accent: {
    fontWeight: 800,
    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.85) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  // soft floating shapes
  shape1: {
    position: "absolute",
    top: "12%",
    left: "8%",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  shape2: {
    position: "absolute",
    right: "10%",
    bottom: "18%",
    width: 220,
    height: 220,
    borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
    background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  shape3: {
    position: "absolute",
    left: "55%",
    top: "50%",
    width: 380,
    height: 380,
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
  },
};

export default TemplateGallery;
