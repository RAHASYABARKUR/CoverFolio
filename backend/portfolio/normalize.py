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

import re

MONTH_MAP = {
    "jan": "January",
    "feb": "February",
    "mar": "March",
    "apr": "April",
    "may": "May",
    "jun": "June",
    "jul": "July",
    "aug": "August",
    "sep": "September",
    "sept": "September",
    "oct": "October",
    "nov": "November",
    "dec": "December",
}

# Matches: Aug 2019 – May 2023, September ’21 – Present, etc.
MONTH_YEAR_RANGE = re.compile(
    r"(?i)"
    r"((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)"   # month1
    r"\s*['’]?\s*"
    r"(\d{2,4})"                                                       # year1 (2 or 4 digits)
    r"\s*[-–—]\s*"
    r"((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*)"   # month2
    r"\s*['’]?\s*"
    r"(\d{2,4}|present)"                                               # year2
)


# Matches: 2019 – 2023, 2017-present, 2020–, 2021 - Present
YEAR_RANGE = re.compile(
    r"(?i)"
    r"(19|20)\d{2}"
    r"\s*[-–—]\s*"
    r"((19|20)\d{2}|present)?"
)

# Matches: 2019, 2020, etc.
JUST_YEAR = re.compile(r"(19|20)\d{2}")


def _fix_short_years(s: str):
    """Converts ’24 or '24 into 2024."""
    return re.sub(r"['’](\d{2})", lambda m: "20" + m.group(1), s)


def parse_years(s: str):
    if not s:
        return (None, None, False)

    s_norm = s.lower().strip()
    s_norm = s_norm.replace("’", "'")

    # Convert short years ('24 → 2024)
    s_norm = re.sub(r"'\s*(\d{2})", lambda m: "20" + m.group(1), s_norm)

    # ---------- 1. MONTH + YEAR RANGE ----------
    m = MONTH_YEAR_RANGE.search(s_norm)
    if m:
        month1_raw, _, year1_raw, month2_raw, _, year2_raw = m.groups()

        # Normalize months
        month1 = MONTH_MAP[month1_raw[:3]]
        month2 = MONTH_MAP[month2_raw[:3]]

        # Normalize years
        year1 = int(year1_raw) if len(year1_raw) == 4 else int("20" + year1_raw)
        if year2_raw == "present":
            return (f"{month1} {year1}", None, True)

        year2 = int(year2_raw) if len(year2_raw) == 4 else int("20" + year2_raw)

        print("Parsed month-year range:", month1, year1, month2, year2, "from", s)
        return (f"{month1} {year1}", f"{month2} {year2}", False)

    # ---------- 2. YEAR RANGE ----------
    m = YEAR_RANGE.search(s_norm)
    if m:
        y1_raw = m.group(1)
        y2_raw = m.group(2)

        start = int(y1_raw)

        if not y2_raw:
            return (str(start), None, False)
        if y2_raw == "present":
            return (str(start), None, True)
        print("Parsed year range:", start, y2_raw, "from", s)
        return (str(start), str(int(y2_raw)), False)

    # ---------- 3. SINGLE YEAR ----------
    ys = JUST_YEAR.findall(s_norm)
    if ys:
        return (ys[0], None, False)

    return (None, None, False)


# YEAR_RANGE = re.compile(
#     r"(?i)"
#     r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)?\.?\s*"
#     r"(19|20)\d{2}"
#     r"\s*[-–—]\s*"
#     r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present)?\.?\s*"
#     r"((?:19|20)\d{2}|present)"
# )
# JUST_YEAR = re.compile(r"(?:19|20)\d{2}")

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

# def parse_years(s: str) -> Tuple[Optional[int], Optional[int], bool]:
#     if not s:
#         return (None, None, False)
#     s_norm = normalize_whitespace(s.lower())
#     s_norm = s.replace("’", "'").replace("‘", "'")
#     # Convert 2-digit years like '24 or ’24 -> 2024
#     s_norm = re.sub(r"['’](\d{2})", lambda m: "20" + m.group(1), s_norm)
#     is_current = "present" in s_norm or "current" in s_norm
#     ys = JUST_YEAR.findall(s_norm)
#     start, end = (None, None)
#     if ys:
#         try:
#             start = int(ys[0])
#             if len(ys) > 1:
#                 end = int(ys[1])
#         except:
#             pass
#     print("Parsed years from '{}': start={}, end={}, is_current={}".format(s, start, end, is_current))
#     return (start, end, is_current)

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
        start, end, is_current = parse_years(year)
        # skip meaningless lines
        if len(degree) < 4 and len(institution) < 4:
            continue
        education.append({
            "degree": degree[:200],
            "institution": institution[:200],
            "year": year[:50],
            "gpa": gpa[:20],
            "start_date": start,
            "end_date" : end,
            "is_current": is_current
        })

    # experience: fix company/role swaps; strip bullet noise
    experience = []
    for e in d.get("experience", []) or []:
        company = normalize_whitespace(_s(e.get("company")))
        role = normalize_whitespace(_s(e.get("role")))
        role_summary = " ".join(split_bullets(_s(e.get("role_summary"))))[:2000]
        years = normalize_whitespace(_s(e.get("years")))
        start, end, is_current = parse_years(years)

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
            "start_date": start,
            "end_date": end,
            "is_current": is_current
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
