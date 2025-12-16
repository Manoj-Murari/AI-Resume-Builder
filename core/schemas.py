from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# --- RESUME STRUCTURES ---
class PersonalInfo(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None

class ExperienceItem(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None # 'Present' if currently working
    description: Optional[str] = None
    dates: Optional[str] = None # Legacy support
    bullets: List[str] = []

class ProjectItem(BaseModel):
    name: str
    links: Dict[str, str] = {} # e.g. {"github": "...", "live": "..."}
    # Deprecating old specific fields in favor of 'links' dict, but keeping for backward compatibility if needed, 
    # or mapping them to 'links' in logic.
    description: Optional[str] = None 
    tech_stack: List[str] = []
    description_source: Optional[str] = None # The raw Readme content
    generated_bullets: List[str] = []     # AI generated bullets
    
    # Legacy fields (optional)
    github_url: Optional[str] = None 
    demo_url: Optional[str] = None
    bullets: List[str] = []

class EducationItem(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    grade: Optional[str] = None
    dates: Optional[str] = None # Legacy

class ResumeSchema(BaseModel):
    personal_info: PersonalInfo
    summary: str
    skills: List[str] # Changed from Dict to List[str] for Flat List support
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    education: List[EducationItem]

# --- GAP ANALYSIS STRUCTURES ---
class GapAnalysisRequest(BaseModel):
    resume_data: Optional[Dict[str, Any]] = None
    job_description: str
    job_url: Optional[str] = None

class GapItem(BaseModel):
    missing_skill: str
    type: str = "elaborate" # 'binary' (simple yes/no) or 'elaborate' (text answer)
    context: str
    question: str

class GapAnalysisResponse(BaseModel):
    job_title_detected: str
    match_score: int
    gaps: List[GapItem]

class GapSuggestionRequest(BaseModel):
    user_id: Optional[str] = "00000000-0000-0000-0000-000000000000"
    missing_skill: str
    job_description: str
    master_profile: Optional[Dict[str, Any]] = None

class GapSuggestionResponse(BaseModel):
    suggested_text: str

# --- COVER LETTER STRUCTURES ---
class CoverLetterRequest(BaseModel):
    resume_data: Optional[Dict[str, Any]] = None
    job_description: str

class CoverLetterResponse(BaseModel):
    cover_letter_text: str

# --- PROFILE & SAVED RESUME STRUCTURES ---
class UserProfile(BaseModel):
    user_id: str
    personal_info: Optional[PersonalInfo] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = [] # Changed to Flat List
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    education: List[EducationItem] = []
    social_links: Dict[str, str] = {}

class SavedResume(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    job_description: Optional[str] = None
    resume_json: Dict[str, Any]
    created_at: Optional[str] = None

class ApplicationSchema(BaseModel):
    id: Optional[str] = None
    user_id: str
    job_title: str
    company_name: str
    job_location: Optional[str] = None
    platform: Optional[str] = None
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    resume_version_id: Optional[str] = None
    resume_json: Optional[Dict[str, Any]] = None
    status: str = 'Applied'
    created_at: Optional[str] = None

class ReadmeSummaryRequest(BaseModel):
    readme_text: str

class ReadmeSummaryResponse(BaseModel):
    bullets: List[str]