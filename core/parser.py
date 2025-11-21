import fitz  # PyMuPDF
import json
import logging
from config import gemini_model

log = logging.getLogger(__name__)

def extract_pdf_data(file_bytes: bytes) -> dict:
    """Extracts visual text AND hidden hyperlink annotations."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    extracted_links = []

    for page in doc:
        full_text += page.get_text() + "\n"
        # Iterate over links (URI kind)
        for link in page.get_links():
            if link["kind"] == fitz.LINK_URI:
                # Grab text under the link for context
                link_rect = link["from"]
                link_text = page.get_text(clip=link_rect).strip().replace("\n", " ")
                extracted_links.append({
                    "text_label": link_text,
                    "url": link["uri"]
                })

    return {"text": full_text, "links": extracted_links}

def parse_resume_to_json(file_bytes: bytes) -> dict:
    raw_data = extract_pdf_data(file_bytes)
    
    # The Prompt: Flexible capture
    prompt = f"""
    You are a resume parser. Convert the text and links below into valid JSON.
    
    RULES:
    1. Map 'links' to the correct JSON fields (linkedin, github, projects.link).
    2. If a link label matches a project name, assign that URL to the project.
    3. **PROJECTS:** Capture the content however it appears. 
       - If it's a list of points, put them in "bullets". 
       - If it's a paragraph, put it in "description".
       - DO NOT leave both empty.
    4. Output JSON ONLY.

    STRUCTURE:
    {{
      "personal_info": {{ "name": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "", "location": "" }},
      "summary": "",
      "skills": {{ "languages": [], "frameworks": [], "tools": [] }},
      "experience": [ {{ "company": "", "role": "", "dates": "", "bullets": [] }} ],
      "projects": [ {{ "name": "", "link": "", "description": "raw text", "bullets": ["list item"], "technologies": [] }} ],
      "education": [ {{ "institution": "", "degree": "", "dates": "" }} ]
    }}

    --- RESUME TEXT ---
    {raw_data['text']}
    
    --- HYPERLINKS ---
    {json.dumps(raw_data['links'])}
    """

    try:
        response = gemini_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        log.error(f"AI Parse Error: {e}")
        raise ValueError("Failed to parse resume structure")