import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useResumeStore } from '../../store';
import { Trash2, Plus, Github, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const USER_ID = "00000000-0000-0000-0000-000000000000";

export default function MasterProfile() {
    const [profile, setProfile] = useState({
        user_id: USER_ID,
        full_name: '',
        bio: '',
        personal_info: {},
        skills: [], // Flat list
        experience: [],
        projects: [],
        education: [], // New
        social_links: {}
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/profile/${USER_ID}`);
            let data = res.data;

            // Data Migration / Normalization
            if (data.skills && !Array.isArray(data.skills)) {
                // Flatten old category-based skills
                data.skills = Object.values(data.skills).flat();
            }
            if (!data.skills) data.skills = [];
            if (!data.education) data.education = [];
            if (!data.experience) data.experience = [];
            if (!data.projects) data.projects = [];

            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...profile, user_id: USER_ID };
            await axios.post('http://localhost:8000/profile', payload);
            alert("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md py-4 mb-8 flex items-center justify-between border-b border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Master Profile</h2>
                    <p className="text-slate-500 text-sm">Your career database. The AI uses this to build tailored resumes.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-sm transition-all"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <form className="space-y-8">
                {/* 1. Personal Info */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Full Name" value={profile.full_name} onChange={v => setProfile({ ...profile, full_name: v, personal_info: { ...profile.personal_info, name: v } })} />
                        <Field label="Email" value={profile.personal_info?.email} onChange={v => setProfile({ ...profile, personal_info: { ...profile.personal_info, email: v } })} />
                        <Field label="Phone" value={profile.personal_info?.phone} onChange={v => setProfile({ ...profile, personal_info: { ...profile.personal_info, phone: v } })} />
                        <Field label="Location" value={profile.personal_info?.location} onChange={v => setProfile({ ...profile, personal_info: { ...profile.personal_info, location: v } })} />
                        <Field label="LinkedIn URL" value={profile.personal_info?.linkedin} onChange={v => setProfile({ ...profile, personal_info: { ...profile.personal_info, linkedin: v } })} />
                        <Field label="Portfolio URL" value={profile.personal_info?.portfolio} onChange={v => setProfile({ ...profile, personal_info: { ...profile.personal_info, portfolio: v } })} />
                    </div>
                </section>



                {/* 3. Skills (Chip Input) */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Skills</h3>
                    <SkillChipInput
                        skills={profile.skills}
                        onChange={newSkills => setProfile({ ...profile, skills: newSkills })}
                    />
                </section>

                {/* 4. Experience (Repeater) */}
                <ExperienceSection
                    items={profile.experience}
                    onChange={items => setProfile({ ...profile, experience: items })}
                />

                {/* 5. Projects (Enhanced) */}
                <ProjectSection
                    projects={profile.projects}
                    onChange={items => setProfile({ ...profile, projects: items })}
                />

                {/* 6. Education (Repeater) */}
                <EducationSection
                    items={profile.education}
                    onChange={items => setProfile({ ...profile, education: items })}
                />

            </form>
        </div>
    );
}

// --- SUB COMPONENTS ---

const Field = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
        <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

function SkillChipInput({ skills, onChange }) {
    const [input, setInput] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (input.trim()) {
                if (!skills.includes(input.trim())) {
                    onChange([...skills, input.trim()]);
                }
                setInput('');
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        onChange(skills.filter(s => s !== skillToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-indigo-900"><Trash2 className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
            <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Type a skill and hit Enter (e.g. React, Python, Leadership)..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
}

function ExperienceSection({ items, onChange }) {
    const handleAdd = () => onChange([...items, { role: "New Role", company: "", start_date: "", end_date: "", description: "" }]);
    const handleUpdate = (i, field, val) => {
        const copy = [...items];
        copy[i] = { ...copy[i], [field]: val };
        onChange(copy);
    };
    const handleDelete = (i) => {
        if (window.confirm("Delete this experience?")) onChange(items.filter((_, idx) => idx !== i));
    };

    return (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-slate-800">Experience</h3>
                <button type="button" onClick={handleAdd} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Experience
                </button>
            </div>
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Field label="Role / Title" value={item.role} onChange={v => handleUpdate(idx, 'role', v)} />
                            <Field label="Company" value={item.company} onChange={v => handleUpdate(idx, 'company', v)} />
                            <Field label="Location" value={item.location} onChange={v => handleUpdate(idx, 'location', v)} />
                            <div className="grid grid-cols-2 gap-2">
                                <Field label="Start Date" value={item.start_date} onChange={v => handleUpdate(idx, 'start_date', v)} />
                                <Field label="End Date" value={item.end_date} onChange={v => handleUpdate(idx, 'end_date', v)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Bullets or Text)</label>
                            <textarea
                                className="w-full p-2 border border-slate-200 rounded text-sm h-24"
                                value={item.description || ''}
                                onChange={e => handleUpdate(idx, 'description', e.target.value)}
                                placeholder="• Led team of 5..."
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <button type="button" onClick={() => handleDelete(idx)} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function EducationSection({ items, onChange }) {
    const handleAdd = () => onChange([...items, { institution: "University Name", degree: "", start_date: "", end_date: "" }]);
    const handleUpdate = (i, field, val) => {
        const copy = [...items];
        copy[i] = { ...copy[i], [field]: val };
        onChange(copy);
    };
    const handleDelete = (i) => {
        if (window.confirm("Delete this education?")) onChange(items.filter((_, idx) => idx !== i));
    };

    return (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-slate-800">Education</h3>
                <button type="button" onClick={handleAdd} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Education
                </button>
            </div>
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Institution" value={item.institution} onChange={v => handleUpdate(idx, 'institution', v)} />
                            <Field label="Degree" value={item.degree} onChange={v => handleUpdate(idx, 'degree', v)} />
                            <Field label="Field of Study" value={item.field_of_study} onChange={v => handleUpdate(idx, 'field_of_study', v)} />
                            <Field label="Grade / GPA" value={item.grade} onChange={v => handleUpdate(idx, 'grade', v)} />
                            <div className="grid grid-cols-2 gap-2">
                                <Field label="Start Date" value={item.start_date} onChange={v => handleUpdate(idx, 'start_date', v)} />
                                <Field label="End Date" value={item.end_date} onChange={v => handleUpdate(idx, 'end_date', v)} />
                            </div>
                        </div>
                        <div className="mt-2 text-right">
                            <button type="button" onClick={() => handleDelete(idx)} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

function ProjectSection({ projects, onChange }) {
    const { summarizeReadme } = useResumeStore();
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleAdd = () => {
        onChange([...projects, { name: "New Project", links: {}, tech_stack: [], description_source: "", generated_bullets: [] }]);
        setExpandedIndex(projects.length);
    };

    const handleUpdate = (index, field, value) => {
        const updated = [...projects];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const handleLinkUpdate = (index, key, value) => {
        const currentLinks = projects[index].links || {};
        const updatedLinks = { ...currentLinks, [key]: value };
        // Clean up empty keys if needed, or keep for editing
        handleUpdate(index, 'links', updatedLinks);
    };

    const handleSummarize = async (index) => {
        const readme = projects[index].description_source;
        if (!readme) return alert("Please paste Readme content first.");

        setIsSummarizing(true);
        const bullets = await summarizeReadme(readme);
        setIsSummarizing(false);

        if (bullets && bullets.length > 0) {
            handleUpdate(index, 'generated_bullets', bullets);
            handleUpdate(index, 'bullets', bullets);
        }
    };

    const handleDelete = (index) => {
        if (!window.confirm("Remove this project?")) return;
        const updated = projects.filter((_, i) => i !== index);
        onChange(updated);
        setExpandedIndex(null);
    };

    return (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-slate-800">Projects</h3>
                <button type="button" onClick={handleAdd} className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Project
                </button>
            </div>

            <div className="space-y-4">
                {projects.map((project, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
                            <div className="font-bold text-slate-700">{project.name}</div>
                            <div className="flex items-center gap-2">
                                {expandedIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                        </div>

                        {expandedIndex === idx && (
                            <div className="mt-4 space-y-4 animate-in fade-in transition-all">
                                <Field label="Project Name" value={project.name} onChange={v => handleUpdate(idx, 'name', v)} />

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tech Stack (comma separated)</label>
                                    <input
                                        className="w-full p-2 border border-slate-200 rounded text-sm"
                                        placeholder="React, Python, AWS..."
                                        value={(project.tech_stack || []).join(", ")}
                                        onChange={(e) => handleUpdate(idx, 'tech_stack', e.target.value.split(",").map(s => s.trim()))}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Github className="w-3 h-3" /> Github URL</label>
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-sm"
                                            placeholder="https://github.com/..."
                                            value={project.links?.github || ''}
                                            onChange={(e) => handleLinkUpdate(idx, 'github', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Live Demo URL</label>
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded text-sm"
                                            placeholder="https://myapp.com"
                                            value={project.links?.live || ''}
                                            onChange={(e) => handleLinkUpdate(idx, 'live', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paste Readme / Description</label>
                                        <textarea
                                            className="w-full h-40 p-2 border border-slate-200 rounded text-xs leading-relaxed font-mono bg-slate-100"
                                            placeholder="# Project Title\n\nDescription..."
                                            value={project.description_source || ""}
                                            onChange={(e) => handleUpdate(idx, 'description_source', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSummarize(idx)}
                                            disabled={isSummarizing || !project.description_source}
                                            className="mt-2 w-full py-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 rounded border border-amber-300 text-xs font-bold hover:from-amber-200 flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            {isSummarizing ? "Analyzing..." : "✨ Summarize to Bullets"}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Generated Bullets for Resume</label>
                                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 bg-white p-2 rounded h-40 overflow-y-auto border border-slate-200">
                                            {(project.generated_bullets || project.bullets || []).map((b, i) => (
                                                <li key={i}>{b}</li>
                                            ))}
                                            {(!project.generated_bullets || project.generated_bullets.length === 0) && (
                                                <li className="text-slate-400 italic">No bullets generated yet.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button type="button" onClick={() => handleDelete(idx)} className="text-xs text-red-500 hover:underline">Delete Project</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
