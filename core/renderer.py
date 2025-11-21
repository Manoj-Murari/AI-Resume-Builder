from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from io import BytesIO
import os
import logging

log = logging.getLogger(__name__)

def render_resume_pdf(resume_data: dict) -> bytes:
    """
    Renders the resume JSON into a PDF using xhtml2pdf.
    """
    # 1. Setup Jinja2 Environment
    template_dir = os.path.join(os.getcwd(), "templates")
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template("resume.html")

    # 2. Render HTML
    html_string = template.render(data=resume_data)

    # 3. Convert to PDF (In-Memory)
    pdf_buffer = BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html_string, 
        dest=pdf_buffer
    )

    if pisa_status.err:
        log.error("PDF Generation Error")
        raise ValueError("PDF generation failed")
    
    return pdf_buffer.getvalue()