import { useEffect, useState } from "react";
import { listTemplates } from "../api/mock";
import { TemplateDTO } from "../types/portfolio";

export default function TemplateGallery() {
  const [items, setItems] = useState<TemplateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listTemplates().then(setItems).catch(e=>setErr(String(e))).finally(()=>setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading templates…</div>;
  if (err) return <div className="p-8 text-red-600">Error: {err}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Choose a Template</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(t => (
          <div key={t.key} className="rounded-2xl shadow p-5 bg-white">
            {t.preview_image ? <img src={t.preview_image} alt={t.name} className="rounded-xl mb-3" /> : <div className="h-32 rounded-xl bg-gray-100 mb-3" />}
            <h2 className="text-xl font-semibold">{t.name}</h2>
            <p className="text-sm text-gray-600 mb-4">{t.description}</p>
            <button
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
              onClick={() => window.location.assign(`/editor?template=${t.key}`)}
            >
              Use {t.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
