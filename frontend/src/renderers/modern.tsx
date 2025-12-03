// src/renderers/modern.tsx
import React, { CSSProperties } from "react";
import "../styles/modern.css";

type Props = { data: any; theme: Record<string, string> };

export default function ModernRenderer({ data, theme }: Props) {
  const about = data?.about || {};
  const links = about.links || {};
  const sections = data?.sections || {};
  const headings = data?.headings || {};

  const allProjects = data?.projects || [];
  const allSkills: string[] = data?.skills?.items || [];
  const allExperience = data?.experience || [];
  const education = data?.education || [];
  const contactInfo = data?.contact || {};

  const accent = theme["--accent"] || "#6366f1";

  const style: CSSProperties = {
    ["--accent" as any]: accent,
  };

  // ----- name / role / intro (synced with Classic behavior) -----
  const rawName =
    about.name || about.full_name || about.fullName || "";
  const rawRole = about.headline || about.role || "";

  const name = rawName || rawRole || "Your Name";
  const role = rawRole || "Product / Software Engineer";

  const intro =
    about.summary ||
    "I design and build thoughtful digital experiences across web, cloud, and product surfaces.";

  // ----- headings -----
  const H = {
    about: headings.about || "About",
    projects: headings.projects || "Projects",
    experience: headings.experience || "Experience",
    education: headings.education || "Education",
    skills: headings.techStack || "Skills",
    contact: headings.contact || "Contact",
  };

  // ----- editor overrides for education -----
  const educationOverride: string[] = sections.educationOverride || [];
  const hasEducationOverride = educationOverride.length > 0;

  // choose which education source to render:
  // - if user edited override text in Editor -> use that
  // - else use structured education array from portfolio
  const hasStructuredEducation = education && education.length > 0;

  const email = contactInfo.email || about.email;

  return (
    <div className="mod-page" style={style}>
      {/* LEFT: fixed sidebar */}
      <aside className="mod-sidebar">
        <div className="mod-logo">{name}</div>
        <p className="mod-tagline">{role}</p>

        <nav className="mod-nav">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#education">Education</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="mod-links">
          {links.github && (
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {links.linkedin && (
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
          {about.location && (
            <span className="mod-location">📍 {about.location}</span>
          )}
        </div>
      </aside>

      {/* RIGHT: scrollable main content */}
      <main className="mod-main">
        {/* HERO */}
        <section className="mod-hero" id="about">
          <p className="mod-hero-kicker">PORTFOLIO</p>
          <h1 className="mod-hero-title">
            Hey, I&apos;m <span>{name}</span>.
          </h1>
          <p className="mod-hero-subtitle">{role}</p>
          <p className="mod-hero-body">{intro}</p>
        </section>

        {/* PROJECTS */}
        <section className="mod-section" id="projects">
          <header className="mod-section-header">
            <h2>{H.projects}</h2>
            <p>Selected work that reflects how I think and build.</p>
          </header>

          {allProjects.length ? (
            <div className="mod-project-grid">
              {allProjects.map((p: any, i: number) => (
                <article key={i} className="mod-project-card">
                  <div className="mod-pill">Case Study</div>
                  <h3>{p.name || p.title || "Project"}</h3>
                  {p.tech && <p className="mod-project-tech">{p.tech}</p>}
                  {p.description && (
                    <p className="mod-project-body">{p.description}</p>
                  )}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mod-project-link"
                    >
                      View project →
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mod-empty">No projects added yet.</p>
          )}
        </section>

        {/* EXPERIENCE */}
        <section className="mod-section" id="experience">
          <header className="mod-section-header">
            <h2>{H.experience}</h2>
            <p>Roles, teams, and problems I&apos;ve worked on.</p>
          </header>

          {allExperience.length ? (
            <ul className="mod-timeline">
              {allExperience.map((e: any, i: number) => {
                const title = e.role || e.title || "Role";
                const company = e.company || e.org || e.organization || "";
                const location = e.location || "";
                const years = e.years || e.dates || e.date || "";
                const line = [company, location].filter(Boolean).join(" · ");
                return (
                  <li key={i} className="mod-timeline-item">
                    <div className="mod-timeline-dot" />
                    <div className="mod-timeline-body">
                      <div className="mod-timeline-top">
                        <span className="mod-timeline-title">{title}</span>
                        {years && (
                          <span className="mod-timeline-years">{years}</span>
                        )}
                      </div>
                      {line && (
                        <div className="mod-timeline-sub">{line}</div>
                      )}
                      {e.description && (
                        <p className="mod-timeline-desc">{e.description}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mod-empty">No experience added yet.</p>
          )}
        </section>

        {/* EDUCATION + SKILLS */}
        <section className="mod-section mod-two-col" id="education">
          <div className="mod-column">
            <header className="mod-section-header small">
              <h2>{H.education}</h2>
            </header>

            {/* If user typed custom education lines in Editor, render those.
                Otherwise fall back to structured education array. */}
            {hasEducationOverride ? (
              <ul className="mod-list-plain">
                {educationOverride.map((line, i) => (
                  <li key={i}>
                    <div className="mod-bold-line">{line}</div>
                  </li>
                ))}
              </ul>
            ) : hasStructuredEducation ? (
              <ul className="mod-list-plain">
                {education.map((e: any, i: number) => {
                  const school =
                    e.school || e.institution || e.organization || "";
                  const degree = e.degree || e.title || "";
                  const field = e.field || e.major || "";
                  const years = e.years || e.dates || e.date || "";
                  return (
                    <li key={i}>
                      <div className="mod-bold-line">
                        {degree}
                        {field && degree && " · "}
                        {field}
                      </div>
                      {school && (
                        <div className="mod-muted-line">{school}</div>
                      )}
                      {years && (
                        <div className="mod-muted-line">{years}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mod-empty">No education added yet.</p>
            )}
          </div>

          <div className="mod-column" id="skills">
            <header className="mod-section-header small">
              <h2>{H.skills}</h2>
            </header>
            {allSkills.length ? (
              <div className="mod-skill-grid">
                {allSkills.map((s, i) => (
                  <span key={i} className="mod-skill-pill">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mod-empty">No skills added yet.</p>
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section className="mod-section mod-contact" id="contact">
          <header className="mod-section-header">
            <h2>{H.contact}</h2>
            <p>Open to roles, collaborations, and interesting problems.</p>
          </header>
          <div className="mod-contact-grid">
            <div>
              {email && (
                <div className="mod-contact-line">{email}</div>
              )}
              {contactInfo.phone && (
                <div className="mod-contact-line">
                  Phone · {contactInfo.phone}
                </div>
              )}
              {links.linkedin && (
                <div className="mod-contact-line">
                  LinkedIn · {links.linkedin}
                </div>
              )}
            </div>
            <div className="mod-contact-note">
              Let me know what you&apos;re working on, and I&apos;ll get back
              to you soon.
            </div>
          </div>
        </section>

        <footer className="mod-footer">
          <span>{name}</span>
          <span>© {new Date().getFullYear()}</span>
        </footer>
      </main>
    </div>
  );
}
