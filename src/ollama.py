#!/usr/bin/env python3

import pdfplumber
import subprocess
import json
import argparse
import shutil
import sys
import re
from typing import Optional

def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for p in pdf.pages:
                page_text = p.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def call_ollama(prompt: str, model: str, timeout: int = 600) -> str:
    """Call Ollama safely on Windows with UTF-8 decoding."""
    import subprocess, shutil

    if shutil.which("ollama") is None:
        raise FileNotFoundError("❌ Ollama CLI not found in PATH. Please install from https://ollama.com/download")

    try:
        proc = subprocess.run(
            ["ollama", "run", model],
            input=prompt.encode("utf-8"),
            capture_output=True,
            timeout=timeout
        )
    except subprocess.TimeoutExpired as e:
        raise RuntimeError(f"Ollama run timed out after {timeout} seconds") from e

    if proc.returncode != 0:
        raise RuntimeError(
            f"Ollama exited with code {proc.returncode}\nSTDERR:\n{proc.stderr.decode('utf-8', errors='ignore')}"
        )

    # ✅ decode stdout safely as UTF-8
    return proc.stdout.decode("utf-8", errors="ignore")

def extract_json_from_text(text: str) -> Optional[str]:
    """Try multiple strategies to extract a JSON object from model output."""
    if not text:
        return None

    # 1) fenced ```json ... ```
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, flags=re.DOTALL)
    if m:
        return m.group(1).strip()

    # 2) fenced ``` ... ``` with curly braces inside
    m2 = re.search(r"```(?:[\s\S]*?)\n(\{[\s\S]*\})\s*```", text, flags=re.DOTALL)
    if m2:
        return m2.group(1).strip()

    # 3) First balanced JSON object starting at first '{'
    start = text.find('{')
    if start == -1:
        return None

    brace_count = 0
    in_string = False
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if ch == '"' and not escape:
            in_string = not in_string
        if ch == '\\' and not escape:
            escape = True
            continue
        else:
            escape = False
        if not in_string:
            if ch == '{':
                brace_count += 1
            elif ch == '}':
                brace_count -= 1
                if brace_count == 0:
                    candidate = text[start:i+1]
                    return candidate.strip()
    return None

def parse_resume_json(resume_text: str, model: str, timeout:int=180) -> Optional[dict]:
    prompt = f"""You are a resume parser. Extract all information from the resume and output ONLY valid JSON. Return only valid JSON (no extra commentary). Use null for missing fields.

    Fill this JSON schema:

    {{
        "Name": null,
        "Email": null,
        "Phone": null,
        "LinkedIn": null,
        "GitHub": null,
        "Education": [
            {{"Degree": null, "Institution": null, "Year": null, "GPA": null}}
        ],
        "Experience": [
            {{"Company": null, "Role": null, "Years": null, "Role Summary": null}}
        ],
        "Projects": [
            {{"Title": null, "Description": null, "Technologies": []}}
        ],
        "Skills": [],
        "Extracurriculars": []
    }}

    Resume Text:
    {resume_text}
    """
    raw = call_ollama(prompt, model=model, timeout=timeout)
    json_text = extract_json_from_text(raw)

    if not json_text:
        print("⚠️ Could not find JSON in model output. Full model output below for debugging:\n")
        print(raw)
        return None

    try:
        return json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON parse error: {e}. Attempting small cleanup (trailing commas)...")
        cleaned = re.sub(r",\s*(\}|])", r"\1", json_text)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print("❌ Still failed to parse JSON after cleanup. Showing cleaned candidate for debugging:")
            print(cleaned[:10000])
            return None

def main():
    parser = argparse.ArgumentParser(description="Resume parser using Ollama local model (CPU)")
    #parser.add_argument("--pdf", "-p", required=True, help="Path to resume PDF")
    parser.add_argument("--pdf", "-p", default="test/sampleResumes/Nipun_Agarwalla_Resume.pdf", help="Path to resume PDF")
    parser.add_argument("--model", "-m", default="llama3", help="Ollama model name (default: llama3)")
    parser.add_argument("--out", "-o", default="parsed_resume_llama3.json", help="Output JSON file")
    parser.add_argument("--timeout", "-t", type=int, default=18000, help="Timeout seconds for Ollama call")
    args = parser.parse_args()

    print("Reading PDF:", args.pdf)
    resume_text = extract_text_from_pdf(args.pdf)
    if not resume_text.strip():
        print("⚠️ No text extracted from PDF. Check if the PDF is image-only or protected.")
        sys.exit(1)

    print(f"Calling Ollama model: {args.model} (timeout {args.timeout}s)")
    try:
        parsed = parse_resume_json(resume_text, model=args.model, timeout=args.timeout)
    except Exception as e:
        print(f"❌ Failed to call model or parse output: {e}")
        sys.exit(1)

    if parsed is None:
        print("❌ Parsing returned no valid JSON. See debug output above.")
        sys.exit(1)

    with open(args.pdf.split("/")[-1].split(".")[0]+"_parsed.json", "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=4, ensure_ascii=False)
    print("✅ Parsed JSON written to", args.out)

if __name__ == "__main__":
    main()
