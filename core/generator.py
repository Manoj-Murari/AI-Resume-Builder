import json
import logging
from config import gemini_model

log = logging.getLogger(__name__)

def tailor_resume(current_resume: dict, job_description: str, gap_answers: dict = None) -> dict:
    
    user_context = ""
    if gap_answers:
        user_context = "USER'S ADDITIONAL CONTEXT (Use this to fill gaps):\n"
        for skill, answer in gap_answers.items():
            user_context += f"- {skill}: {answer}\n"

    prompt = f"""
    You are an expert Resume Writer. Tailor the candidate's resume to the Job Description.

    JOB DESCRIPTION:
    {job_description[:4000]}

    CANDIDATE RESUME (JSON):
    {json.dumps(current_resume)}

    {user_context}

    TASKS:
    1. **Rewrite Summary:** Create a powerful 3-sentence professional summary using JD keywords.
    2. **Enhance Experience:** Rewrite existing work history bullets to highlight JD skills.
    3. **Fix Projects:** - Ensure every project has a 'bullets' list (2-3 items). 
       - If a project currently has a 'description' paragraph, convert it to 'bullets'.
       - **CRITICAL:** Extract a list of 'technologies' (tools/languages used) for EACH project. If missing, infer them from the description.
    4. **Integrate Context:** Use user context to fill gaps.

    OUTPUT:
    Return valid JSON matching the input structure.
    """

    try:
        response = gemini_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        log.error(f"Tailoring Failed: {e}")
        raise ValueError("Failed to generate tailored resume")