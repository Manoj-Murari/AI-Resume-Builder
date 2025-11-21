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
    4. For each missing skill, formulate a direct question to ask the user to verify if they have this experience.

    OUTPUT FORMAT (Strict JSON):
    {{
        "job_title_detected": "Senior Backend Engineer",
        "match_score": 75,
        "gaps": [
            {{
                "missing_skill": "Kubernetes",
                "context": "Required for container orchestration in this role.",
                "question": "Have you deployed applications using Kubernetes or managed clusters in production?"
            }},
             {{
                "missing_skill": "GraphQL",
                "context": "JD specifically mentions moving REST APIs to GraphQL.",
                "question": "Do you have experience designing or implementing GraphQL schemas?"
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