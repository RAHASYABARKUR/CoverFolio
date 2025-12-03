import React, { CSSProperties } from "react";
import "../styles/classic.css";

type Props = { data: any; theme: Record<string, string> };

type HowStep = { title: string; body: string };

export default function ClassicRenderer({ data, theme }: Props) {
  const about = data?.about || {};
  const links = about.links || {};
  const sections = data?.sections || {};
  const headings = data?.headings || {};

  const allProjects = data?.projects || [];
  const allSkills: string[] = data?.skills?.items || [];
  const allExperience = data?.experience || [];
  const education = data?.education || [];
  const certifications = data?.certifications || [];
  const publications = data?.publications || [];
  const awards = data?.awards || [];
  const hobbies = data?.hobbies || [];
  const contactInfo = data?.contact || {};

  // ---- overrides for new cards ----
  const educationOverride: string[] = sections.educationOverride || [];
  const certificationsOverride: string[] = sections.certificationsOverride || [];
  const publicationsOverride: string[] = sections.publicationsOverride || [];
  const awardsOverride: string[] = sections.awardsOverride || [];
  const hobbiesOverride: string[] = sections.hobbiesOverride || [];

  const accent = theme["--accent"] || "#6366f1";

  const style: CSSProperties = {
    ["--accent" as any]: accent,
  };

  const glanceChipStyle: CSSProperties = {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 9999,
    background: "rgba(255,255,255,0.16)",
    color: "#fff",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    whiteSpace: "nowrap",
  };
  const rawName = (
    about.name ||
    (about as any).full_name ||
    (about as any).fullName ||
    ""
  )
    .toString()
    .trim();


  const rawRole =
    about.role ||
    about.headline ||
    "";

  const name = rawName || rawRole || "Your Name";
  const role = rawRole || "Software Engineer";

  const intro =
    about.summary ||
    "I build reliable, user-focused software products, from backend APIs and cloud infrastructure to polished front-end experiences.";

  // ---------- editable text blocks ----------

  const overviewText: string =
    sections.overview ||
    "I enjoy taking ideas from rough sketch to production-ready systems: understanding requirements, designing clean APIs, and delivering maintainable code.";

  const defaultWhatIWorkOn: string[] = [
    "Building backend services, REST/GraphQL APIs, and data-heavy pipelines.",
    "Designing front-end experiences with modern frameworks and clean UI patterns.",
    "Working with cloud infrastructure (AWS/GCP), containers, and CI/CD.",
  ];

  const defaultEngPhil: string[] = [
    "Ship small, testable changes and iterate quickly.",
    "Favor readability and clear ownership over clever one-liners.",
    "Use metrics, logs, and user feedback to guide improvements.",
  ];

  const whatIWorkOn: string[] =
    sections.whatIWorkOn && sections.whatIWorkOn.length
      ? sections.whatIWorkOn
      : defaultWhatIWorkOn;

  const engineeringPhilosophy: string[] =
    sections.engineeringPhilosophy && sections.engineeringPhilosophy.length
      ? sections.engineeringPhilosophy
      : defaultEngPhil;

  const defaultHowStepsRaw: string[] = [
    "Discover & Design|Clarify the problem, edge cases, and constraints. Propose a simple architecture and data model.",
    "Build & Review|Implement in small pieces, write tests, and collaborate through code reviews.",
    "Deploy & Learn|Monitor in production, gather metrics, and iterate on performance and UX.",
  ];

  const howStepsRaw: string[] =
    sections.howIWorkSteps && sections.howIWorkSteps.length
      ? sections.howIWorkSteps
      : defaultHowStepsRaw;

  const howSteps: HowStep[] = howStepsRaw.map((line: string) => {
    const [t, ...rest] = line.split("|");
    return {
      title: (t || "").trim() || "Step",
      body: (rest.join("|") || "").trim(),
    };
  });

  const experienceIntro: string =
    sections.experienceIntro ||
    "Teams I've worked with and problems I've helped solve.";

  const footerSubheading: string =
    sections.footerSubheading ||
    "I’m always happy to chat about roles, internships, or interesting problems to solve.";

  // ---------- section headings (editable) ----------

  const H = {
    whatIWorkOn: headings.whatIWorkOn || "What I Work On",
    engineeringPhilosophy:
      headings.engineeringPhilosophy || "Engineering Philosophy",
    howIWork: headings.howIWork || "How I Work",
    projects: headings.projects || "Projects",
    experience: headings.experience || "Experience",
    techStack: headings.techStack || "Tech Stack & Tools",
    education: headings.education || "Education",
    certifications: headings.certifications || "Certifications",
    publications: headings.publications || "Publications & Patents",
    awards: headings.awards || "Accomplishments & Awards",
    hobbies: headings.hobbies || "Hobbies & Interests",
    contact: headings.contact || "Contact Information",
    thanks: headings.thanks || "Thanks for Visiting",
  };

  // ---------- small stats for the dark band ----------

  const statProjects = allProjects.length;
  const statSkills = allSkills.length;
  const statExperience = allExperience.length;
  const statEducation = education.length;

  // ---------- helpers to know which sections actually have content ----------

  const hasEducation =
    (educationOverride && educationOverride.length > 0) ||
    (education && education.length > 0);

  const hasCertifications =
    (certificationsOverride && certificationsOverride.length > 0) ||
    (certifications && certifications.length > 0);

  const hasPublications =
    (publicationsOverride && publicationsOverride.length > 0) ||
    (publications && publications.length > 0);

  const hasAwards =
    (awardsOverride && awardsOverride.length > 0) ||
    (awards && awards.length > 0);

  const hasHobbies =
    (hobbiesOverride && hobbiesOverride.length > 0) ||
    (Array.isArray(hobbies) && hobbies.length > 0);

  // ---------- render helpers so we can reuse cards in different layouts ----------

  const renderEducationCard = () => (
    <div className="ad-card">
      <h2 className="ad-section-title">{H.education}</h2>
      {educationOverride && educationOverride.length ? (
        <ul className="ad-list-plain">
          {educationOverride.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : education.length ? (
        <ul className="ad-list-plain">
          {education.map((e: any, i: number) => {
            const school =
              e.school || e.institution || e.organization || "";
            const degree = e.degree || e.title || "";
            const field = e.field || e.major || "";
            const years = e.years || e.dates || e.date || "";
            return (
              <li key={i}>
                <div className="ad-bold-line">
                  {degree}
                  {field && degree && " · "}
                  {field}
                </div>
                {school && <div>{school}</div>}
                {years && <div className="ad-muted-line">{years}</div>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ad-empty">No education added yet.</p>
      )}
    </div>
  );

  const renderCertificationsCard = () => (
    <div className="ad-card">
      <h2 className="ad-section-title">{H.certifications}</h2>
      {certificationsOverride && certificationsOverride.length ? (
        <ul className="ad-list-plain">
          {certificationsOverride.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : certifications.length ? (
        <ul className="ad-list-plain">
          {certifications.map((c: any, i: number) => {
            const certName = c.name || c.title || "";
            const org =
              c.issuer || c.organization || c.company || "";
            const date = c.date || c.year || "";
            return (
              <li key={i}>
                <div className="ad-bold-line">{certName}</div>
                {org && <div>{org}</div>}
                {date && <div className="ad-muted-line">{date}</div>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ad-empty">No certifications added yet.</p>
      )}
    </div>
  );

  const renderPublicationsCard = () => (
    <div className="ad-card">
      <h2 className="ad-section-title">{H.publications}</h2>
      {publicationsOverride && publicationsOverride.length ? (
        <ul className="ad-list-plain">
          {publicationsOverride.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : publications.length ? (
        <ul className="ad-list-plain">
          {publications.map((p: any, i: number) => {
            const title = p.title || p.name || "";
            const venue =
              p.venue || p.journal || p.conference || p.publisher || "";
            const year = p.year || p.date || "";
            return (
              <li key={i}>
                <div className="ad-bold-line">{title}</div>
                {venue && <div>{venue}</div>}
                {year && <div className="ad-muted-line">{year}</div>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ad-empty">No publications added yet.</p>
      )}
    </div>
  );

  const renderAwardsCard = () => (
    <div className="ad-card">
      <h2 className="ad-section-title">{H.awards}</h2>
      {awardsOverride && awardsOverride.length ? (
        <ul className="ad-list-plain">
          {awardsOverride.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : awards.length ? (
        <ul className="ad-list-plain">
          {awards.map((a: any, i: number) => {
            const title = a.title || a.name || "";
            const category =
              a.category || a.type || a.label || a.tag || "";
            const org =
              a.org || a.organization || a.company || a.issuer || "";
            const date = a.date || a.year || "";
            return (
              <li key={i}>
                <div className="ad-bold-line">
                  {title}
                  {category && " · " + category}
                </div>
                {org && <div>{org}</div>}
                {date && <div className="ad-muted-line">{date}</div>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="ad-empty">
          No accomplishments or awards added yet.
        </p>
      )}
    </div>
  );

  return (
    <div className="ad-page" style={style}>
      <div className="ad-shell">
        {/* TOP NAV — feels like a website */}
        <header className="ad-nav">
          <div className="ad-nav-brand">{name}</div>
          <nav className="ad-nav-links">
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#education">Education</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section className="ad-hero">
          <div className="ad-hero-left">
            <p className="ad-hero-kicker">SOFTWARE PORTFOLIO</p>
            <h1 className="ad-hero-title">Hey, I&apos;m {name}.</h1>
            <p className="ad-hero-subtitle">{role}</p>
            <p className="ad-hero-body">{intro}</p>

            <div className="ad-hero-links">
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="ad-pill"
                >
                  GitHub
                </a>
              )}
              {links.linkedin && (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="ad-pill"
                >
                  LinkedIn
                </a>
              )}
              {about.location && (
                <span className="ad-pill muted">📍 {about.location}</span>
              )}
            </div>

            <button
              type="button"
              className="ad-hero-cta"
              onClick={() =>
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View My Work
            </button>
          </div>

          <div className="ad-hero-right">
            <div className="ad-hero-card">
              <div className="ad-hero-badge">Overview</div>
              <p className="ad-hero-card-text">{overviewText}</p>
              {allSkills.slice(0, 5).length > 0 && (
                <div className="ad-chip-row">
                  {allSkills.slice(0, 5).map((s, i) => (
                    <span key={i} className="ad-chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* APPROACH / HOW I WORK */}
        <section className="ad-approach">
          <div
            className="ad-approach-media"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "24px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              At a glance
            </div>

            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {role}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 16,
              }}
            >
              {statProjects > 0 && (
                <span style={glanceChipStyle}>
                  {statProjects} project{statProjects > 1 ? "s" : ""}
                </span>
              )}
              {statExperience > 0 && (
                <span style={glanceChipStyle}>
                  {statExperience} role{statExperience > 1 ? "s" : ""}
                </span>
              )}
              {statSkills > 0 && (
                <span style={glanceChipStyle}>
                  {statSkills} skill{statSkills > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="ad-approach-text">
            <h2 className="ad-section-title">{H.howIWork}</h2>
            <p className="ad-section-subtitle">
              A simple workflow I follow on most projects.
            </p>
            <ol className="ad-steps">
              {howSteps.map((s, i) => (
                <li key={i}>
                  <span className="ad-step-title">{s.title}</span>
                  {s.body && <p className="ad-step-body">{s.body}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHAT I WORK ON + PHILOSOPHY */}
        <section className="ad-two-col">
          <div className="ad-card">
            <h2 className="ad-section-title">{H.whatIWorkOn}</h2>
            <p className="ad-section-subtitle">
              Areas I’ve spent most of my time coding and shipping.
            </p>
            <ul className="ad-list">
              {whatIWorkOn.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="ad-card">
            <h2 className="ad-section-title">{H.engineeringPhilosophy}</h2>
            <p className="ad-section-subtitle">
              How I like to approach code, collaboration, and delivery.
            </p>
            <ul className="ad-list">
              {engineeringPhilosophy.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* STATS BAND */}
        <section className="ad-stats">
          <div className="ad-stat">
            <div className="ad-stat-number">{statProjects}</div>
            <div className="ad-stat-label">Projects</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-number">{statSkills}</div>
            <div className="ad-stat-label">Skills</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-number">{statExperience}</div>
            <div className="ad-stat-label">Experience Entries</div>
          </div>
          <div className="ad-stat">
            <div className="ad-stat-number">{statEducation}</div>
            <div className="ad-stat-label">Education Records</div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="ad-case-studies" id="projects">
          <h2 className="ad-case-title">{H.projects}</h2>
          <p className="ad-section-subtitle center">
            A selection of work that showcases how I think and build.
          </p>
          {allProjects.length ? (
            <div className="ad-case-grid">
              {allProjects.map((p: any, i: number) => (
                <article key={i} className="ad-case-card">
                  <h3 className="ad-case-card-title">
                    {p.name || p.title || "Project"}
                  </h3>
                  {p.tech && (
                    <p className="ad-case-card-tech">{p.tech}</p>
                  )}
                  {p.description && (
                    <p className="ad-case-card-body">{p.description}</p>
                  )}
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="ad-case-card-link"
                    >
                      View project →
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="ad-empty center">No projects added yet.</p>
          )}
        </section>

        {/* EXPERIENCE + TECH STACK */}
        <section className="ad-two-col" id="experience">
          <div className="ad-card">
            <h2 className="ad-section-title">{H.experience}</h2>
            <p className="ad-section-subtitle">{experienceIntro}</p>
            {allExperience.length ? (
              <ul className="ad-list-plain">
                {allExperience.map((e: any, i: number) => {
                  const r = e.role || e.title || "Role";
                  const company = e.company || e.org || e.organization || "";
                  const location = e.location || "";
                  const years = e.years || e.dates || e.date || "";
                  const lineParts = [company, location, years].filter(Boolean);
                  return (
                    <li key={i}>
                      <div className="ad-bold-line">{r}</div>
                      {lineParts.length > 0 && (
                        <div className="ad-muted-line">
                          {lineParts.join(" · ")}
                        </div>
                      )}
                      {e.description && (
                        <div className="ad-small-body">
                          {e.description}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="ad-empty">No experience added yet.</p>
            )}
          </div>

          <div className="ad-card">
            <h2 className="ad-section-title">{H.techStack}</h2>
            <p className="ad-section-subtitle">
              Languages, frameworks, and platforms I use regularly.
            </p>
            {allSkills.length ? (
              <div className="ad-chip-grid">
                {allSkills.map((s, i) => (
                  <span key={i} className="ad-chip-outline">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ad-empty">No skills added yet.</p>
            )}
          </div>
        </section>

        {/* EDUCATION + CERTIFICATIONS (conditional layout) */}
        {hasEducation || hasCertifications ? (
          hasEducation && hasCertifications ? (
            <section className="ad-two-col" id="education">
              {renderEducationCard()}
              {renderCertificationsCard()}
            </section>
          ) : (
            <section className="ad-full-card" id="education">
              {hasEducation ? renderEducationCard() : renderCertificationsCard()}
            </section>
          )
        ) : null}

        {/* PUBLICATIONS + AWARDS (conditional layout) */}
        {hasPublications || hasAwards ? (
          hasPublications && hasAwards ? (
            <section className="ad-two-col">
              {renderPublicationsCard()}
              {renderAwardsCard()}
            </section>
          ) : (
            <section className="ad-full-card">
              {hasPublications ? renderPublicationsCard() : renderAwardsCard()}
            </section>
          )
        ) : null}

        {/* HOBBIES (only if there is data) */}
        {hasHobbies && (
          <section className="ad-full-card">
            <h2 className="ad-section-title">{H.hobbies}</h2>

            {hobbiesOverride && hobbiesOverride.length ? (
              <ul className="ad-list-plain">
                {hobbiesOverride.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            ) : (
              <div className="ad-chip-grid">
                {hobbies.map((h: any, i: number) => {
                  const label =
                    typeof h === "string"
                      ? h
                      : h.name || h.title || h.label || "";
                  return (
                    <span key={i} className="ad-chip-outline">
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* CONTACT / CTA */}
        <section className="ad-contact" id="contact">
          <div className="ad-contact-left">
            <h2 className="ad-contact-title">{H.contact}</h2>
            <p className="ad-contact-body">{footerSubheading}</p>
            <div className="ad-contact-lines">
              {about.email && (
                <div className="ad-contact-line">{about.email}</div>
              )}
              {contactInfo.phone && (
                <div className="ad-contact-line">
                  Phone · {contactInfo.phone}
                </div>
              )}
              {links.linkedin && (
                <div className="ad-contact-line">
                  LinkedIn · {links.linkedin}
                </div>
              )}
            </div>
          </div>
          <div className="ad-contact-media" />
        </section>

        {/* FOOTER */}
        <footer className="ad-footer">
          <div>{name}</div>
          <div className="ad-footer-right">© {new Date().getFullYear()}</div>
        </footer>
      </div>
    </div>
  );
}
