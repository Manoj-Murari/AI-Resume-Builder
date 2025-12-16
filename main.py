from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Response
from fastapi.middleware.cors import CORSMiddleware
from core.parser import parse_resume_to_json
from core.intelligence import analyze_gaps, suggest_gap_answer, summarize_readme
from core.generator import tailor_resume, write_cover_letter
from core.renderer import render_resume_pdf, render_cover_letter_pdf
from core.schemas import GapAnalysisRequest, GapAnalysisResponse, GapItem, CoverLetterRequest, CoverLetterResponse, UserProfile, SavedResume, GapSuggestionRequest, GapSuggestionResponse, ApplicationSchema, ReadmeSummaryRequest, ReadmeSummaryResponse
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
        # Check if resume_data is provided (Validation for Skip Upload)
        if not request.resume_data:
            # If no resume data, we can't do gap analysis properly.
            # However, for 'Career Architect' mode, this step might be irrelevant or we just say "Please rely on Master Profile".
            # For now, let's return a dummy response to prevent 500 error.
            return GapAnalysisResponse(
                job_title_detected="Unknown",
                match_score=0,
                gaps=[
                    GapItem(
                        missing_skill="Resume Missing", 
                        context="We cannot analyze gaps without a base resume.", 
                        question="Please ensure your Master Profile has relevant projects."
                    )
                ]
            )

        analysis = analyze_gaps(request.resume_data, request.job_description)
        return analysis
    except Exception as e:
        logging.error(f"Gap Analysis Error: {e}")
        raise HTTPException(500, "Failed to analyze gaps.")

@app.post("/suggest-gap-answer", response_model=GapSuggestionResponse)
async def suggest_gap_answer_endpoint(request: GapSuggestionRequest = Body(...)):
    if not request.missing_skill:
        raise HTTPException(400, "Missing skill is required.")

    master_profile = None
    if request.user_id:
        try:
             # Fetch Master Profile from Supabase if user_id is provided
            profile_response = supabase.table("user_profiles").select("*").eq("user_id", request.user_id).execute()
            if profile_response.data and len(profile_response.data) > 0:
                master_profile = profile_response.data[0]
                logging.info(f"Loaded Master Profile for Suggestion (User {request.user_id})")
        except Exception as e:
            logging.warning(f"Could not fetch Master Profile: {e}")

    try:
        suggestion_text = suggest_gap_answer(
            missing_skill=request.missing_skill,
            job_description=request.job_description,
            master_profile=master_profile
        )
        return GapSuggestionResponse(suggested_text=suggestion_text)
    except Exception as e:
        logging.error(f"Suggestion Error: {e}")
        raise HTTPException(500, "Failed to generate suggestion.")

# --- PHASE 3: GENERATE RESUME & RENDER ---
@app.post("/generate-tailored")
async def generate_tailored_resume(data: dict):
    """
    Generates a tailored resume.
    Payload:
    {
        "current_resume": {...},
        "job_description": "...",
        "gap_answers": {...},
        "user_id": "...",     # Optional, derived from auth in future
        "generation_mode": "augmented" # quick | architect | augmented (default)
    }
    """
    try:
        current_resume = data.get("current_resume")
        job_description = data.get("job_description")
        gap_answers = data.get("gap_answers")
        # generation_mode: 'quick', 'architect', or 'augmented'
        generation_mode = data.get("generation_mode", "augmented") 
        
        # Hardcoded for now, or match payload
        user_id = "00000000-0000-0000-0000-000000000000"

        # Fetch Master Profile from Supabase
        profile_response = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        master_profile = None
        if profile_response.data and len(profile_response.data) > 0:
            master_profile = profile_response.data[0]
            logging.info(f"Loaded Master Profile for User {user_id}")

        tailored_json = tailor_resume(current_resume, job_description, gap_answers, master_profile, generation_mode)
        
        return tailored_json
    except Exception as e:
        logging.error(f"Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

# --- PHASE 5: USER PROFILE & SAVED RESUMES ---
@app.post("/profile")
async def upsert_profile(profile: UserProfile = Body(...)):
    try:
        data = profile.dict(exclude_unset=True)
        # Using upsert
        res = supabase.table("user_profiles").upsert(data).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        logging.error(f"Profile Upsert Error: {e}")
        raise HTTPException(500, f"Failed to save profile: {e}")

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    try:
        res = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        if not res.data:
            # Return empty profile structure if not found
            return {"user_id": user_id, "skills": {}, "experience": [], "projects": [], "education": []}
        return res.data[0]
    except Exception as e:
        logging.error(f"Profile Fetch Error: {e}")
        raise HTTPException(500, f"Failed to fetch profile: {e}")

@app.post("/saved-resume")
async def save_resume(resume: SavedResume = Body(...)):
    try:
        data = resume.dict(exclude={"created_at", "id"}, exclude_unset=True)
        res = supabase.table("saved_resumes").insert(data).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        logging.error(f"Save Resume Error: {e}")
        raise HTTPException(500, f"Failed to save resume: {e}")

@app.get("/saved-resumes/{user_id}")
async def get_saved_resumes(user_id: str):
    try:
        res = supabase.table("saved_resumes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        logging.error(f"Fetch Saved Resumes Error: {e}")
        raise HTTPException(500, f"Failed to fetch saved resumes: {e}")

@app.delete("/saved-resume/{id}")
async def delete_saved_resume(id: str):
    try:
        res = supabase.table("saved_resumes").delete().eq("id", id).execute()
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Delete Saved Resume Error: {e}")
        raise HTTPException(500, f"Failed to delete saved resume: {e}")

# --- PHASE 6: APPLICATIONS TRACKER ---
@app.post("/applications")
async def create_application(app_data: ApplicationSchema = Body(...)):
    try:
        data = app_data.dict(exclude={"created_at", "id"}, exclude_unset=True)
        # Assuming status default is 'Applied', managed by schema/db if omitted
        res = supabase.table("applications").insert(data).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        logging.error(f"Create Application Error: {e}")
        raise HTTPException(500, f"Failed to allow application: {e}")

@app.get("/applications/{user_id}")
async def get_applications(user_id: str):
    try:
        # Fetch applications, order by newest
        res = supabase.table("applications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        logging.error(f"Fetch Applications Error: {e}")
        raise HTTPException(500, f"Failed to fetch applications: {e}")

# --- PHASE 7: SMART UTILS ---
@app.post("/summarize-readme", response_model=ReadmeSummaryResponse)
async def summarize_readme_endpoint(request: ReadmeSummaryRequest = Body(...)):
    try:
        bullets = summarize_readme(request.readme_text)
        return {"bullets": bullets}
    except Exception as e:
         logging.error(f"Summarize Readme API Error: {e}")
         raise HTTPException(500, "Failed to summarize usage.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)