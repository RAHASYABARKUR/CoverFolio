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
import portfolioService from "../services/portfolio.service";
import type { Portfolio } from "../types/portfolio.types";
import { downloadStaticPortfolioZip } from "../utils/staticExport";

/* ---------- helpers ---------- */

function cleanStr(v: any): string {
  if (v === null || v === undefined) return "";

  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed.toUpperCase() === "N/A") return "";
    return trimmed;
  }

  if (typeof v === "number") {
    return String(v);
  }

  return "";
}

function safeArray(val: any): any[] {
  return Array.isArray(val) ? val : [];
}

// Map data from Portfolio forms into the template data structure
function mapPortfolioToTemplateData(p: Portfolio | any): any {
  if (!p) return {};

  const profile = p.profile || p.overview || p || {};
  const exp = safeArray(
    p.experiences ||
      p.experience_entries ||
      p.experience ||
      p.work_experience ||
      []
  );
  const projects = safeArray(
    p.projects || p.project_items || p.project_entries || []
  );
  const skillsRaw = safeArray(
    p.skills || p.skill_items || p.skill_entries || []
  );
  const education = safeArray(
    p.education || p.education_entries || p.schools || []
  );
  const certifications = safeArray(
    p.certifications || p.certificate_entries || []
  );
  const publications = safeArray(
    p.publications_and_patents ||
      p.publications ||
      p.publication_entries ||
      []
  );
  const awards = safeArray(
    p.accomplishments_awards || p.awards || p.award_entries || []
  );
  const hobbies = safeArray(
    p.hobbies_and_interests || p.hobbies || p.hobby_entries || []
  );
  const contact = p.contacts || p.contact || {};

  // ---- about / overview ----
  const firstLast = [profile.first_name, profile.last_name]
    .map((x) => cleanStr(x))
    .filter(Boolean);
  const computedName =
    cleanStr(profile.full_name || profile.name) ||
    (firstLast.length ? firstLast.join(" ") : "");

  const about = {
    name: computedName,
    headline: cleanStr(
      profile.headline || profile.title || profile.tagline || ""
    ),
    summary: cleanStr(profile.summary || profile.bio || profile.about || ""),
    links: {
      github: cleanStr(profile.github_url || profile.github),
      linkedin: cleanStr(profile.linkedin_url || profile.linkedin),
    },
    location: cleanStr(profile.location || profile.city || profile.country),
    website: cleanStr(profile.website || profile.portfolio_url),
    email: cleanStr(profile.email || profile.contact_email),
  };

  // ---- experience ----
  const experience = exp.map((job: any) => {
    const role =
      job.role ||
      job.title ||
      job.position ||
      job.job_title ||
      "Role";
    const company =
      job.company ||
      job.company_name ||
      job.org ||
      job.organization ||
      "";
    const location = job.location || job.city || "";

    const startRaw =
      job.start_date || job.start || job.from || job.start_year;
    const endRaw =
      job.end_date ||
      job.end ||
      job.to ||
      job.end_year ||
      (job.is_current ? "Present" : "");

    const start = cleanStr(startRaw);
    const end = cleanStr(endRaw);

    let years = cleanStr(
      job.years || job.dates || job.date_range || job.date || ""
    );
    if (!years && (start || end)) {
      years = [start, end].filter(Boolean).join(" - ");
    }

    const description = cleanStr(
      job.description || job.summary || job.details || ""
    );

    return {
      role: cleanStr(role),
      company: cleanStr(company),
      location: cleanStr(location),
      start,
      end,
      years,
      description,
    };
  });

  // ---- projects ----
  const mappedProjects = projects.map((proj: any) => {
    const techArray: string[] = safeArray(proj.technologies || proj.tech || []);
    const tech =
      techArray.length > 0
        ? techArray.map(cleanStr).filter(Boolean).join(", ")
        : cleanStr(proj.tech_stack || proj.stack || "");

    return {
      name: cleanStr(proj.name || proj.title),
      description: cleanStr(proj.description || proj.summary),
      tech,
      link: cleanStr(
        proj.link ||
          proj.github_url ||
          proj.repo_url ||
          proj.demo_url ||
          proj.url
      ),
    };
  });

  // ---- skills ----
  const skillsItems: string[] = skillsRaw
    .map((s: any) => {
      if (typeof s === "string") return cleanStr(s);
      if (s && typeof s === "object") {
        return cleanStr(
          s.name || s.label || s.skill || s.title
        );
      }
      return "";
    })
    .filter(Boolean);

  // ---- overrides for education/certs/etc. (one line per item) ----
  const educationOverride = education.map((e: any) => {
    const degree = cleanStr(e.degree || e.title);
    const field = cleanStr(e.field || e.field_of_study || e.major);
    const school = cleanStr(
      e.school ||
        e.school_name ||
        e.institution ||
        e.organization ||
        ""
    );
    const start = cleanStr(e.start_year || e.start || "");
    const end = cleanStr(e.end_year || e.end || "");
    let years = cleanStr(e.years || e.dates || e.date || "");
    if (!years && (start || end)) {
      years = [start, end].filter(Boolean).join(" - ");
    }

    const head = [degree, field].filter(Boolean).join(" · ");
    const parts = [head, school, years].filter(Boolean);
    return parts.join(" — ");
  });

  const certificationsOverride = certifications.map((c: any) => {
    const name = cleanStr(c.name || c.title);
    const org = cleanStr(
      c.issuer ||
        c.organization ||
        c.company ||
        c.issuing_organization
    );
    const date = cleanStr(
      c.date || c.year || c.issue_date || c.issued_at || ""
    );
    const parts = [name, org, date].filter(Boolean);
    return parts.join(" — ");
  });

  const publicationsOverride = publications.map((pub: any) => {
    const title = cleanStr(pub.title || pub.name);
    const venue = cleanStr(
      pub.venue ||
        pub.journal ||
        pub.conference ||
        pub.publisher ||
        pub.publication
    );
    const year = cleanStr(pub.year || pub.date);
    const parts = [title, venue, year].filter(Boolean);
    return parts.join(" — ");
  });

  const awardsOverride = awards.map((a: any) => {
    const title = cleanStr(a.title || a.name);
    const cat = cleanStr(a.category || a.type || a.label || a.tag);
    const org = cleanStr(
      a.org || a.organization || a.company || a.issuer
    );
    const date = cleanStr(a.date || a.year);
    const head = [title, cat].filter(Boolean).join(" · ");
    const parts = [head, org, date].filter(Boolean);
    return parts.join(" — ");
  });

  const hobbiesOverride = hobbies
    .map((h: any) => {
      if (typeof h === "string") return cleanStr(h);
      if (h && typeof h === "object") {
        return cleanStr(h.name || h.title || h.label);
      }
      return "";
    })
    .filter(Boolean);

  // ---- narrative section defaults (so editor + template stay in sync) ----
  const overviewFromProfile = cleanStr(
    profile.portfolio_overview ||
      profile.summary ||
      profile.bio ||
      profile.about ||
      ""
  );

  const defaultSections = {
    overview:
      overviewFromProfile ||
      "I enjoy taking ideas from rough sketch to production-ready systems: understanding requirements, designing clean APIs, and delivering maintainable code.",
    whatIWorkOn: [
      "Building backend services, REST/GraphQL APIs, and data-heavy pipelines.",
      "Designing front-end experiences with modern frameworks and clean UI patterns.",
      "Working with cloud infrastructure (AWS/GCP), containers, and CI/CD.",
    ],
    engineeringPhilosophy: [
      "Ship small, testable changes and iterate quickly.",
      "Favor readability and clear ownership over clever one-liners.",
      "Use metrics, logs, and user feedback to guide improvements.",
    ],
    howIWorkSteps: [
      "Discover & Design|Clarify the problem, edge cases, and constraints. Propose a simple architecture and data model.",
      "Build & Review|Implement in small pieces, write tests, and collaborate through code reviews.",
      "Deploy & Learn|Monitor in production, gather metrics, and iterate on performance and UX.",
    ],
    experienceIntro:
      "Teams I've worked with and problems I've helped solve.",
    footerSubheading:
      "I’m always happy to chat about roles, internships, or interesting problems to solve.",
  };

  const sections: any = {
    ...defaultSections,
    educationOverride,
    certificationsOverride,
    publicationsOverride,
    awardsOverride,
    hobbiesOverride,
  };

  return {
    about,
    experience,
    projects: mappedProjects,
    skills: {
      items: skillsItems,
    },
    education,
    certifications,
    publications,
    awards,
    hobbies,
    contact,
    sections,
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
  const resumeId = qs.get("resumeId") || ""; // currently unused, but kept if you add per-resume portfolios later

  const [tpl, setTpl] = useState<any>(null);
  const [title, setTitle] = useState("My Portfolio");
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<Record<string, string>>({});
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  const Renderer =
    templateKey === "modern" ? ModernRenderer : ClassicRenderer;

  useEffect(() => {
    getTemplate(templateKey).then(setTpl);
  }, [templateKey]);

  // ✅ Prefill from PORTFOLIO forms (not parsed resume)
  useEffect(() => {
    async function loadFromPortfolio() {
      try {
        const p = await portfolioService.getPortfolio();
        if (!p) return;

        const mapped = mapPortfolioToTemplateData(p);

        // Don't overwrite if user already edited / loaded a draft
        setData((prev: any) => {
          if (prev && Object.keys(prev).length > 0) return prev;
          return mapped;
        });
      } catch (err) {
        console.error("Failed to prefill from portfolio forms", err);
      }
    }

    loadFromPortfolio();
  }, [resumeId]);

  const resolvedTheme = useMemo(
    () => ({ ...(tpl?.default_theme || {}), ...(theme || {}) }),
    [tpl, theme]
  );

  const accentColor = resolvedTheme["--accent"] || "#6366f1";

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
        `/editor?template=${templateKey}&id=${saved.id}&resumeId=${resumeId}`
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
        `/editor?template=${templateKey}&id=${id}&resumeId=${resumeId}`
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
                  marginTop: "12px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
                onClick={() => {
                  downloadStaticPortfolioZip({
                    templateKey,
                    data,
                    theme: resolvedTheme,
                    title,
                  });
                }}
              >
                ⬇️ Download ZIP
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
