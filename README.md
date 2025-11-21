<div align="center">

# AI Resume Builder

**Intelligent. Tailored. ATS-Ready.**

A standalone, AI-powered engine that transforms generic resumes into highly targeted, job-specific applications in seconds.

[Demo](https://www.google.com/search?q=%23) · [Report Bug](https://www.google.com/search?q=https://github.com/Manoj-Murari/ai-resume-builder/issues) · [Request Feature](https://www.google.com/search?q=https://github.com/Manoj-Murari/ai-resume-builder/issues)

</div>

-----

## 🚀 Overview

**AI Resume Builder** is a full-stack application designed to bridge the gap between a candidate's profile and a target job description. Unlike static templates, this tool uses Generative AI (Google Gemini) to parse, analyze, and rewrite resume content dynamically.

It features a **hybrid PDF parser** capable of extracting complex layouts (including icon-based links), an **intelligent gap analysis** engine that interviews the user to fill missing skills, and a **real-time editor** that compiles everything into a pixel-perfect, ATS-friendly PDF.

## ✨ Key Features

  * **📄 Smart PDF Ingestion**: Uses a custom weighted-proximity algorithm (PyMuPDF) to accurately extract text and associate "floating" icon links (GitHub/LinkedIn) with their correct project titles.
  * **🧠 Gap Analysis Engine**: Compares your resume against a specific Job Description (JD) to identify missing hard skills and generates interview questions to help you bridge those gaps.
  * **✍️ AI Tailoring**: Automatically rewrites your Professional Summary and Bullet Points to align with the JD's keywords and tone using Google Gemini.
  * **🎨 Dynamic Layout Engine**:
      * **Auto-Fit Logic**: Automatically switches between "Standard" and "Compact" templates to ensure the resume fits on a single page.
      * **Dual-Link Support**: Correctly renders both Source Code (GitHub) and Live Demo links for technical projects.
  * **📝 Live Split-Screen Workspace**: Edit every field, bullet, and skill in a modern sidebar while watching the PDF preview update in real-time.
  * **✉️ Cover Letter Generator**: Instantly drafts a persuasive cover letter matching the resume's header and design style.

## 🏗️ System Architecture

The application follows a decoupled client-server architecture, leveraging Supabase for persistence and Google Gemini for intelligence.

```mermaid
graph TD
    User[User] -->|Uploads PDF| Frontend[React + Vite UI]
    Frontend -->|Multipart Request| Backend[FastAPI Server]
    
    subgraph "Backend Core"
        Backend -->|Extract Text/Links| Parser[Hybrid Parser (PyMuPDF)]
        Backend -->|Generate Content| AI[Google Gemini API]
        Backend -->|Render PDF| Renderer[xhtml2pdf + Jinja2]
    end
    
    subgraph "Persistence"
        Backend -->|Store Raw Files| Storage[Supabase Storage]
        Backend -->|Save Metadata| DB[Supabase DB]
    end
    
    Renderer -->|Binary PDF| Frontend
```

## 🛠️ Tech Stack

### **Backend**

  * **Framework**: Python 3.11+, FastAPI
  * **AI/LLM**: Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`)
  * **PDF Processing**: `pymupdf` (Parsing), `xhtml2pdf` (Rendering)
  * **Templating**: Jinja2
  * **Data Validation**: Pydantic

### **Frontend**

  * **Framework**: React 18 (Vite)
  * **State Management**: Zustand (with Persistence)
  * **Styling**: TailwindCSS v4, Framer Motion (Animations), Lucide React (Icons)
  * **HTTP Client**: Axios

### **Infrastructure**

  * **Database**: Supabase (PostgreSQL)
  * **Storage**: Supabase Storage

## ⚡ Installation & Setup

### Prerequisites

  * Python 3.10+
  * Node.js 18+
  * Supabase Project (URL & Service Role Key)
  * Google Gemini API Key

### 1\. Clone the Repository

```bash
git clone https://github.com/Manoj-Murari/ai-resume-builder.git
cd ai-resume-builder
```

### 2\. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env
```

**Configure `.env`**:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
```

### 3\. Frontend Setup

```bash
cd resume-builder-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4\. Database Setup (Supabase)

Run the following SQL in your Supabase SQL Editor to initialize the schema and storage buckets:

```sql
-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('raw_resumes', 'raw_resumes', true) 
ON CONFLICT (id) DO NOTHING;

-- Create Table
CREATE TABLE IF NOT EXISTS public.master_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    parsed_data JSONB,
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Public access for MVP)
ALTER TABLE public.master_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON public.master_resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.master_resumes FOR SELECT USING (true);
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'raw_resumes');
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'raw_resumes');
```

## 🖥️ Running Locally

1.  **Start the Backend:**

    ```bash
    # From root directory
    uvicorn main:app --reload --port 8000
    ```

2.  **Start the Frontend:**

    ```bash
    # From resume-builder-ui directory
    npm run dev
    ```

3.  **Access the App:** Open `http://localhost:5173`.

## 📖 Usage Guide

1.  **Upload**: Drag & drop your existing PDF resume. The parser will extract contact info, skills, and projects (including icon-based links).
2.  **Analyze**: Paste the Job Description (JD). The AI will calculate a "Match Score" and identify missing critical skills.
3.  **Interview**: Answer 2-3 smart questions generated by the AI to fill those gaps (e.g., "Have you used Docker in production?").
4.  **Workspace**:
      * Review the tailored resume in the Live Editor.
      * Edit bullet points, update links, or modify the summary.
      * **Auto-Save**: Changes render instantly in the PDF preview.
      * **Download**: Export the final PDF or switch tabs to generate and download a matching Cover Letter.

## 🗺️ Roadmap

  - [x] Hybrid PDF Parsing (Text + Links)
  - [x] AI Gap Analysis & Interview Mode
  - [x] Auto-Fit PDF Layout Engine
  - [x] Split-Screen Real-time Editor
  - [x] Cover Letter Generation
  - [ ] **Integration**: Merge into main **IntelliApply** dashboard.
  - [ ] **Authentication**: replace dummy User IDs with Supabase Auth.
  - [ ] **Template Selection**: Add "Modern" and "Creative" PDF templates.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Maintainers

  * **Manoj Murari** - *Lead Developer*

-----

*Built with ❤️ for developers by developers.*
\<div align="center"\>

# AI Resume Builder

**Intelligent. Tailored. ATS-Ready.**

A standalone, AI-powered engine that transforms generic resumes into highly targeted, job-specific applications in seconds.

[Demo](https://www.google.com/search?q=%23) · [Report Bug](https://www.google.com/search?q=https://github.com/Manoj-Murari/ai-resume-builder/issues) · [Request Feature](https://www.google.com/search?q=https://github.com/Manoj-Murari/ai-resume-builder/issues)

\</div\>

-----

## 🚀 Overview

**AI Resume Builder** is a full-stack application designed to bridge the gap between a candidate's profile and a target job description. Unlike static templates, this tool uses Generative AI (Google Gemini) to parse, analyze, and rewrite resume content dynamically.

It features a **hybrid PDF parser** capable of extracting complex layouts (including icon-based links), an **intelligent gap analysis** engine that interviews the user to fill missing skills, and a **real-time editor** that compiles everything into a pixel-perfect, ATS-friendly PDF.

## ✨ Key Features

  * **📄 Smart PDF Ingestion**: Uses a custom weighted-proximity algorithm (PyMuPDF) to accurately extract text and associate "floating" icon links (GitHub/LinkedIn) with their correct project titles.
  * **🧠 Gap Analysis Engine**: Compares your resume against a specific Job Description (JD) to identify missing hard skills and generates interview questions to help you bridge those gaps.
  * **✍️ AI Tailoring**: Automatically rewrites your Professional Summary and Bullet Points to align with the JD's keywords and tone using Google Gemini.
  * **🎨 Dynamic Layout Engine**:
      * **Auto-Fit Logic**: Automatically switches between "Standard" and "Compact" templates to ensure the resume fits on a single page.
      * **Dual-Link Support**: Correctly renders both Source Code (GitHub) and Live Demo links for technical projects.
  * **📝 Live Split-Screen Workspace**: Edit every field, bullet, and skill in a modern sidebar while watching the PDF preview update in real-time.
  * **✉️ Cover Letter Generator**: Instantly drafts a persuasive cover letter matching the resume's header and design style.

## 🏗️ System Architecture

The application follows a decoupled client-server architecture, leveraging Supabase for persistence and Google Gemini for intelligence.

```mermaid
graph TD
    User[User] -->|Uploads PDF| Frontend[React + Vite UI]
    Frontend -->|Multipart Request| Backend[FastAPI Server]
    
    subgraph "Backend Core"
        Backend -->|Extract Text/Links| Parser[Hybrid Parser (PyMuPDF)]
        Backend -->|Generate Content| AI[Google Gemini API]
        Backend -->|Render PDF| Renderer[xhtml2pdf + Jinja2]
    end
    
    subgraph "Persistence"
        Backend -->|Store Raw Files| Storage[Supabase Storage]
        Backend -->|Save Metadata| DB[Supabase DB]
    end
    
    Renderer -->|Binary PDF| Frontend
```

## 🛠️ Tech Stack

### **Backend**

  * **Framework**: Python 3.11+, FastAPI
  * **AI/LLM**: Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`)
  * **PDF Processing**: `pymupdf` (Parsing), `xhtml2pdf` (Rendering)
  * **Templating**: Jinja2
  * **Data Validation**: Pydantic

### **Frontend**

  * **Framework**: React 18 (Vite)
  * **State Management**: Zustand (with Persistence)
  * **Styling**: TailwindCSS v4, Framer Motion (Animations), Lucide React (Icons)
  * **HTTP Client**: Axios

### **Infrastructure**

  * **Database**: Supabase (PostgreSQL)
  * **Storage**: Supabase Storage

## ⚡ Installation & Setup

### Prerequisites

  * Python 3.10+
  * Node.js 18+
  * Supabase Project (URL & Service Role Key)
  * Google Gemini API Key

### 1\. Clone the Repository

```bash
git clone https://github.com/Manoj-Murari/ai-resume-builder.git
cd ai-resume-builder
```

### 2\. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env
```

**Configure `.env`**:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
```

### 3\. Frontend Setup

```bash
cd resume-builder-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4\. Database Setup (Supabase)

Run the following SQL in your Supabase SQL Editor to initialize the schema and storage buckets:

```sql
-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('raw_resumes', 'raw_resumes', true) 
ON CONFLICT (id) DO NOTHING;

-- Create Table
CREATE TABLE IF NOT EXISTS public.master_resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    parsed_data JSONB,
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Public access for MVP)
ALTER TABLE public.master_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON public.master_resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.master_resumes FOR SELECT USING (true);
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'raw_resumes');
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'raw_resumes');
```

## 🖥️ Running Locally

1.  **Start the Backend:**

    ```bash
    # From root directory
    uvicorn main:app --reload --port 8000
    ```

2.  **Start the Frontend:**

    ```bash
    # From resume-builder-ui directory
    npm run dev
    ```

3.  **Access the App:** Open `http://localhost:5173`.

## 📖 Usage Guide

1.  **Upload**: Drag & drop your existing PDF resume. The parser will extract contact info, skills, and projects (including icon-based links).
2.  **Analyze**: Paste the Job Description (JD). The AI will calculate a "Match Score" and identify missing critical skills.
3.  **Interview**: Answer 2-3 smart questions generated by the AI to fill those gaps (e.g., "Have you used Docker in production?").
4.  **Workspace**:
      * Review the tailored resume in the Live Editor.
      * Edit bullet points, update links, or modify the summary.
      * **Auto-Save**: Changes render instantly in the PDF preview.
      * **Download**: Export the final PDF or switch tabs to generate and download a matching Cover Letter.

## 🗺️ Roadmap

  - [x] Hybrid PDF Parsing (Text + Links)
  - [x] AI Gap Analysis & Interview Mode
  - [x] Auto-Fit PDF Layout Engine
  - [x] Split-Screen Real-time Editor
  - [x] Cover Letter Generation
  - [ ] **Integration**: Merge into main **IntelliApply** dashboard.
  - [ ] **Authentication**: replace dummy User IDs with Supabase Auth.
  - [ ] **Template Selection**: Add "Modern" and "Creative" PDF templates.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Maintainers

  * **Manoj Murari** - *Lead Developer*

-----

*Built with ❤️ for developers by developers.*