from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Response
from fastapi.middleware.cors import CORSMiddleware
from core.parser import parse_resume_to_json
from core.intelligence import analyze_gaps
from core.generator import tailor_resume, write_cover_letter
from core.renderer import render_resume_pdf, render_cover_letter_pdf
from core.schemas import GapAnalysisRequest, GapAnalysisResponse, CoverLetterRequest, CoverLetterResponse
from config import supabase
import logging

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="AI Resume Builder Core")

# --- BULLETPROOF CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow ALL origins
    allow_credentials=False,  # Disable cookies (we use Bearer tokens)
    allow_methods=["*"],      # Allow all methods
    allow_headers=["*"],      # Allow all headers
)
# --------------------------------------

# --- PHASE 1: INGEST ---
@app.post("/ingest")
async def ingest_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDFs allowed.")

    content = await file.read()

    try:
        parsed_data = parse_resume_to_json(content)
    except Exception as e:
        raise HTTPException(500, f"Parser failed: {e}")

    public_url = ""
    try:
        path = f"resumes/{file.filename}"
        # Using upsert to avoid errors during testing re-uploads
        supabase.storage.from_("raw_resumes").upload(path, content, {"upsert": "true"})
        public_url = supabase.storage.from_("raw_resumes").get_public_url(path)
    except Exception as e:
        logging.error(f"Storage upload failed: {e}")

    try:
        db_res = supabase.table("master_resumes").insert({
            "user_id": "00000000-0000-0000-0000-000000000000",
            "file_url": public_url,
            "parsed_data": parsed_data,
            "raw_text": str(parsed_data)
        }).execute()
        
        return {"status": "success", "id": db_res.data[0]['id'], "data": parsed_data}
    except Exception as e:
        raise HTTPException(500, f"Database save failed: {e}")

# --- PHASE 2: ANALYZE ---
@app.post("/analyze-gaps", response_model=GapAnalysisResponse)
async def analyze_resume_gaps(request: GapAnalysisRequest = Body(...)):
    if not request.job_description or len(request.job_description) < 50:
        raise HTTPException(400, "Job description is too short.")

    try:
        analysis = analyze_gaps(request.resume_data, request.job_description)
        return analysis
    except Exception as e:
        logging.error(f"Gap Analysis Error: {e}")
        raise HTTPException(500, "Failed to analyze gaps.")

# --- PHASE 3: GENERATE RESUME & RENDER ---
@app.post("/generate-tailored")
async def generate_tailored_resume(
    resume_data: dict = Body(...),
    job_description: str = Body(...),
    gap_answers: dict = Body(default=None)
):
    try:
        tailored_json = tailor_resume(resume_data, job_description, gap_answers)
        return tailored_json
    except Exception as e:
        logging.error(f"Generation Error: {e}")
        raise HTTPException(500, f"Generation failed: {e}")

@app.post("/render-pdf")
async def render_pdf(resume_data: dict = Body(...)):
    """
    Converts Resume JSON -> PDF (Auto-switching between Standard and Compact).
    """
    try:
        pdf_bytes = render_resume_pdf(resume_data)
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        logging.error(f"PDF Rendering Error: {e}")
        raise HTTPException(500, f"Failed to render PDF: {e}")

# --- PHASE 4: COVER LETTER ---
@app.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter_endpoint(request: CoverLetterRequest = Body(...)):
    if not request.job_description or len(request.job_description) < 50:
        raise HTTPException(400, "Job description is too short.")
        
    try:
        letter_text = write_cover_letter(request.resume_data, request.job_description)
        return {"cover_letter_text": letter_text}
    except Exception as e:
        logging.error(f"Cover Letter Error: {e}")
        raise HTTPException(500, "Failed to generate cover letter.")

@app.post("/render-cover-letter-pdf")
async def render_cover_letter_pdf_endpoint(
    resume_data: dict = Body(...),
    cover_letter_text: str = Body(...)
):
    """
    Converts Cover Letter Text + Resume Header -> PDF.
    """
    try:
        pdf_bytes = render_cover_letter_pdf(resume_data, cover_letter_text)
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        logging.error(f"Cover Letter PDF Error: {e}")
        raise HTTPException(500, f"Failed to render Cover Letter PDF: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)