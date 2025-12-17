import json
import logging
from config import gemini_model

log = logging.getLogger(__name__)

def tailor_resume(current_resume: dict, job_description: str, gap_answers: dict = None, master_profile: dict = None, generation_mode: str = "augmented") -> dict:
    
    user_context = ""
    if gap_answers:
        user_context = "USER'S ADDITIONAL CONTEXT (Use this to fill gaps):\n"
        for skill, answer in gap_answers.items():
            user_context += f"- {skill}: {answer}\n"

    master_context_str = ""
    if master_profile:
        # Filter relevant parts to avoid token limits if necessary, but full dump is fine for now
        master_context_str = f"""
    MASTER PROFILE (The complete history of the candidate):
    {json.dumps(master_profile)}
    """

    # --- MODE SPECIFIC INSTRUCTIONS ---
    mode_instructions = ""
    
    if generation_mode == "quick":
        # Scenario 1: Quick Tailor (PDF + Dynamic Categories)
        mode_instructions = """
        **STRATEGY: DYNAMIC CATEGORIZATION**
        1. **Ignore the original resume's skill categories.**
        2. Analyze the Job Description to identify Key Technical Clusters (e.g., "Cloud & DevOps", "Frontend Engineering", "Data Pipelines").
        3. create **NEW** category headers based on these clusters.
        4. Re-distribute the candidate's skills into these new, JD-specific categories.
        5. **Rewrite Experience:** strongly rewrite bullets to match JD keywords.
        """

    elif generation_mode == "architect":
        # Scenario 2: Career Architect (Master Profile Only)
        mode_instructions = """
        **STRATEGY: CAREER ARCHITECT (FROM SCRATCH)**
        1. **SOURCE OF TRUTH:** Use the `MASTER PROFILE` as your primary database.
        2. Select the **top 3-4 Projects** from the Master Profile that are MOST relevant to this specific Job Description. Ignore irrelevant ones.
        3. **Structure:** Create a resume structure perfect for this role.
        4. **Skills:** Pick relevant skills from the Master Profile and **Group them into categories** (e.g., Languages, Frameworks, Infrastructure) as a Dictionary.
        """

    else: # "augmented" (default)
        # Scenario 3: Augmented Tailor (Hybrid / Gap Filling)
        mode_instructions = """
        **STRATEGY: HYBRID AUGMENTATION**
        1. **Preserve Structure:** Keep the candidate's original resume structure and categories mostly intact (unless they are nonsensical).
        2. **GAP FILLING (CRITICAL):**
           - Check the `MASTER PROFILE`.
           - If the JD requires a skill (e.g. 'Redis') that is missing from the resume but PRESENT in the Master Profile, **INJECT IT** into the appropriate section.
           - If a relevant Project exists in the Master Profile that is better than one in the resume, **SWAP IT IN**.
        3. **Fix Categorization:** Ensure technologies are not listed as 'Tools' if they are 'Languages' or 'Frameworks'.
        """

    # For "architect" mode, we want to rely SOLELY on the Master Profile.
    # We might still pass current_resume for contact info extraction if needed, 
    # but to be safe and "bold" as requested, we hide the distinct resume sections.
    candidate_resume_str = ""
    if generation_mode != "architect":
        candidate_resume_str = f"""
    CANDIDATE RESUME (Initial Draft):
    {json.dumps(current_resume)}
    """
    else:
        # Fallback: Extract Personal Info from Master Profile if possible
        # This prevents "Hallucinated Name" issue when skipping upload
        p_info = master_profile.get("personal_info", {}) if master_profile else {}
        if p_info:
             candidate_resume_str = f"""
    CANDIDATE CONTACT INFO (Source: Master Profile):
    Name: {p_info.get('name', 'Candidate')}
    Email: {p_info.get('email', '')}
    Phone: {p_info.get('phone', '')}
    LinkedIn: {p_info.get('linkedin', '')}
    Location: {p_info.get('location', '')}
    Portfolio: {p_info.get('portfolio', '')}
    """
        else:
            candidate_resume_str = "CANDIDATE RESUME: [IGNORED - BUILDING FROM MASTER PROFILE]"

    prompt = f"""
    You are an expert Resume Writer. Tailor the candidate's resume to the Job Description.

    JOB DESCRIPTION:
    {job_description[:4000]}

    {candidate_resume_str}

    {master_context_str}

    {user_context}

    YOUR INSTRUCTIONS ({generation_mode.upper()} MODE):
    {mode_instructions}

    COMMON RULES:
    1. **Rewrite Summary:** Create a powerful 3-sentence professional summary using JD keywords.
    2. **Projects & Experience:** 
       - Ensure every entry has `bullets`. If `bullets` are empty in the source, GENERATE them from the description.
       - **MANDATORY:** You MUST include `start_date` and `end_date` for every role. Use the dates provided in the Master Profile.
       - **Clean Data:** Remove filenames (e.g., 'screenshot.png') and expand abbreviations (e.g., Change 'BTec' to 'B.Tech').
    3. **Output:** Return valid JSON matching the standard resume structure (personal_info, summary, skills, experience, projects, education).

    OUTPUT:
    Return valid JSON.
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