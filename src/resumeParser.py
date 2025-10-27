import pdfplumber
import re

def extract_phone_numbers(text):
    # Regex to capture all common phone formats
    phone_pattern = re.compile(
        r'(\+?\d{1,3}[\s-]?)?'        # optional country code
        r'(\(?\d{3}\)?[\s.-]?)'       # area code (with/without brackets)
        r'\d{3}[\s.-]?\d{4}',         # local number
        re.IGNORECASE
    )
    
    matches = phone_pattern.findall(text)
    # `findall` returns tuples because of groups → join them
    raw_numbers = ["".join(m) for m in matches]
    
    # Normalize → keep only digits
    clean_numbers = ["".join(re.findall(r'\d+', num)) for num in raw_numbers]
    
    # Remove duplicates
    clean_numbers = list(set(clean_numbers))
    
    return clean_numbers
    
def extract_basic_info(text):
    info = {}
    # Name (heuristic: first line, but can refine with NLP later)
    lines = text.strip().split("\n")
    info["name"] = lines[0].strip()

    # Phone (Indian & US formats)
    #phone_pattern = re.compile(r'(\+?\d{1,3}?[-.\s]??\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})')
    phone_pattern = re.compile(
        r'(\+?\d{1,3}[\s-]?)?'        # optional country code
        r'(\(?\d{3}\)?[\s.-]?)'       # area code (with/without brackets)
        r'\d{3}[\s.-]?\d{4}',         # local number
        re.IGNORECASE
    )
    for line in lines:
        match = phone_pattern.search(line)
        if match:
            info["phone"] = match.group()
            break  
        else:
            info["phone"]  = ""

    # Email
    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    match = email_pattern.search(text)
    info["email"] = match.group() if match else ""

    # LinkedIn
    linkedin_pattern = re.compile(r'(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9_\-\/.]+', re.IGNORECASE)
    match = linkedin_pattern.search(text)
    info["linkedin"] = match.group() if match else ""

    # GitHub
    github_pattern = re.compile(r'(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_\-\/.]+', re.IGNORECASE)
    match = github_pattern.search(text)
    info["github"] = match.group() if match else ""

    return info


def extractTextWithPdfPlumber(doc):
    with pdfplumber.open(doc) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
            #print(text)
    return text

def parser(doc):
    extractedText  = extractTextWithPdfPlumber(doc)
    info = extract_basic_info(extractedText)
    print(info)


if __name__ =="__main__":
    sample_resume ="test/sampleResumes/RahasyaBarkurResume.pdf"
    print("Running resume parser with pdf plumber")
    parser(sample_resume)