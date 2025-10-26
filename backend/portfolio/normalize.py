# portfolio/normalize.py
import re
from typing import Any, Dict, List, Tuple, Optional

SPACE_FIXES = [
    # common ligatures/symbols
    (r"–|—|−", "-"),
    (r"•|▪|‣|●|■|\*", ""),   # bullet marks
    (r"\s{2,}", " "),
]

URL_FIX = re.compile(r"\s")
PHONE_CLEAN = re.compile(r"[^\d+]")

YEAR_RANGE = re.compile(r"(?i)(19|20)\d{2}.*?(19|20)\d{2}|(19|20)\d{2}\s*[-–—]\s*present")
JUST_YEAR = re.compile(r"(19|20)\d{2}")

def _s(text: Optional[str]) -> str:
    return (text or "").strip()

def normalize_whitespace(text: str) -> str:
    t = text
    # remove weird joins: e.g., "B.S.inInformatics" -> "B.S. in Informatics"
    t = re.sub(r"([A-Za-z])([A-Z][a-z])", r"\1 \2", t)
    t = t.replace("inIn", " in In")
    for pat, repl in SPACE_FIXES:
        t = re.sub(pat, repl, t)
    return t.strip()

def clean_url(url: str) -> str:
    url = normalize_whitespace(url)
    url = URL_FIX.sub("", url)
    if url and not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url

def clean_email(raw: str) -> str:
    # handle "email|linkedin" or similar merges
    email = raw.split("|", 1)[0]
    email = normalize_whitespace(email)
    return email

def clean_phone(raw: str) -> str:
    p = PHONE_CLEAN.sub("", raw or "")
    # keep basic + and digits, require at least 10 digits to be useful
    return p if len(re.sub(r"\D", "", p)) >= 10 else ""

def split_bullets(text: str) -> List[str]:
    if not text:
        return []
    # split on bullets or line breaks
    parts = re.split(r"(?:\n|\r|\u2022|•|- |\* )+", text)
    out = []
    for p in parts:
        p = normalize_whitespace(p)
        if len(p) >= 3:
            out.append(p)
    return out

def parse_years(s: str) -> Tuple[Optional[int], Optional[int], bool]:
    if not s:
        return (None, None, False)
    s_norm = normalize_whitespace(s.lower())
    is_current = "present" in s_norm or "current" in s_norm
    ys = JUST_YEAR.findall(s_norm)
    start, end = (None, None)
    if ys:
        try:
            start = int(ys[0])
            if len(ys) > 1:
                end = int(ys[1])
        except:
            pass
    return (start, end, is_current)

def clean_skills(raw_list: Any) -> List[str]:
    if isinstance(raw_list, list):
        items = raw_list
    elif isinstance(raw_list, str):
        items = re.split(r"[,\|/;]", raw_list)
    else:
        items = []

    out = []
    for it in items:
        it = normalize_whitespace(it)
        # remove prefixes like "Libraries:" "Data Science/ML:"
        it = re.sub(r"(?i)^(libraries|frameworks|tools|languages|data science/ml)\s*:\s*", "", it)
        # drop empties and too short
        if 2 <= len(it) <= 50:
            out.append(it)
    # dedupe preserving order
    seen = set()
    uniq = []
    for s in out:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            uniq.append(s)
    return uniq

def clean_structured(d: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(d, dict):
        return {}

    name = normalize_whitespace(_s(d.get("name")))
    email = clean_email(_s(d.get("email")))
    phone = clean_phone(_s(d.get("phone")))
    linkedin = clean_url(_s(d.get("linkedin"))) if _s(d.get("linkedin")) else ""
    github = clean_url(_s(d.get("github"))) if _s(d.get("github")) else ""

    # education: split long lines & trim junk
    education = []
    for e in d.get("education", []) or []:
        degree = normalize_whitespace(_s(e.get("degree")))
        institution = normalize_whitespace(_s(e.get("institution")))
        year = normalize_whitespace(_s(e.get("year")))
        gpa = normalize_whitespace(_s(e.get("gpa")))
        # skip meaningless lines
        if len(degree) < 4 and len(institution) < 4:
            continue
        education.append({
            "degree": degree[:200],
            "institution": institution[:200],
            "year": year[:50],
            "gpa": gpa[:20],
        })

    # experience: fix company/role swaps; strip bullet noise
    experience = []
    for e in d.get("experience", []) or []:
        company = normalize_whitespace(_s(e.get("company")))
        role = normalize_whitespace(_s(e.get("role")))
        role_summary = " ".join(split_bullets(_s(e.get("role_summary"))))[:2000]
        years = normalize_whitespace(_s(e.get("years")))
        # heuristic: if company starts with "•" or looks like a sentence, swap
        if len(company.split()) > 8 and len(role.split()) < 8:
            company, role = role, company
        if len(company) < 2 and len(role) < 2 and not role_summary:
            continue
        experience.append({
            "company": company[:200],
            "role": role[:200],
            "years": years[:100],
            "role_summary": role_summary,
        })

    # projects: move date blobs out of title, collapse bullets in description
    projects = []
    for p in d.get("projects", []) or []:
        title = normalize_whitespace(_s(p.get("title")))
        description = " ".join(split_bullets(_s(p.get("description"))))[:2000]
        techs = p.get("technologies") or []
        title = re.sub(r"\b(19|20)\d{2}[^A-Za-z]*\b.*$", "", title).strip()
        if len(title) < 2 and not description:
            continue
        projects.append({
            "title": title[:200],
            "description": description,
            "technologies": clean_skills(techs),
        })

    skills = clean_skills(d.get("skills", []))
    extracurriculars = [normalize_whitespace(x) for x in d.get("extracurriculars", []) or [] if len(normalize_whitespace(x)) >= 5][:50]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "education": education[:12],
        "experience": experience[:20],
        "projects": projects[:20],
        "skills": skills[:60],
        "extracurriculars": extracurriculars,
    }
