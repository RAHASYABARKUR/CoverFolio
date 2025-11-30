import { MOCK_TEMPLATES } from "../mocks/templates";
import { PortfolioDraft, TemplateDTO } from "../types/portfolio";

const LS_KEY = "coverfolio.portfolios";

function loadDrafts(): PortfolioDraft[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDrafts(drafts: PortfolioDraft[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(drafts));
}

export async function listTemplates(): Promise<TemplateDTO[]> {
  return MOCK_TEMPLATES;
}

export async function getTemplate(
  key: string
): Promise<TemplateDTO | undefined> {
  return MOCK_TEMPLATES.find((t) => t.key === key);
}

export async function createDraft(
  d: Omit<PortfolioDraft, "id" | "created_at" | "updated_at">
): Promise<PortfolioDraft> {
  const now = new Date().toISOString();
  const draft: PortfolioDraft = {
    id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    ...d,
  };
  const drafts = loadDrafts();
  drafts.push(draft);
  saveDrafts(drafts);
  return draft;
}

export async function updateDraft(
  id: string,
  patch: Partial<PortfolioDraft>
): Promise<PortfolioDraft> {
  const drafts = loadDrafts();
  const i = drafts.findIndex((x) => x.id === id);
  if (i < 0) throw new Error("draft not found");

  drafts[i] = {
    ...drafts[i],
    ...patch,
    updated_at: new Date().toISOString(),
  };

  saveDrafts(drafts);
  return drafts[i];
}

export async function getDraft(
  id: string
): Promise<PortfolioDraft | undefined> {
  return loadDrafts().find((x) => x.id === id);
}

/**
 * "Publishes" a draft locally:
 *  - sets is_published = true
 *  - generates a unique slug used by /p/:slug
 */
export async function publishDraft(id: string): Promise<PortfolioDraft> {
  const d = await getDraft(id);
  if (!d) throw new Error("draft not found");

  const slugBase = (d.title || "portfolio")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$|--+/g, "-");


  const slug = `${slugBase}-${id.slice(0, 6)}`;

  return updateDraft(id, {
    is_published: true,
    slug,
  });
}

export async function listDrafts(): Promise<PortfolioDraft[]> {
  return loadDrafts().sort((a, b) =>
    b.updated_at > a.updated_at ? 1 : -1
  );
}

/** Fetch a *published* draft by slug (used by the public route). */
export async function getPublicBySlug(
  slug: string
): Promise<PortfolioDraft | undefined> {
  const drafts = loadDrafts();

  // 1) Preferred: look up by slug AND published flag
  let d = drafts.find(
    (x) => x.slug === slug && x.is_published
  );
  if (d) return d;

  // 2) Fallback for local usage: allow direct ID even if not published
  d = drafts.find((x) => x.id === slug);
  return d;
}

