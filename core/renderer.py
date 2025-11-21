from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from io import BytesIO
import os
import logging
import fitz  # PyMuPDF

log = logging.getLogger(__name__)

def _generate_pdf_bytes(data: dict, template_name: str, extra_context: dict = None) -> bytes:
    """Internal helper to render a specific template to PDF bytes."""
    template_dir = os.path.join(os.getcwd(), "templates")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template(template_name)
    
    # Merge data with any extra context (like cover letter text)
    context = {"data": data}
    if extra_context:
        context.update(extra_context)

    html_string = template.render(**context)
    
    pdf_buffer = BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html_string, 
        dest=pdf_buffer
    )

    if pisa_status.err:
        raise ValueError(f"PDF generation failed for template {template_name}")
    
    return pdf_buffer.getvalue()

def render_resume_pdf(resume_data: dict) -> bytes:
    """
    Renders the resume JSON into a PDF using Auto-Fit strategy.
    """
    log.info("Attempting rendering with Standard Template...")
    pdf_bytes = _generate_pdf_bytes(resume_data, "resume.html")
    
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page_count = doc.page_count
        doc.close()
        
        if page_count > 1:
            log.info(f"Standard template resulted in {page_count} pages. Switching to Compact Template.")
            pdf_bytes = _generate_pdf_bytes(resume_data, "resume_compact.html")
        else:
            log.info("Standard template fit on 1 page. Success.")
            
    except Exception as e:
        log.error(f"Error checking PDF page count: {e}")
        return pdf_bytes
    
    return pdf_bytes

def render_cover_letter_pdf(resume_data: dict, cover_letter_text: str) -> bytes:
    """
    Renders the Cover Letter into a PDF matching the resume header.
    """
    # Convert newlines to HTML breaks so paragraphs render correctly
    formatted_text = cover_letter_text.replace("\n", "<br/>")
    
    return _generate_pdf_bytes(
        resume_data, 
        "cover_letter.html", 
        extra_context={"cover_letter_html": formatted_text}
    )