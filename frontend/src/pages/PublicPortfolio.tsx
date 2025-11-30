// src/pages/PublicPortfolio.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicBySlug, getTemplate } from "../api/mock";
import ClassicRenderer from "../renderers/classic";
import { PortfolioDraft } from "../types/portfolio";

const PublicPortfolio: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [draft, setDraft] = useState<PortfolioDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      if (!slug) {
        setError("Missing slug.");
        setLoading(false);
        return;
      }

      try {
        const d = await getPublicBySlug(slug);
        if (!d) {
          setError("Portfolio not found or not published.");
          setLoading(false);
          return;
        }
        setDraft(d);

        const tpl = await getTemplate(d.template_key || "classic");
        setTheme(tpl?.default_theme || {});
      } catch (e) {
        console.error(e);
        setError("Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>Loading…</div>
    );
  }

  if (error || !draft) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        {error || "Portfolio not found."}
      </div>
    );
  }


  return (
    <ClassicRenderer
      data={draft.data || {}}
      theme={theme}
    />
  );
};

export default PublicPortfolio;
