// frontend/src/pages/Editor.tsx
import { useEffect, useMemo, useState, CSSProperties } from "react";
import {
  getTemplate,
  createDraft,
  updateDraft,
  publishDraft,
} from "../api/mock";

import ClassicRenderer from "../renderers/classic";
import ModernRenderer from "../renderers/modern";
import resumeService, { Resume } from "../services/resume.service";

/* ---------- helpers ---------- */

function cleanStr(v?: string | null): string {
  if (!v) return "";
  const trimmed = v.trim();
  if (trimmed.toUpperCase() === "N/A") return "";
  return trimmed;
}

function safeArray(val: any): any[] {
  return Array.isArray(val) ? val : [];
}

function mapResumeToTemplateData(resume: Resume): any {
  const s: any = resume.structured_data;
  if (!s) return {};

  const exp = safeArray(s.experience);
  const projects = safeArray(s.projects);
  const skills = safeArray(s.skills);

  const education = safeArray(s.education);
  const certifications = safeArray(s.certifications);
  const publications =
    safeArray(s.publications_and_patents) || safeArray(s.publications);
  const awards =
    safeArray(s.accomplishments_awards) || safeArray(s.awards);
  const hobbies =
    safeArray(s.hobbies_and_interests) || safeArray(s.hobbies);
  const contact = s.contact || {};

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
      email: cleanStr(s.email),
    },

    experience: exp.map((job: any) => {
      const years = cleanStr(job.years || job.dates || job.date);
      let start = "";
      let end = "";
      if (years && years.includes("-")) {
        const [a, b] = years.split("-");
        start = cleanStr(a);
        end = cleanStr(b);
      }

      return {
        role: cleanStr(job.role || job.title),
        company: cleanStr(job.company || job.org || job.organization),
        location: cleanStr(job.location),
        start,
        end,
        description: cleanStr(job.role_summary || job.description),
        years,
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

    education,
    certifications,
    publications,
    awards,
    hobbies,
    contact,

    sections: {},
    headings: {},
  };
}

/* ---------- inline styles ---------- */

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: 24,
  padding: 24,
  alignItems: "flex-start",
  background: "#e5e7eb",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const leftColumnStyle: CSSProperties = {
  width: "100%",
  maxWidth: 420,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const cardStyle: CSSProperties = {
  background: "#ffffff",
  borderRadius: 20,
  padding: 16,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
  border: "1px solid rgba(148, 163, 184, 0.4)",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#6b7280",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 13,
  boxSizing: "border-box",
};

const textAreaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 72,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 8,
};

const buttonsRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const primaryButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: "#4f46e5",
  color: "white",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const rightColumnStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 24,
  overflow: "hidden",
  border: "1px solid rgba(148, 163, 184, 0.5)",
  background: "#f8fafc",
};

/* ---------- component ---------- */

export default function Editor() {
  const qs = new URLSearchParams(window.location.search);
  const templateKey = qs.get("template") || "classic";
  const draftId = qs.get("id") || "";

  const [tpl, setTpl] = useState<any>(null);
  const [title, setTitle] = useState("My Portfolio");
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<Record<string, string>>({});
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  // choose renderer based on template key
  const Renderer =
    templateKey === "modern" ? ModernRenderer : ClassicRenderer;

  useEffect(() => {
    getTemplate(templateKey).then(setTpl);
  }, [templateKey]);

  // prefill from latest resume
  useEffect(() => {
    async function loadFromLatestResume() {
      try {
        const resp: any = await resumeService.listResumes();
        const resumes: Resume[] = Array.isArray(resp)
          ? resp
          : resp?.resumes || [];

        if (!resumes || !resumes.length) return;

        const latest = [...resumes].sort((a, b) =>
          a.created_at && b.created_at && a.created_at < b.created_at ? 1 : -1
        )[0];

        if (!latest.structured_data) return;

        const mapped = mapResumeToTemplateData(latest);

        setData((prev: any) => {
          if (prev && Object.keys(prev).length > 0) return prev;
          return mapped;
        });
      } catch (err) {
        console.error("Failed to prefill template from resume", err);
      }
    }

    loadFromLatestResume();
  }, [draftId]);

  const resolvedTheme = useMemo(
    () => ({ ...(tpl?.default_theme || {}), ...(theme || {}) }),
    [tpl, theme]
  );

  const accentColor = resolvedTheme["--accent"] || "#6366f1";

  /* ---------- sections / headings helpers ---------- */

  const sections = data.sections || {};
  const headings = data.headings || {};

  function updateSection(key: string, value: any) {
    setData((prev: any) => ({
      ...prev,
      sections: {
        ...(prev?.sections || {}),
        [key]: value,
      },
    }));
  }

  function updateHeading(key: string, value: string) {
    setData((prev: any) => ({
      ...prev,
      headings: {
        ...(prev?.headings || {}),
        [key]: value,
      },
    }));
  }

  /* ---------- save / publish ---------- */

  async function saveDraft(showAlert = true): Promise<any | null> {
    if (!tpl) return null;
    const payload = {
      title,
      template_key: templateKey,
      data,
      theme_overrides: theme,
    };
    let saved;
    if (draftId) saved = await updateDraft(draftId, payload);
    else saved = await createDraft(payload);

    if (!draftId) {
      window.history.replaceState(
        null,
        "",
        `/editor?template=${templateKey}&id=${saved.id}`
      );
    }
    if (showAlert) alert("Saved!");
    return saved;
  }

  async function handlePublish() {
    if (!tpl) return;

    const payload = {
      title,
      template_key: templateKey,
      data,
      theme_overrides: theme,
    };

    let id = draftId;
    let saved;

    if (!id) {
      saved = await createDraft(payload);
      id = saved.id;
      window.history.replaceState(
        null,
        "",
        `/editor?template=${templateKey}&id=${id}`
      );
    } else {
      saved = await updateDraft(id, payload);
    }

    const published = await publishDraft(id);

    const url = `${window.location.origin}/p/${
      published.slug || published.id
    }`;

    setPublishUrl(url);
  }

  /* ---------- render ---------- */

  return (
    <div style={containerStyle}>
      {/* LEFT: Editor controls */}
      <div style={leftColumnStyle}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Editor — {tpl?.name || (templateKey === "modern" ? "Modern" : "Classic")}
        </h1>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
          Tweak your portfolio content on the left, and preview it on the
          right.
        </p>

        {/* Title + About + Sections */}
        <div style={cardStyle}>
          {/* Title */}
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
              placeholder="e.g. React, Django, AWS, TCP/IP"
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

          {/* Overview text */}
          <div style={{ marginTop: 16 }}>
            <div style={sectionTitleStyle}>Overview (right card)</div>
            <textarea
              style={textAreaStyle}
              placeholder="Short overview that appears in the right-hand card."
              value={sections.overview ?? ""}
              onChange={(e) => updateSection("overview", e.target.value)}
            />
          </div>

          {/* What I Work On bullets */}
          <div style={{ marginTop: 16 }}>
            <div style={sectionTitleStyle}>
              What I Work On (one bullet per line)
            </div>
            <textarea
              style={textAreaStyle}
              placeholder={"Backend services\nFront-end UIs\nCloud infra"}
              value={(sections.whatIWorkOn || []).join("\n")}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                updateSection("whatIWorkOn", lines);
              }}
            />
          </div>

          {/* Engineering Philosophy bullets */}
          <div style={{ marginTop: 16 }}>
            <div style={sectionTitleStyle}>
              Engineering Philosophy (one bullet per line)
            </div>
            <textarea
              style={textAreaStyle}
              placeholder={
                "Ship small, testable changes\nFavor readability\nUse metrics & logs"
              }
              value={(sections.engineeringPhilosophy || []).join("\n")}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                updateSection("engineeringPhilosophy", lines);
              }}
            />
          </div>

          {/* How I Work steps */}
          <div style={{ marginTop: 16 }}>
            <div style={sectionTitleStyle}>How I Work steps</div>
            <textarea
              style={textAreaStyle}
              placeholder={
                "Discover & Design | Clarify the problem...\nBuild & Review | Implement in small pieces...\nDeploy & Learn | Monitor in production..."
              }
              value={(sections.howIWorkSteps || []).join("\n")}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);
                updateSection("howIWorkSteps", lines);
              }}
            />
          </div>

          {/* Experience intro */}
          <div style={{ marginTop: 16 }}>
            <div style={sectionTitleStyle}>
              Experience &amp; Impact intro line
            </div>
            <textarea
              style={textAreaStyle}
              placeholder="Teams I've worked with and problems I've helped solve."
              value={sections.experienceIntro ?? ""}
              onChange={(e) => updateSection("experienceIntro", e.target.value)}
            />
          </div>

          {/* Footer subheading */}
          <div style={{ marginTop: 16 }}>
            <div style={sectionTitleStyle}>Footer subheading</div>
            <textarea
              style={textAreaStyle}
              placeholder="Short sentence under 'Thanks for Visiting'."
              value={sections.footerSubheading ?? ""}
              onChange={(e) =>
                updateSection("footerSubheading", e.target.value)
              }
            />
          </div>

          {/* CONTENT OVERRIDES FOR NEW CARDS */}
          <div style={{ marginTop: 20 }}>
            <div style={sectionTitleStyle}>Content</div>

            {/* Education */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...labelStyle, textTransform: "none" }}>
                Education (one per line)
              </div>
              <textarea
                style={textAreaStyle}
                placeholder={
                  "Master of Science in ...\nBachelor of Technology in ..."
                }
                value={(sections.educationOverride || []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateSection("educationOverride", lines);
                }}
              />
            </div>

            {/* Certifications */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...labelStyle, textTransform: "none" }}>
                Certifications (one per line)
              </div>
              <textarea
                style={textAreaStyle}
                placeholder={"AWS Solutions Architect – Associate\n..."}
                value={(sections.certificationsOverride || []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateSection("certificationsOverride", lines);
                }}
              />
            </div>

            {/* Publications & Patents */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...labelStyle, textTransform: "none" }}>
                Publications &amp; Patents (one per line)
              </div>
              <textarea
                style={textAreaStyle}
                placeholder={"Paper title – Conference, 2024\n..."}
                value={(sections.publicationsOverride || []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateSection("publicationsOverride", lines);
                }}
              />
            </div>

            {/* Accomplishments & Awards */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...labelStyle, textTransform: "none" }}>
                Accomplishments &amp; Awards (one per line)
              </div>
              <textarea
                style={textAreaStyle}
                placeholder={"Best Intern Award – VMware, 2022\n..."}
                value={(sections.awardsOverride || []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateSection("awardsOverride", lines);
                }}
              />
            </div>

            {/* Hobbies & Interests */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...labelStyle, textTransform: "none" }}>
                Hobbies &amp; Interests (one per line)
              </div>
              <textarea
                style={textAreaStyle}
                placeholder={"Painting\nPhotography\nTravel"}
                value={(sections.hobbiesOverride || []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateSection("hobbiesOverride", lines);
                }}
              />
            </div>
          </div>
        </div>

        {/* Section headings override */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Section headings</div>

          {[
            ["whatIWorkOn", "What I Work On"],
            ["engineeringPhilosophy", "Engineering Philosophy"],
            ["howIWork", "How I Work"],
            ["projects", "Projects"],
            ["experience", "Experience & Impact"],
            ["techStack", "Tech Stack & Tools"],
            ["education", "Education"],
            ["certifications", "Certifications"],
            ["publications", "Publications & Patents"],
            ["awards", "Accomplishments & Awards"],
            ["hobbies", "Hobbies & Interests"],
            ["contact", "Contact Information"],
            ["thanks", "Thanks for Visiting"],
          ].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ ...labelStyle, textTransform: "none" }}>
                {label}
              </div>
              <input
                style={inputStyle}
                value={headings[key as keyof typeof headings] || ""}
                placeholder={label as string}
                onChange={(e) => updateHeading(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Theme */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Theme</div>
          <div
            style={{ ...labelStyle, textTransform: "none", letterSpacing: 0 }}
          >
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
          <button
            style={primaryButtonStyle}
            onClick={() => {
              void saveDraft(true);
            }}
          >
            Save Draft
          </button>
          <button style={secondaryButtonStyle} onClick={handlePublish}>
            Publish
          </button>
        </div>
      </div>

      {/* RIGHT: Live preview */}
      <div style={rightColumnStyle}>
        <Renderer data={data} theme={resolvedTheme} />
      </div>

      {/* Publish modal */}
      {publishUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "420px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "12px" }}>🎉 Portfolio Published!</h2>

            <p style={{ wordBreak: "break-all", marginBottom: "16px" }}>
              <strong>Public URL:</strong>
              <br />
              {publishUrl}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                style={{
                  background: "#4F46E5",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(publishUrl);
                  alert("URL copied to clipboard!");
                }}
              >
                📋 Copy Link
              </button>

              <button
                style={{
                  background: "#1E88E5",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => window.open(publishUrl, "_blank")}
              >
                🔗 Open
              </button>
            </div>

            <button
              style={{
                marginTop: "20px",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: "#f9f9f9",
                cursor: "pointer",
              }}
              onClick={() => setPublishUrl(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
