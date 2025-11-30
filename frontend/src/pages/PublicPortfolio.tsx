// frontend/src/pages/PublicPortfolio.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicBySlug, getTemplate } from "../api/mock";
import ClassicRenderer from "../renderers/classic";
import ModernRenderer from "../renderers/modern";
import { PortfolioDraft, TemplateDTO } from "../types/portfolio";

const PublicPortfolio: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [draft, setDraft] = useState<PortfolioDraft | null>(null);
  const [tpl, setTpl] = useState<TemplateDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // load published draft by slug
  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      if (!slug) {
        setDraft(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const d = await getPublicBySlug(slug);
      if (!cancelled) {
        setDraft(d ?? null);
        setLoading(false);
      }
    }

    loadDraft();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // load template definition to get default theme
  useEffect(() => {
    if (!draft?.template_key) {
      setTpl(null);
      return;
    }
    getTemplate(draft.template_key).then((t) => setTpl(t ?? null));
  }, [draft?.template_key]);

  const theme = useMemo(
    () => ({
      ...(tpl?.default_theme || {}),
      ...(draft?.theme_overrides || {}),
    }),
    [tpl, draft]
  );

  if (loading) {
    return (
      <div style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  if (!draft) {
    return (
      <div
        style={{
          padding: 32,
          fontFamily: "system-ui, sans-serif",
          color: "#dc2626",
        }}
      >
        Portfolio not found or not published.
      </div>
    );
  }

  // 👉 Choose renderer based on template_key
  const Renderer =
    draft.template_key === "modern" ? ModernRenderer : ClassicRenderer;

  return (
    <div style={{ margin: 0, minHeight: "100vh" }}>
      <Renderer data={draft.data} theme={theme} />
    </div>
  );
};

export default PublicPortfolio;
