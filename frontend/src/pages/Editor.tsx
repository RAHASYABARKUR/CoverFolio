import { useEffect, useMemo, useState } from "react";
import { getTemplate, createDraft, updateDraft } from "../api/mock";
import ClassicRenderer from "../renderers/classic";
import resumeService, { Resume } from "../services/resume.service";

function cleanStr(v?: string | null): string {
  if (!v) return "";
  const trimmed = v.trim();
  if (trimmed.toUpperCase() === "N/A") return "";
  return trimmed;
}

function mapResumeToTemplateData(resume: Resume): any {
  const s: any = resume.structured_data;
  if (!s) return {};

  const exp = Array.isArray(s.experience) ? s.experience : [];
  const projects = Array.isArray(s.projects) ? s.projects : [];
  const skills = Array.isArray(s.skills) ? s.skills : [];

  return {
    about: {
      name: cleanStr(s.name),
      headline: cleanStr(s.headline || s.title),
      summary: cleanStr(s.summary || s.objective || ""),
      links: {
        github: cleanStr(s.github),
        linkedin: cleanStr(s.linkedin),
      },
      location: cleanStr(s.location),
      website: cleanStr(s.website),
    },

    experience: exp.map((job: any) => {
      const years = cleanStr(job.years);
      let start = "";
      let end = "";
      if (years && years.includes("-")) {
        const [a, b] = years.split("-");
        start = cleanStr(a);
        end = cleanStr(b);
      }

      return {
        role: cleanStr(job.role),
        company: cleanStr(job.company),
        location: cleanStr(job.location),
        start,
        end,
        description: cleanStr(job.role_summary || job.description),
      };
    }),

    projects: projects.map((p: any) => ({
      name: cleanStr(p.title || p.name),
      description: cleanStr(p.description),
      tech: Array.isArray(p.technologies)
        ? p.technologies.map(cleanStr).filter(Boolean).join(", ")
        : cleanStr(p.tech_stack),
      link: cleanStr(p.link || p.github || p.demo),
    })),

    skills: {
      items: skills.map(cleanStr).filter(Boolean),
    },
  };
}

// Simple styles so we don't depend on Tailwind
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: 24,
  padding: 24,
  alignItems: "flex-start",
  background: "#e5e7eb", // slate-200-ish
  minHeight: "100vh",
  boxSizing: "border-box",
};

const leftColumnStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 16,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
  border: "1px solid rgba(148, 163, 184, 0.4)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#6b7280",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 13,
  boxSizing: "border-box",
};

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 72,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
};

const buttonsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: "#4f46e5",
  color: "white",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const rightColumnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 24,
  overflow: "hidden",
  border: "1px solid rgba(148, 163, 184, 0.5)",
  background: "#f8fafc",
};

export default function Editor() {
  const qs = new URLSearchParams(window.location.search);
  const templateKey = qs.get("template") || "classic";
  const draftId = qs.get("id") || "";

  const [tpl, setTpl] = useState<any>(null);
  const [title, setTitle] = useState("My Portfolio");
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<Record<string, string>>({});

  // Load template schema (from mock API)
  useEffect(() => {
    getTemplate(templateKey).then(setTpl);
  }, [templateKey]);

  // Prefill from latest parsed resume
  useEffect(() => {
    async function loadFromLatestResume() {
      try {
        console.log("🔎 Prefill effect running, draftId =", draftId);

        const resp: any = await resumeService.listResumes();
        console.log("📄 Resumes from API:", resp);

        const resumes: Resume[] = Array.isArray(resp)
          ? resp
          : resp?.resumes || [];

        console.log("✅ Normalized resumes array:", resumes);

        if (!resumes || !resumes.length) {
          console.log("No resumes array, skipping prefill");
          return;
        }

        const latest = [...resumes].sort((a, b) =>
          a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1
        )[0];

        console.log("🧩 Using latest resume:", latest);

        if (!latest.structured_data) {
          console.log("Latest resume has no structured_data");
          return;
        }

        const mapped = mapResumeToTemplateData(latest);
        console.log("🧱 Mapped template data:", mapped);

        setData((prev: any) => {
          if (prev && Object.keys(prev).length > 0) {
            console.log("Existing data present, not overriding:", prev);
            return prev;
          }
          console.log("Setting data from resume");
          return mapped;
        });
      } catch (err) {
        console.error("❌ Failed to prefill template from resume", err);
      }
    }

    loadFromLatestResume();
  }, [draftId]);

  const resolvedTheme = useMemo(
    () => ({ ...(tpl?.default_theme || {}), ...(theme || {}) }),
    [tpl, theme]
  );

  const accentColor = resolvedTheme["--accent"] || "#6366f1";

  async function saveDraft() {
    if (!tpl) return;
    const payload = {
      title,
      template_key: templateKey,
      data,
      theme_overrides: theme,
    };
    let saved;
    if (draftId) saved = await updateDraft(draftId, payload);
    else saved = await createDraft(payload);

    window.history.replaceState(
      null,
      "",
      `/editor?template=${templateKey}&id=${saved.id}`
    );
    alert("Saved!");
  }

  return (
    <div style={containerStyle}>
      {/* LEFT: Editor controls */}
      <div style={leftColumnStyle}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Editor — {tpl?.name || "Classic"}
        </h1>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
          Tweak your portfolio content on the left, and preview it on the right.
        </p>

        {/* Title + About */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 12 }}>
            <div style={labelStyle}>Title</div>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={sectionTitleStyle}>About</div>

          {/* Name + Headline */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Name"
              value={data?.about?.name ?? ""}
              onChange={(e) =>
                setData((prev: any) => ({
                  ...prev,
                  about: {
                    ...(prev?.about || {}),
                    name: e.target.value,
                  },
                }))
              }
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Headline (e.g. Software Engineer)"
              value={data?.about?.headline ?? ""}
              onChange={(e) =>
                setData((prev: any) => ({
                  ...prev,
                  about: {
                    ...(prev?.about || {}),
                    headline: e.target.value,
                  },
                }))
              }
            />
          </div>

          {/* Summary */}
          <textarea
            style={textAreaStyle}
            placeholder="Short intro / summary"
            value={data?.about?.summary ?? ""}
            onChange={(e) =>
              setData((prev: any) => ({
                ...prev,
                about: {
                  ...(prev?.about || {}),
                  summary: e.target.value,
                },
              }))
            }
          />

          {/* Skills editor */}
          <div style={{ marginTop: 12 }}>
            <div style={sectionTitleStyle}>Skills (comma-separated)</div>
            <input
              style={inputStyle}
              placeholder="e.g. React, Django, AWS, Figma"
              value={(data?.skills?.items || []).join(", ")}
              onChange={(e) => {
                const items = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                setData((prev: any) => ({
                  ...prev,
                  skills: {
                    ...(prev?.skills || {}),
                    items,
                  },
                }));
              }}
            />
          </div>
        </div>

        {/* Theme */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Theme</div>
          <div style={{ ...labelStyle, textTransform: "none", letterSpacing: 0 }}>
            Accent color
          </div>
          <input
            type="color"
            value={accentColor}
            onChange={(e) =>
              setTheme((t) => ({
                ...t,
                ["--accent"]: e.target.value,
              }))
            }
          />
        </div>

        {/* Actions */}
        <div style={buttonsRowStyle}>
          <button style={primaryButtonStyle} onClick={saveDraft}>
            Save Draft
          </button>
          <button
            style={secondaryButtonStyle}
            onClick={() => alert("Will publish in F4")}
          >
            Publish
          </button>
        </div>
      </div>

      {/* RIGHT: Live preview */}
      <div style={rightColumnStyle}>
        <ClassicRenderer data={data} theme={resolvedTheme} />
      </div>
    </div>
  );
}
