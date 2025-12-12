# AI Resume Builder

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-v3.10+-blue.svg)
![Node](https://img.shields.io/badge/node-v18+-green.svg)
![React](https://img.shields.io/badge/react-v18.3-61DAFB.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

**Stop sending generic resumes. Start landing interviews.**

An intelligent, AI-driven platform that parses your existing resume, analyzes job descriptions, and generates perfectly tailored resumes and cover letters in seconds using Google Gemini 2.0 Flash.

<br />

![Demo GIF](https://via.placeholder.com/800x400?text=Replace+with+actual+demo/screenshot)
*Replace with actual demo/screenshot*

</div>

---

## 🏗 Technological Architecture

```mermaid
graph TD
    User["👤 User"] -->|"Upload & Interact"| UI["⚛️ React Frontend (Vite)"]
    UI -->|"JSON Data"| API["🚀 FastAPI Backend"]
    
    subgraph "AI Core 🧠"
        API -->|Parse| PyMuPDF[PyMuPDF]
        API -->|"Analyze & Tailor"| Gemini["✨ Google Gemini 2.0 Flash"]
    end
    
    subgraph "Data & Storage 💾"
        API -->|"Store Raw/Parsed"| Supabase["⚡ Supabase DB & Storage"]
    end
    
    subgraph "Rendering 🎨"
        API -->|"Generate PDF"| Renderer["HTML/CSS to PDF Engine"]
        Renderer -->|Template| Jinja2["Jinja2 Templates"]
    end
    
    Gemini -->|"Optimization Data"| API
    Supabase -->|"Resume Persistence"| API
    API -->|"Download PDF"| User
```

## 🛠 Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-yellow?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PyMuPDF](https://img.shields.io/badge/PyMuPDF-PDF_Parsing-red?style=for-the-badge)

## 🚀 Key Features

*   **⚡️ Flash-Fast Parsing**: Instantly converts PDF resumes into structured JSON data using PyMuPDF.
*   **🤖 AI-Powered Tailoring**: Uses Google's Gemini 2.0 Flash model to rewrite experience bullets and summaries to specifically target job descriptions.
*   **🎯 Smart Gap Analysis**: Automatically detects missing skills or keywords from the JD and interviews you to fill those gaps.
*   **📄 Dynamic PDF Rendering**: Intelligent templating engine that automatically switches between Standard and Compact layouts based on content length.
*   **✍️ Auto-Cover Letter**: Generates a persuasive, role-specific cover letter matching your resume's style and tone.

## 🏁 Getting Started

### Prerequisites
*   **Node.js**: v18.0.0 or higher
*   **Python**: v3.10 or higher
*   **Supabase Account**: For database and file storage
*   **Google AI Studio Key**: For accessing Gemini models

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ai-resume-builder.git
    cd ai-resume-builder
    ```

2.  **Backend Setup**
    ```bash
    # Create virtual environment
    python -m venv .venv
    
    # Activate (Windows)
    .venv\Scripts\activate
    # Activate (Mac/Linux)
    # source .venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    cd resume-builder-ui
    npm install
    ```

### Configuration

Create a `.env` file in the root directory with the following variables:

| Variable Name | Description | Required? |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Your Supabase Project URL | ✅ Yes |
| `SUPABASE_KEY` | Your Supabase Service Role / Anon Key | ✅ Yes |
| `GEMINI_API_KEY` | API Key from Google AI Studio | ✅ Yes |

## 💻 Usage

1.  **Start the Backend Server**
    ```bash
    # From project root
    uvicorn main:app --reload
    ```
    *Server runs at `http://localhost:8000`*

2.  **Start the Frontend Client**
    ```bash
    # From /resume-builder-ui
    npm run dev
    ```
    *Client runs at `http://localhost:5173`*

3.  **Build Resumes!**
    *   Navigate to the frontend URL.
    *   Upload your existing PDF resume.
    *   Paste a Job Description.
    *   Let the AI perform the magic!

### 🧩 Chrome Extension Usage

The application is designed to run as a Chrome Extension, allowing you to use it alongside job boards (LinkedIn, Indeed, etc.).

1.  **Build the Extension**
    ```bash
    cd resume-builder-ui
    npm run build
    ```

2.  **Load in Chrome**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable **Developer mode** (top right).
    *   Click **Load unpacked**.
    *   Select the `resume-builder-ui/dist` folder.

3.  **Open the Side Panel**
    *   Pin the extension to your toolbar.
    *   Click the extension icon to open the AI Resume Builder in the side panel while browsing job posts.


## 🗺️ Project Roadmap

- [ ] **User Authentication**: Secure individual user profiles with Supabase Auth or Auth0.
- [ ] **Multiple Profiles**: Allow users to manage multiple base resumes (e.g., "Developer" vs "Manager").
- [ ] **LinkedIn Import**: Direct integration to import profile data from LinkedIn URLs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
