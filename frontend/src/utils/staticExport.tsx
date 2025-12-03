// src/utils/staticExport.tsx
import React from "react";
import ReactDOMServer from "react-dom/server";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import ClassicRenderer from "../renderers/classic";
import ModernRenderer from "../renderers/modern";

type ExportOptions = {
  templateKey: string; // "classic" | "modern"
  data: any;
  theme: Record<string, string>;
  title: string;
};

/** tiny helper to make a safe filename */
function slugifyFilename(title: string): string {
  const base = (title || "portfolio")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "portfolio";
}

/** escape HTML in <title> etc. */
function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Build a static index.html inside a ZIP for the current portfolio
 * and trigger download in the browser.
 */
export async function downloadStaticPortfolioZip(opts: ExportOptions) {
  const { templateKey, data, theme, title } = opts;

  const Renderer =
    templateKey === "modern" ? ModernRenderer : ClassicRenderer;

  const baseCss =
    templateKey === "modern" ? MODERN_CSS : CLASSIC_CSS;

  // theme overrides -> :root { --accent: ...; ... }
  const themeCss =
    theme && Object.keys(theme).length
      ? `\n:root{${Object.entries(theme)
          .map(([k, v]) => `${k}:${v};`)
          .join("")}}\n`
      : "";

  const html = ReactDOMServer.renderToStaticMarkup(
    <Renderer data={data} theme={theme} />
  );

  const documentHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>${escapeHtml(title || "My Portfolio")}</title>
  <style>
${baseCss}
${themeCss}
  </style>
</head>
<body>
${html}
</body>
</html>`;

  const zip = new JSZip();
  zip.file("index.html", documentHtml);

  const blob = await zip.generateAsync({ type: "blob" });
  const filename = `${slugifyFilename(title)}-${templateKey}.zip`;
  saveAs(blob, filename);
}

/* ------------------------------------------------------------------ */
/*  CSS for static export — copied from your classic.css / modern.css  */
/*  (inline so the downloaded index.html works with no build step)    */
/* ------------------------------------------------------------------ */

const CLASSIC_CSS = String.raw`
:root {
  --accent: #6366f1;
}

/* PAGE BACKGROUND */

.ad-page {
  min-height: 100vh;
  /* 3–4 cm-ish border around the whole page */
  padding: 24px;              /* was 32px 0 */
  background: radial-gradient(
    circle at top left,
    #a855f7 0,
    #4f46e5 40%,
    #0f172a 100%
  );
  box-sizing: border-box;
}

/* Make the inner shell almost full-width */
.ad-shell {
  width: 100%;
  max-width: 1400px;          /* was 1120px */
  margin: 0 auto;             /* centers the shell */
  background: #f5f3ff;
  border-radius: 28px;        /* slightly softer corners, optional */
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.55);
  padding: 28px 36px 40px;    /* a bit more breathing room inside */
  color: #111827;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}


/* TOP NAV */

.ad-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  padding-bottom: 12px;
  margin-bottom: 24px;
}

.ad-nav-brand {
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 12px;
}

.ad-nav-links {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.ad-nav-links a {
  color: #4b5563;
  text-decoration: none;
}

.ad-nav-links a:hover {
  color: var(--accent);
}

/* HERO (Adri-style) */

.ad-hero {
  background: #e4ddff;
  border-radius: 28px;
  padding: 40px 32px;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 1fr);
  gap: 32px;
  align-items: center;
  margin-bottom: 32px;
}

.ad-hero-left {
  max-width: 540px;
}

.ad-hero-kicker {
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #6b21a8;
  margin-bottom: 8px;
}

.ad-hero-title {
  font-size: 40px;
  line-height: 1.1;
  font-weight: 700;
  margin: 0;
}

.ad-hero-subtitle {
  margin-top: 8px;
  font-size: 18px;
  color: #4f46e5;
  font-weight: 600;
}

.ad-hero-body {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
}

.ad-hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.ad-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 12px;
  text-decoration: none;
  color: #111827;
}

.ad-pill.muted {
  background: transparent;
}

.ad-pill:hover {
  background: #e5e7eb;
}

.ad-hero-cta {
  margin-top: 20px;
  padding: 10px 22px;
  border-radius: 999px;
  border: none;
  background: #f97373;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.ad-hero-cta:hover {
  background: #fb6a6a;
}

.ad-hero-right {
  display: flex;
  justify-content: flex-end;
}

.ad-hero-card {
  width: 100%;
  max-width: 320px;
  border-radius: 28px;
  padding: 18px 18px 16px;
  background: radial-gradient(circle at top left, #f97316, #ec4899, var(--accent));
  color: #f9fafb;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.38);
}

.ad-hero-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(249, 250, 251, 0.7);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 8px;
}

.ad-hero-card-text {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 10px;
}

.ad-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ad-chip {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  background: rgba(249, 250, 251, 0.2);
  border: 1px solid rgba(249, 250, 251, 0.4);
}

/* APPROACH */

.ad-approach {
  display: grid;
  grid-template-columns: minmax(260px, 1.1fr) minmax(0, 1.4fr);
  gap: 32px;
  align-items: center;
  margin-bottom: 32px;
}

.ad-approach-media {
  border-radius: 28px;
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.35),
      rgba(15, 23, 42, 0.1)
    ),
    radial-gradient(circle at top left, #f97316, #ec4899, var(--accent));
  min-height: 220px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.35);
}

.ad-approach-text {
  background: #f9fafb;
  border-radius: 24px;
  padding: 20px 22px 18px;
  border: 1px solid #e5e7eb;
}

.ad-section-title {
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
}

.ad-section-subtitle {
  margin-top: 8px;
  font-size: 13px;
  color: #4b5563;
}

.ad-section-subtitle.center {
  text-align: center;
}

.ad-steps {
  margin-top: 14px;
  padding-left: 18px;
  font-size: 13px;
  color: #374151;
}

.ad-steps li + li {
  margin-top: 10px;
}

.ad-step-title {
  font-weight: 600;
  display: block;
}

.ad-step-body {
  margin-top: 2px;
}

/* TWO-COLUMN TEXT SECTIONS */

.ad-two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.ad-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 18px 18px 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

.ad-list {
  margin-top: 10px;
  padding-left: 18px;
  font-size: 13px;
  color: #374151;
}

.ad-list li + li {
  margin-top: 6px;
}

/* DARK STATS BAND */

.ad-stats {
  margin: 32px 0;
  border-radius: 28px;
  background: #020617;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  color: #f9fafb;
}

.ad-stat {
  text-align: center;
}

.ad-stat-number {
  font-size: 20px;
  font-weight: 700;
}

.ad-stat-label {
  font-size: 13px;
  margin-top: 4px;
  color: #e5e7eb;
}

/* CASE STUDIES / PROJECTS */

.ad-case-studies {
  margin-bottom: 32px;
}

.ad-case-title {
  font-size: 24px;
  text-align: center;
  font-weight: 700;
}

.ad-case-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.ad-case-card {
  border-radius: 26px;
  padding: 20px 18px 18px;
  background: #d9d2a6;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
}

.ad-case-card-title {
  font-size: 17px;
  font-weight: 600;
}

.ad-case-card-tech {
  margin-top: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #4b5563;
}

.ad-case-card-body {
  margin-top: 10px;
  font-size: 13px;
  color: #111827;
}

.ad-case-card-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  text-decoration: underline;
  color: #111827;
}

/* EXPERIENCE / EDUCATION / ETC LISTS */

.ad-list-plain {
  margin-top: 12px;
  font-size: 13px;
  color: #374151;
  padding-left: 0;
  list-style: none;
}

.ad-list-plain li + li {
  margin-top: 10px;
}

.ad-bold-line {
  font-weight: 600;
}

.ad-muted-line {
  font-size: 12px;
  color: #6b7280;
}

.ad-small-body {
  margin-top: 2px;
  font-size: 12px;
}

/* CHIP GRID (skills, hobbies) */

.ad-chip-grid {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ad-chip-outline {
  display: inline-flex;
  padding: 4px 11px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 11px;
  background: #f9fafb;
}

/* FULL-WIDTH CARD (HOBBIES) */

.ad-full-card {
  margin-bottom: 32px;
  background: #ffffff;
  border-radius: 24px;
  padding: 18px 18px 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

/* CONTACT BAND (Get in touch) */

.ad-contact {
  margin-top: 8px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(260px, 1fr);
  gap: 24px;
  align-items: stretch;
  background: #fecaca;
  border-radius: 28px;
  padding: 26px 24px;
}

.ad-contact-left {
  max-width: 520px;
}

.ad-contact-title {
  font-size: 22px;
  font-weight: 700;
}

.ad-contact-body {
  margin-top: 8px;
  font-size: 14px;
  color: #374151;
}

.ad-contact-lines {
  margin-top: 12px;
  font-size: 13px;
  color: #111827;
}

.ad-contact-line + .ad-contact-line {
  margin-top: 4px;
}

.ad-contact-media {
  border-radius: 24px;
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.45),
      rgba(15, 23, 42, 0.12)
    ),
    radial-gradient(circle at top left, #f97316, #ec4899, var(--accent));
  min-height: 180px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.35);
}

/* FOOTER */

.ad-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
  font-size: 12px;
  color: #4b5563;
}

.ad-footer-right {
  text-align: right;
}

/* EMPTY STATE TEXT */

.ad-empty {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

/* UTIL */

.center {
  text-align: center;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .ad-shell {
    padding: 20px 16px 28px;
    border-radius: 20px;
  }

  .ad-hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .ad-approach {
    grid-template-columns: minmax(0, 1fr);
  }

  .ad-two-col {
    grid-template-columns: minmax(0, 1fr);
  }

  .ad-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ad-contact {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;

const MODERN_CSS = String.raw`
:root {
  --accent: #6366f1;
}

/* Layout: full page, left fixed, right scroll */

.mod-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, #111827, #020617 55%, #000 100%);
  color: #f9fafb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  display: flex;
}

/* LEFT SIDEBAR */

.mod-sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  min-height: 100vh;
  width: 260px;
  padding: 32px 28px;
  box-sizing: border-box;
  border-right: 1px solid rgba(148, 163, 184, 0.25);
  background: radial-gradient(circle at top, #111827, #020617);
}

.mod-logo {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.mod-tagline {
  margin-top: 6px;
  font-size: 13px;
  color: #9ca3af;
}

.mod-nav {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.mod-nav a {
  color: #e5e7eb;
  text-decoration: none;
  padding: 4px 0;
  position: relative;
}

.mod-nav a::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: transparent;
  transform: translateY(-50%);
}

.mod-nav a:hover {
  color: var(--accent);
}

.mod-nav a:hover::before {
  background: var(--accent);
}

.mod-links {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #9ca3af;
}

.mod-links a {
  color: #e5e7eb;
  text-decoration: none;
}

.mod-links a:hover {
  color: var(--accent);
}

.mod-location {
  margin-top: 8px;
}

/* RIGHT MAIN */

.mod-main {
  flex: 1;
  min-width: 0;
  padding: 32px 48px 48px;
  box-sizing: border-box;
}

/* HERO */

.mod-hero {
  padding: 36px 32px 40px;
  border-radius: 28px;
  background: radial-gradient(circle at top left, #1f2937, #020617);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.6);
  margin-bottom: 40px;
}

.mod-hero-kicker {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 8px;
}

.mod-hero-title {
  font-size: 40px;
  line-height: 1.1;
  margin: 0;
}

.mod-hero-title span {
  color: var(--accent);
}

.mod-hero-subtitle {
  margin-top: 10px;
  font-size: 16px;
  color: #e5e7eb;
}

.mod-hero-body {
  margin-top: 16px;
  max-width: 560px;
  font-size: 14px;
  line-height: 1.7;
  color: #9ca3af;
}

/* GENERIC SECTION */

.mod-section {
  margin-bottom: 48px;
}

.mod-section-header {
  margin-bottom: 16px;
}

.mod-section-header.small {
  margin-bottom: 8px;
}

.mod-section-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.mod-section-header p {
  margin-top: 4px;
  font-size: 13px;
  color: #9ca3af;
}

/* PROJECTS */

.mod-project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.mod-project-card {
  border-radius: 20px;
  padding: 18px 18px 16px;
  background: linear-gradient(135deg, #111827, #020617);
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.6);
}

.mod-pill {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #e5e7eb;
  margin-bottom: 6px;
}

.mod-project-card h3 {
  font-size: 16px;
  margin: 0;
}

.mod-project-tech {
  margin-top: 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9ca3af;
}

.mod-project-body {
  margin-top: 10px;
  font-size: 13px;
  color: #e5e7eb;
}

.mod-project-link {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
}

.mod-project-link:hover {
  text-decoration: underline;
}

/* TIMELINE */

.mod-timeline {
  list-style: none;
  padding-left: 0;
  margin: 0;
  border-left: 1px solid rgba(148, 163, 184, 0.5);
}

.mod-timeline-item {
  position: relative;
  padding-left: 18px;
  padding-bottom: 18px;
}

.mod-timeline-dot {
  position: absolute;
  left: -5px;
  top: 3px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--accent);
}

.mod-timeline-body {
  font-size: 13px;
}

.mod-timeline-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mod-timeline-title {
  font-weight: 600;
}

.mod-timeline-years {
  font-size: 11px;
  color: #9ca3af;
}

.mod-timeline-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #9ca3af;
}

.mod-timeline-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #e5e7eb;
}

/* EDUCATION + SKILLS */

.mod-two-col {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 32px;
}

.mod-column {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 16px 18px 14px;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.mod-list-plain {
  list-style: none;
  padding-left: 0;
  margin-top: 8px;
  font-size: 13px;
  color: #e5e7eb;
}

.mod-list-plain li + li {
  margin-top: 10px;
}

.mod-bold-line {
  font-weight: 600;
}

.mod-muted-line {
  font-size: 12px;
  color: #9ca3af;
}

.mod-skill-grid {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mod-skill-pill {
  display: inline-flex;
  padding: 4px 11px;
  border-radius: 999px;
  background: #111827;
  border: 1px solid rgba(148, 163, 184, 0.5);
  font-size: 11px;
}

/* CONTACT */

.mod-contact {
  background: linear-gradient(135deg, #111827, #020617);
  border-radius: 24px;
  padding: 20px 22px 18px;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.mod-contact-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 24px;
  font-size: 13px;
}

.mod-contact-line + .mod-contact-line {
  margin-top: 6px;
}

.mod-contact-note {
  color: #9ca3af;
}

/* FOOTER */

.mod-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
}

/* EMPTY */

.mod-empty {
  font-size: 12px;
  color: #6b7280;
}

/* RESPONSIVE */

@media (max-width: 960px) {
  .mod-page {
    flex-direction: column;
  }

  .mod-sidebar {
    position: static;
    min-height: auto;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.3);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 24px;
  }

  .mod-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .mod-main {
    padding: 24px 16px 32px;
  }

  .mod-two-col {
    grid-template-columns: minmax(0, 1fr);
  }

  .mod-contact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
