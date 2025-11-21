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
    dates: Optional[str] = None
    bullets: List[str] = []

class ProjectItem(BaseModel):
    name: str
    link: Optional[str] = None
    # Allow BOTH description and bullets so we don't lose data
    description: Optional[str] = None 
    bullets: List[str] = [] 
    technologies: List[str] = []

class EducationItem(BaseModel):
    institution: str
    degree: str
    dates: Optional[str] = None

class ResumeSchema(BaseModel):
    personal_info: PersonalInfo
    summary: str
    skills: Dict[str, List[str]]
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    education: List[EducationItem]

# --- GAP ANALYSIS STRUCTURES ---
class GapAnalysisRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_description: str
    job_url: Optional[str] = None

class GapItem(BaseModel):
    missing_skill: str
    context: str
    question: str

class GapAnalysisResponse(BaseModel):
    job_title_detected: str
    match_score: int
    gaps: List[GapItem]