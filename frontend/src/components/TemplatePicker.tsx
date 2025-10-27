import { useEffect, useState } from "react";
import { listTemplates } from "../api/mock";
import type { TemplateDTO } from "../types/portfolio";

type Props = {
  value?: string;
  onChange: (templateKey: string) => void;
  compact?: boolean;
};

export default function TemplatePicker({ value, onChange, compact }: Props) {
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => { listTemplates().then(setTemplates); }, []);
  const selected = templates.find(t => t.key === value);

  if (compact && selected) {
    return (
      <div className="rounded-2xl border p-4 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Template</div>
            <div className="font-semibold">{selected.name}</div>
            <div className="text-xs text-gray-500">{selected.description}</div>
          </div>
          <button className="px-3 py-2 rounded-xl border" onClick={()=>setOpen(true)}>Change</button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={()=>setOpen(false)}>
            <div className="bg-white rounded-2xl p-6 w-[720px] max-w-[92vw]" onClick={e=>e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Choose a template</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(t => (
                  <button
                    key={t.key}
                    className={`rounded-xl border p-4 text-left hover:shadow ${t.key===value ? "ring-2 ring-indigo-500" : ""}`}
                    onClick={()=>{ onChange(t.key); setOpen(false); }}
                  >
                    <div className="h-28 bg-gray-100 rounded-md mb-3" />
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.description}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button className="px-3 py-2 rounded-xl border" onClick={()=>setOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5 bg-white">
      <h3 className="text-lg font-semibold mb-3">Choose a template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <button
            key={t.key}
            className={`rounded-xl border p-4 text-left hover:shadow ${t.key===value ? "ring-2 ring-indigo-500" : ""}`}
            onClick={()=>onChange(t.key)}
          >
            <div className="h-28 bg-gray-100 rounded-md mb-3" />
            <div className="font-medium">{t.name}</div>
            <div className="text-xs text-gray-500">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
