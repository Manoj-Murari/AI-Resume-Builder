from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Response
from fastapi.middleware.cors import CORSMiddleware
from core.parser import parse_resume_to_json
from core.intelligence import analyze_gaps
from core.generator import tailor_resume
from core.renderer import render_resume_pdf
from core.schemas import GapAnalysisRequest, GapAnalysisResponse
from config import supabase
import logging

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="AI Resume Builder Core")

# --- BULLETPROOF CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow ALL origins (localhost, 127.0.0.1, etc.)
    allow_credentials=False,  # Disable cookies (we use Bearer tokens anyway)
    allow_methods=["*"],      # Allow all methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],      # Allow all headers (Authorization, Content-Type)
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

# --- PHASE 3: GENERATE & RENDER ---
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
    try:
        pdf_bytes = render_resume_pdf(resume_data)
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception as e:
        logging.error(f"PDF Rendering Error: {e}")
        raise HTTPException(500, f"Failed to render PDF: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)