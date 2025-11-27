import React from "react";
import "../styles/classic.css";

type Props = { data: any; theme: Record<string, string> };

export default function ClassicRenderer({ data, theme }: Props) {
  const about = data?.about || {};
  const allProjects = data?.projects || [];
  const allExperience = data?.experience || [];
  const allSkills: string[] = data?.skills?.items || [];
  const links = about?.links || {};

  // Portfolio-style choices: show a curated subset
  const featuredProjects = allProjects.slice(0, 3);
  const recentExperience = allExperience.slice(0, 3);
  const heroSkills = allSkills.slice(0, 8);

  const name = about.name || "Your Name";
  const headline = about.headline || "Role / Title";
  const summary =
    about.summary ||
    "Short intro about who you are, what you do, and what you’re excited about.";

  return (
    <div className="cf-page">
      <div className="cf-shell">
        {/* HERO */}
        <header className="cf-hero cf-hero--portfolio">
          <div className="cf-hero-main">
            <p className="cf-hero-kicker">Portfolio</p>
            <h1 className="cf-name">{name}</h1>
            <p className="cf-headline">{headline}</p>
            <p className="cf-summary">{summary}</p>

            {!!heroSkills.length && (
              <div className="cf-hero-skills">
                {heroSkills.map((s, i) => (
                  <span key={i} className="cf-pill">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="cf-links">
              {about.location && (
                <span className="cf-pill">📍 {about.location}</span>
              )}
              {links?.github && (
                <a
                  className="cf-link"
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              )}
              {links?.linkedin && (
                <a
                  className="cf-link"
                  href={links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              )}
              {about.website && (
                <a
                  className="cf-link"
                  href={about.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Website
                </a>
              )}
            </div>
          </div>

          <div className="cf-hero-aside">
            <div className="cf-stat-card">
              <span className="cf-stat-label">Projects</span>
              <span className="cf-stat-value">
                {allProjects.length || "—"}
              </span>
            </div>
            <div className="cf-stat-card">
              <span className="cf-stat-label">Experience</span>
              <span className="cf-stat-value">
                {allExperience.length || "—"}
              </span>
            </div>
            <div className="cf-stat-card">
              <span className="cf-stat-label">Skills</span>
              <span className="cf-stat-value">
                {allSkills.length || "—"}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="cf-main-portfolio">
          {/* FEATURED PROJECTS */}
          {!!featuredProjects.length && (
            <section className="cf-section cf-section--wide">
              <div className="cf-section-heading">
                <h2 className="cf-section-title">Featured Projects</h2>
                <p className="cf-section-subtitle">
                  A few things I’ve been building recently.
                </p>
              </div>
              <div className="cf-project-grid">
                {featuredProjects.map((p: any, i: number) => (
                  <article key={i} className="cf-project-card">
                    <h3 className="cf-project-title">{p.name}</h3>
                    {p.tech && (
                      <p className="cf-project-tech">{p.tech}</p>
                    )}
                    {p.description && (
                      <p className="cf-project-body">
                        {p.description}
                      </p>
                    )}
                    {p.link && (
                      <a
                        className="cf-link cf-link--inline"
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View project →
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCE + SKILLS SIDE BY SIDE */}
          {(!!recentExperience.length || !!allSkills.length) && (
            <section className="cf-section cf-section--split">
              {!!recentExperience.length && (
                <div className="cf-col">
                  <div className="cf-section-heading">
                    <h2 className="cf-section-title">Experience</h2>
                    <p className="cf-section-subtitle">
                      Recent roles and collaborations.
                    </p>
                  </div>
                  <div className="cf-timeline">
                    {recentExperience.map((job: any, i: number) => (
                      <article key={i} className="cf-timeline-item">
                        <div className="cf-timeline-dot" />
                        <div className="cf-timeline-content">
                          <div className="cf-item-header">
                            <h3 className="cf-item-title">
                              {job.role}
                            </h3>
                            <span className="cf-item-dates">
                              {job.start} – {job.end || "Present"}
                            </span>
                          </div>
                          <p className="cf-item-sub">
                            {job.company}
                            {job.location ? ` · ${job.location}` : ""}
                          </p>
                          {job.description && (
                            <p className="cf-item-body">
                              {job.description}
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {!!allSkills.length && (
                <aside className="cf-col">
                  <div className="cf-section-heading">
                    <h2 className="cf-section-title">Skills</h2>
                    <p className="cf-section-subtitle">
                      A snapshot of tools and strengths.
                    </p>
                  </div>
                  <div className="cf-skill-list">
                    {allSkills.map((s: string, i: number) => (
                      <span key={i} className="cf-pill">
                        {s}
                      </span>
                    ))}
                  </div>
                </aside>
              )}
            </section>
          )}

          <section className="cf-footer-note">
            <p>
              This is the <strong>Classic</strong> portfolio template,
              generated from your uploaded resume. You can tweak any
              section in the editor.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
