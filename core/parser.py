import fitz  # PyMuPDF
import json
import logging
import time
import random
from google.api_core import exceptions
from config import gemini_model

log = logging.getLogger(__name__)

def extract_text_with_inline_links(file_bytes: bytes) -> str:
    """
    Extracts text and associates links using a Weighted Proximity Metric.
    It heavily penalizes vertical misalignment to prevent links from 'drifting'
    to the line above or below.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""

    for page in doc:
        links = page.get_links()
        # Get text blocks: (x0, y0, x1, y1, "text", ...)
        blocks = page.get_text("blocks")
        
        # Map: block_index -> list of URLs
        block_to_links = {i: set() for i in range(len(blocks))}
        
        for link in links:
            if link["kind"] != fitz.LINK_URI:
                continue
            
            # Link geometry
            lx0, ly0, lx1, ly1 = link["from"]
            l_y_mid = (ly0 + ly1) / 2
            l_x_mid = (lx0 + lx1) / 2
            
            best_block_idx = -1
            min_score = float('inf')
            
            for i, b in enumerate(blocks):
                bx0, by0, bx1, by1, text, _, _ = b
                b_y_mid = (by0 + by1) / 2
                
                # 1. Calculate Vertical Distance (dy)
                # Distance from link's vertical center to the block's vertical range
                if l_y_mid < by0:
                    dy = by0 - l_y_mid
                elif l_y_mid > by1:
                    dy = l_y_mid - by1
                else:
                    dy = 0 # It's inside the vertical band
                
                # 2. Calculate Horizontal Distance (dx)
                if lx1 < bx0:     # Link is left of text
                    dx = bx0 - lx1
                elif lx0 > bx1:   # Link is right of text
                    dx = lx0 - bx1
                else:             # Link overlaps text horizontally
                    dx = 0
                
                # 3. Strict Vertical Limit
                # If the link is more than 15pts away vertically, it likely belongs to another line.
                if dy > 15:
                    continue

                # 4. Weighted Score
                # We penalize vertical distance heavily (x50) so links stay on their own line.
                # We penalize horizontal distance lightly so icons next to titles are caught.
                score = dx + (dy * 50)
                
                if score < min_score:
                    min_score = score
                    best_block_idx = i
            
            # Attach link to the winner
            if best_block_idx != -1:
                block_to_links[best_block_idx].add(link["uri"])

        # Reconstruct text
        # Sort blocks by vertical position (reading order)
        indexed_blocks = list(enumerate(blocks))
        indexed_blocks.sort(key=lambda x: x[1][1]) 
        
        for original_idx, b in indexed_blocks:
            text = b[4].strip()
            if not text: continue
            
            # Append links to the text line
            urls = sorted(list(block_to_links[original_idx]))
            for url in urls:
                text += f" [LINK: {url}]"
            
            full_text += text + "\n"

    return full_text

def parse_resume_to_json(file_bytes: bytes) -> dict:
    raw_data = extract_text_with_inline_links(file_bytes)
    
    prompt = f"""
    You are a resume parser. Convert the text below into valid JSON.
    The text contains embedded links in the format `[LINK: url]`.
    
    RULES:
    1. **PROJECT LINKS (CRITICAL):**
       - Look for `[LINK: ...]` tags next to project names.
       - **Github:** If a link contains 'github.com', assign it to `github_url`.
       - **Demo:** If a link is a deployed site (vercel, netlify, firebase, or custom domain), assign it to `demo_url`.
       - **CAPTURE BOTH:** It is vital to capture BOTH links if two are present near a project.
    2. **PROJECT CONTENT:** Capture content as `bullets` (preferred) or `description` (fallback).
    3. Output JSON ONLY.

    STRUCTURE:
    {{
      "personal_info": {{ "name": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "", "location": "" }},
      "summary": "",
      "skills": {{ "languages": [], "frameworks": [], "tools": [] }},
      "experience": [ {{ "company": "", "role": "", "dates": "", "bullets": [] }} ],
      "projects": [ {{ "name": "", "github_url": "", "demo_url": "", "description": "raw text", "bullets": [], "technologies": [] }} ],
      "education": [ {{ "institution": "", "degree": "", "dates": "" }} ]
    }}

    --- RESUME TEXT WITH EMBEDDED LINKS ---
    {raw_data}
    """

    # --- RETRY LOGIC ---
    max_retries = 3
    base_delay = 2

    for attempt in range(max_retries):
        try:
            response = gemini_model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
            
        except exceptions.ResourceExhausted:
            wait_time = base_delay * (2 ** attempt) + random.uniform(0, 1)
            log.warning(f"Rate limit hit (429). Retrying in {wait_time:.2f} seconds...")
            time.sleep(wait_time)
            
        except Exception as e:
            log.error(f"AI Parse Error: {e}")
            raise ValueError(f"Failed to parse resume structure: {e}")

    raise ValueError("Server is busy (Rate Limit Exceeded). Please try again in a minute.")