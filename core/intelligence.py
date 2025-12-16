import json
import logging
from config import gemini_model
from core.schemas import GapAnalysisResponse

log = logging.getLogger(__name__)

def analyze_gaps(resume_json: dict, job_description: str) -> GapAnalysisResponse:
    """
    Compares Resume JSON vs Job Description.
    Returns a structured list of missing skills and questions.
    """
    
    prompt = f"""
    You are an expert Technical Recruiter. Perform a GAP ANALYSIS between the candidate's resume and the job description.

    CANDIDATE RESUME (JSON):
    {json.dumps(resume_json)}

    JOB DESCRIPTION:
    {job_description}

    TASK:
    1. Identify the detect Job Title.
    2. Calculate a Match Score (0-100) based on hard skills.
    3. Identify 3-5 CRITICAL HARD SKILLS present in the Job Description but MISSING or WEAK in the Resume.
    4. For each missing skill, decide if it's a BINARY gap (simple keyword check) or an ELABORATE gap (needs experience detail).
    5. Formulate a question.

    OUTPUT FORMAT (Strict JSON):
    {{
        "job_title_detected": "Senior Backend Engineer",
        "match_score": 75,
        "gaps": [
            {{
                "missing_skill": "Kubernetes",
                "type": "binary",
                "context": "Required for orchestration.",
                "question": "Do you have hands-on experience with Kubernetes?"
            }},
             {{
                "missing_skill": "System Design",
                "type": "elaborate",
                "context": "Needs deep understanding of scaling.",
                "question": "Describe a high-scale system you designed and the trade-offs you made."
            }}
        ]
    }}
    """

    try:
        response = gemini_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        result = json.loads(response.text)
        return GapAnalysisResponse(**result)
    except Exception as e:
        log.error(f"Gap Analysis Failed: {e}")
        # Return a safe fallback in case of AI failure
        return GapAnalysisResponse(
            job_title_detected="Unknown",
            match_score=0,
            gaps=[{"missing_skill": "Error", "context": "AI analysis failed.", "question": str(e)}]
        )

def suggest_gap_answer(missing_skill: str, job_description: str, master_profile: dict = None) -> str:
    """
    Generates a suggestion for a missing skill gap.
    Modes:
    1. MASTER PROFILE MODE: If profile has data, tries to connect skill to a project.
    2. TEMPLATE MODE: Returns a high-quality template with fill-in-the-blanks.
    """
    
    # 1. Check if Master Profile has ANY projects
    has_projects = False
    if master_profile and master_profile.get("projects") and len(master_profile["projects"]) > 0:
        has_projects = True

    if has_projects:
        prompt = f"""
        You are a Resume Coach. The user needs help writing a bullet point for the missing skill: "{missing_skill}".

        JOB DESCRIPTION:
        {job_description}

        MASTER PROFILE PROJECTS:
        {json.dumps(master_profile['projects'])}

        INSTRUCTION:
        Find a relevant project from the Master Profile that could plausibly demonstrate this skill (or a related one).
        Write a specific, action-oriented bullet point connecting the skill to that project.
        Do NOT invent facts. If the skill is totally unrelated to any project, fall back to the TEMPLATE strategy below.

        OUTPUT:
        Just the bullet point text.
        """
    else:
        # Template Mode
        prompt = f"""
        You are a Resume Coach. The user needs help writing a bullet point for the missing skill: "{missing_skill}".
        
        JOB DESCRIPTION:
        {job_description}

        INSTRUCTION:
        Write a high-quality TEMPLATE sentence.
        Use the Job Description to infer how the skill should be used.
        Use brackets [Like This] for specific project names or metrics the user needs to fill in.
        
        Tone: Action-oriented, professional.

        EXAMPLE OUTPUT:
        "Implemented {missing_skill} to optimize data flow in [Project Name], achieving [Metric] efficiency."

        OUTPUT:
        Just the template text.
        """

    try:
        response = gemini_model.generate_content(prompt)
        text = response.text.strip().replace('"', '') # Clean quotes
        return text
    except Exception as e:
        log.error(f"Suggestion Failed: {e}")
        return f"Implemented {missing_skill} in [Project Name] to improve [Specific Metric]."

def summarize_readme(readme_text: str) -> list[str]:
    """
    Summarizes a raw Readme text into 3-4 impressive resume bullet points.
    """
    prompt = f"""
    You are an expert Resume Writer.
    
    Here is a raw README from a developer's project:
    {readme_text[:3000]} # Truncate to avoid context limit if massive
    
    INSTRUCTION:
    Extract the core technical value and impact of this project.
    Generate 3-4 high-impact resume bullet points (STAR method).
    Focus on technologies used, problems solved, and metrics if inferred.
    
    OUTPUT:
    Return a JSON list of strings. Example: ["Designed...", "Implemented..."]
    """
    try:
        response = gemini_model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        result = json.loads(response.text)
        if isinstance(result, list):
             return result
        # Fallback if AI returns dict like {"bullets": [...]}
        return result.get("bullets", [])
    except Exception as e:
        log.error(f"Readme Summary Failed: {e}")
        return ["Could not summarize project. Please check the Readme content."]