import pdfplumber
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json
from typing import List, Dict, Any
import time

MODEL_NAME = "meta-llama/Llama-3.2-3B-Instruct"

# --- Load LLaMA ---
def load_llama(model_name=MODEL_NAME):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Set pad_token if not set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        device_map="auto",
        dtype=torch.float16,  # Use 'dtype' instead of deprecated 'torch_dtype'
        low_cpu_mem_usage=True
    )
    return tokenizer, model

# --- Extract text from PDF ---
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# --- Parse resume with LLaMA ---
def parse_resume_llama_text(resume_text):
    print("Loading LLaMA model...")
    tokenizer, model = load_llama()
    print(f"Model loaded on device: {model.device}")
    print(f"Model dtype: {model.dtype}")

    system_message = {
        "role": "system",
        "content": "You are a resume parser. Extract all information from the resume and output ONLY valid JSON."
    }

    user_message = {
        "role": "user",
        "content": f"""
Fill in the following JSON schema using information from the resume below. 
Replace all placeholders with actual data. If information is missing, use null.
Return only valid JSON.

{{
    "name": "FILL_HERE",
    "email": "FILL_HERE",
    "phone": "FILL_HERE",
    "linkedin": "FILL_HERE",
    "github": "FILL_HERE",
    "education": [
        {{"degree": "FILL_HERE", "institution": "FILL_HERE", "year": "FILL_HERE","gpa": "FILL_HERE"}}
    ],
    "experience": [
        {{"company": "FILL_HERE", "role": "FILL_HERE", "years": "FILL_HERE", "role_summary": "FILL_HERE"}}
    ],
    "projects": [
        {{"title": "FILL_HERE", "description": "FILL_HERE", "technologies": []}}
    ],
    "skills": ["FILL_HERE"],
    "extracurriculars": ["FILL_HERE"]
}}

Resume Text:
{resume_text}
"""
    }

    prompt = system_message["content"] + "\n\n" + user_message["content"]

    # Tokenize input
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=2048)
    print(f"Input tokens: {inputs['input_ids'].shape}")
    
    # Move inputs to the same device as model
    inputs = {k: v.to(model.device) for k, v in inputs.items()}
    
    # Generate with safe parameters - using greedy decoding to avoid probability issues
    print("Generating response...")
    try:
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=2000,
                do_sample=False,  # Use greedy decoding instead of sampling
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
                repetition_penalty=1.1
            )
        print("Generation completed successfully")
    except Exception as e:
        print(f"Error during generation: {str(e)}")
        print(f"Error type: {type(e)}")
        raise
    
    # Decode output
    output = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # --- Updated extraction logic ---
    start_marker = "```json"
    end_marker = "```"

    start = output.find(start_marker)
    end = output.find(end_marker, start + len(start_marker))
    json_text = output[start+8:end]

    try:
        data = json.loads(json_text)
    except json.JSONDecodeError:
        print("⚠️ Failed to parse JSON. Returning raw output")
        print(output)
        print("JSON")
        print(json_text)
        return None

    return data

def parse_resume_llama(pdf_path: str, model_id: str = "meta-llama/Llama-3.2-3B-Instruct") -> Dict[str, Any]:
    # with open('C:\\Users\\rbOut\\OneDrive\\Documents\\MSCS\\520\\CoverFolio\\backend\\resume_parser\\parsed_resume.json') as json_data:
    #     d = json.load(json_data)
    # return d
    resume_text = extract_text_from_pdf(pdf_path)

    if not resume_text.strip():
        print("⚠️ No text extracted from PDF. Check PDF format.")
    else:
        start = time.time()
        parsed_data = parse_resume_llama_text(resume_text)
        print("Time taken to parse resume ",time.time()-start)
        return parsed_data
# --- Main ---
if __name__ == "__main__":
    pdf_path = "RahasyaBarkurResume.pdf"  # replace with your PDF path
    output_file = "parsed_resume.json"

    resume_text = extract_text_from_pdf(pdf_path)

    if not resume_text.strip():
        print("⚠️ No text extracted from PDF. Check PDF format.")
    else:
        parsed_data = parse_resume_llama(resume_text)
        if parsed_data:
            # Save only JSON to file
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(parsed_data, f, indent=4)
            print(f"✅ Parsed JSON saved to {output_file}")