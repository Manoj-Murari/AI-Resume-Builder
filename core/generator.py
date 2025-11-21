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
    3. **Fix Projects:** - Ensure every project has `bullets`.
       - **PRESERVE ALL LINKS:** Check the input JSON. If `github_url` AND `demo_url` are present, keep BOTH. Do not merge or delete them.
       - Extract `technologies` list.
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

def write_cover_letter(current_resume: dict, job_description: str) -> str:
    """
    Generates a tailored cover letter based on the resume and JD.
    """
    prompt = f"""
    You are an expert Career Coach. Write a professional, persuasive Cover Letter for this candidate.

    JOB DESCRIPTION:
    {job_description[:4000]}

    CANDIDATE RESUME (JSON):
    {json.dumps(current_resume)}

    INSTRUCTIONS:
    1. **Tone:** Professional, confident, and enthusiastic.
    2. **Structure:**
       - **Hook:** State the role applied for and why the candidate is excited.
       - **Body Paragraph 1 (Experience):** Connect previous roles to the JD requirements.
       - **Body Paragraph 2 (Skills/Projects):** Highlight relevant technical skills.
       - **Closing:** Reiterate interest and propose a meeting.
    3. **Formatting:** Return ONLY the body text. No placeholders like "[Your Name]".

    OUTPUT:
    Return plain text.
    """

    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        log.error(f"Cover Letter Generation Failed: {e}")
        raise ValueError("Failed to generate cover letter")