type Props = { data:any; theme:Record<string,string> };

export default function ClassicRenderer({ data, theme }: Props) {
  const cssVars = Object.entries(theme).reduce((acc,[k,v]) => ({...acc, [k]:v}), {});
  const about = data?.about || {};
  const projects = data?.projects || [];
  const experience = data?.experience || [];
  const skills = data?.skills?.items || [];

  return (
    <div style={cssVars as React.CSSProperties} className="min-h-screen" >
      <div className="max-w-4xl mx-auto p-8" style={{ color: "var(--fg)", background: "var(--bg)" }}>
        <h1 className="text-4xl font-bold">{about.name || "Your Name"}</h1>
        <p className="opacity-80">{about.headline || "Headline"}</p>

        {!!experience.length && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold" style={{color:"var(--accent)"}}>Experience</h2>
            <div className="mt-3 space-y-3">
              {experience.map((e:any,i:number)=>(
                <div key={i} className="p-4 rounded-xl border border-gray-200">
                  <div className="font-medium">{e.role} • {e.company}</div>
                  <div className="text-sm opacity-70">{e.start} – {e.end || "Present"}</div>
                  <p className="text-sm mt-2">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!projects.length && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold" style={{color:"var(--accent)"}}>Projects</h2>
            <ul className="list-disc pl-6 mt-3">
              {projects.map((p:any,i:number)=>(<li key={i}><a href={p.link}>{p.name}</a> — {p.summary}</li>))}
            </ul>
          </section>
        )}

        {!!skills.length && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold" style={{color:"var(--accent)"}}>Skills</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((s:string,i:number)=>(<span key={i} className="px-3 py-1 rounded-full border">{s}</span>))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
