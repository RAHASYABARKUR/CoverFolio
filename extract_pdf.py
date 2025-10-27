import pdfplumber
import sys

def extract_pdf_text(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    pdf_path = "Group_9_Compsci520.pdf"
    text = extract_pdf_text(pdf_path)
    if text:
        # Write to file to avoid encoding issues
        with open("extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Text extracted and saved to extracted_text.txt")
        print("First 500 characters:")
        print(text[:500])
    else:
        print("Failed to extract text")
