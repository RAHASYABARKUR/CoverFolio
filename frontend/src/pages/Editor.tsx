import { useEffect, useMemo, useState } from "react";
import { getTemplate, createDraft, updateDraft } from "../api/mock";
import ClassicRenderer from "../renderers/classic";

export default function Editor() {
  const qs = new URLSearchParams(window.location.search);
  const templateKey = qs.get("template") || "classic";
  const draftId = qs.get("id") || ""; // edit

  const [tpl, setTpl] = useState<any>(null);
  const [title, setTitle] = useState("My Portfolio");
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<Record<string,string>>({});

  useEffect(()=>{ getTemplate(templateKey).then(setTpl); },[templateKey]);

  const resolvedTheme = useMemo(
    () => ({...(tpl?.default_theme||{}), ...(theme||{})}),
    [tpl, theme]
  );

  async function saveDraft() {
    if (!tpl) return;
    const payload = { title, template_key: templateKey, data, theme_overrides: theme };
    let saved;
    if (draftId) saved = await updateDraft(draftId, payload);
    else saved = await createDraft(payload);
    window.history.replaceState(null,"",`/editor?template=${templateKey}&id=${saved.id}`);
    alert("Saved!");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Editor — {tpl?.name || "…"}</h1>

        <div className="rounded-2xl p-4 border">
          <label className="block text-sm mb-1">Title</label>
          <input className="border p-2 w-full mb-2" value={title} onChange={e=>setTitle(e.target.value)} />
          <h2 className="font-semibold mb-2">About</h2>
          <input className="border p-2 w-full mb-2" placeholder="Name"
            value={data?.about?.name || ""} onChange={e=>setData((d:any)=>({ ...d, about:{...d?.about, name:e.target.value}}))}/>
          <input className="border p-2 w-full" placeholder="Headline"
            value={data?.about?.headline || ""} onChange={e=>setData((d:any)=>({ ...d, about:{...d?.about, headline:e.target.value}}))}/>
        </div>

        <div className="rounded-2xl p-4 border">
          <h2 className="font-semibold mb-2">Theme</h2>
          <label className="block text-sm">Accent color</label>
          <input type="color" value={resolvedTheme["--accent"]} onChange={e=>setTheme(t=>({...t, ["--accent"]: e.target.value}))}/>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white" onClick={saveDraft}>Save Draft</button>
          <button className="px-4 py-2 rounded-xl border" onClick={()=>alert("Will publish in F4")}>Publish</button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-auto">
        <ClassicRenderer data={data} theme={resolvedTheme}/>
      </div>
    </div>
  );
}
