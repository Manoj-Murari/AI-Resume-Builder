
import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../../store';
import { Edit, User, FileText, Briefcase, Code, Sparkles, Plus, Trash2 } from 'lucide-react';
import AccordionItem from '../ui/AccordionItem';
import InputGroup from '../ui/InputGroup';
import ArrayInput from '../ui/ArrayInput';
import SkillCategoryGroup from './SkillCategoryGroup';
import BulletListEditor from '../ui/BulletListEditor';

function EditorPanel() {
    const { tailoredResume, updateResumeData, regeneratePdf } = useResumeStore();
    const [formData, setFormData] = useState(tailoredResume);
    const [expandedSection, setExpandedSection] = useState('experience');

    // Auto-save with debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            if (JSON.stringify(formData) !== JSON.stringify(tailoredResume)) {
                updateResumeData(formData);
                regeneratePdf(formData);
            }
        }, 1000);
        return () => clearTimeout(handler);
    }, [formData, updateResumeData, regeneratePdf, tailoredResume]);

    const updateNested = (section, field, value) => {
        setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    };

    // Skill Management Functions
    const renameCategory = (oldName, newName) => {
        if (oldName === newName) return;
        if (formData.skills[newName]) {
            alert(`Category "${newName}" already exists!`);
            return;
        }
        const newSkills = {};
        Object.keys(formData.skills).forEach(key => {
            if (key === oldName) {
                newSkills[newName] = formData.skills[oldName];
            } else {
                newSkills[key] = formData.skills[key];
            }
        });
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const deleteCategory = (name) => {
        if (!window.confirm(`Delete skill category "${name}"?`)) return;
        const newSkills = { ...formData.skills };
        delete newSkills[name];
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const addCategory = () => {
        const base = "New Category";
        let name = base;
        let i = 1;
        while (formData.skills[name]) {
            name = `${base} ${i++}`;
        }
        setFormData(prev => ({ ...prev, skills: { ...prev.skills, [name]: [] } }));
    };


    return (
        <div className="h-full overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Edit className="w-4 h-4 text-sky-600" /> Editor
                </h3>
            </div>

            <AccordionItem
                icon={User}
                title="Personal Info"
                isExpanded={expandedSection === 'personal'}
                onToggle={() => setExpandedSection(expandedSection === 'personal' ? null : 'personal')}
            >
                <InputGroup label="Full Name" value={formData.personal_info.name} onChange={v => updateNested('personal_info', 'name', v)} />
                <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="Email" value={formData.personal_info.email} onChange={v => updateNested('personal_info', 'email', v)} />
                    <InputGroup label="Phone" value={formData.personal_info.phone} onChange={v => updateNested('personal_info', 'phone', v)} />
                </div>
                <InputGroup label="Location" value={formData.personal_info.location} onChange={v => updateNested('personal_info', 'location', v)} />
                <InputGroup label="LinkedIn" value={formData.personal_info.linkedin} onChange={v => updateNested('personal_info', 'linkedin', v)} />
                <InputGroup label="GitHub" value={formData.personal_info.github} onChange={v => updateNested('personal_info', 'github', v)} />
            </AccordionItem>

            <AccordionItem
                icon={FileText}
                title="Summary"
                isExpanded={expandedSection === 'summary'}
                onToggle={() => setExpandedSection(expandedSection === 'summary' ? null : 'summary')}
            >
                <InputGroup type="textarea" label="Professional Summary" value={formData.summary} onChange={v => setFormData(prev => ({ ...prev, summary: v }))} />
            </AccordionItem>

            <AccordionItem
                icon={Briefcase}
                title="Experience"
                isExpanded={expandedSection === 'experience'}
                onToggle={() => setExpandedSection(expandedSection === 'experience' ? null : 'experience')}
            >
                {formData.experience.map((job, idx) => (
                    <div key={idx} className="mb-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex justify-between mb-2">
                            <input className="font-bold text-slate-800 text-sm bg-transparent border-none p-0 focus:ring-0 w-full" value={job.company} onChange={(e) => {
                                const newList = [...formData.experience]; newList[idx].company = e.target.value; setFormData({ ...formData, experience: newList });
                            }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <input className="text-xs text-slate-500 bg-slate-50 p-1 rounded" value={job.role} onChange={(e) => {
                                const newList = [...formData.experience]; newList[idx].role = e.target.value; setFormData({ ...formData, experience: newList });
                            }} />
                            <input className="text-xs text-slate-500 bg-slate-50 p-1 rounded text-right" value={job.dates} onChange={(e) => {
                                const newList = [...formData.experience]; newList[idx].dates = e.target.value; setFormData({ ...formData, experience: newList });
                            }} />
                        </div>
                        <BulletListEditor bullets={job.bullets} onChange={(newBullets) => {
                            const newList = [...formData.experience]; newList[idx].bullets = newBullets; setFormData({ ...formData, experience: newList });
                        }} />
                    </div>
                ))}
            </AccordionItem>

            <AccordionItem
                icon={Code}
                title="Projects"
                isExpanded={expandedSection === 'projects'}
                onToggle={() => setExpandedSection(expandedSection === 'projects' ? null : 'projects')}
            >
                {formData.projects.map((proj, idx) => (
                    <div key={idx} className="mb-6 pb-6 border-b border-slate-100 last:border-0">
                        <div className="flex justify-between mb-2">
                            <input className="font-bold text-slate-800 text-sm bg-transparent border-none p-0 focus:ring-0 w-full" value={proj.name} onChange={(e) => {
                                const l = [...formData.projects]; l[idx].name = e.target.value; setFormData({ ...formData, projects: l });
                            }} />
                            <button onClick={() => {
                                const l = formData.projects.filter((_, i) => i !== idx);
                                setFormData({ ...formData, projects: l });
                            }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <InputGroup label="GitHub URL" value={proj.github_url} onChange={v => {
                            const l = [...formData.projects]; l[idx].github_url = v; setFormData({ ...formData, projects: l });
                        }} />
                        <InputGroup label="Demo URL" value={proj.demo_url} onChange={v => {
                            const l = [...formData.projects]; l[idx].demo_url = v; setFormData({ ...formData, projects: l });
                        }} />

                        <ArrayInput
                            label="Technologies"
                            placeholder="React, Python, Firebase..."
                            items={proj.technologies || []}
                            onChange={list => {
                                const l = [...formData.projects];
                                l[idx].technologies = list;
                                setFormData({ ...formData, projects: l });
                            }}
                        />

                        <BulletListEditor bullets={proj.bullets} onChange={(newBullets) => {
                            const l = [...formData.projects]; l[idx].bullets = newBullets; setFormData({ ...formData, projects: l });
                        }} />
                    </div>
                ))}
                <div className="p-4 pt-0">
                    <button onClick={() => setFormData(prev => ({ ...prev, projects: [{ name: "New Project", bullets: [""], technologies: [] }, ...prev.projects] }))} className="text-sm font-bold text-sky-600 flex items-center gap-1 w-full justify-center p-2 hover:bg-sky-50 rounded">
                        <Plus className="w-4 h-4" /> Add Project
                    </button>
                </div>
            </AccordionItem>

            <AccordionItem
                icon={Sparkles}
                title="Skills"
                isExpanded={expandedSection === 'skills'}
                onToggle={() => setExpandedSection(expandedSection === 'skills' ? null : 'skills')}
            >
                {Object.entries(formData.skills).map(([category, items]) => (
                    <SkillCategoryGroup
                        key={category}
                        name={category}
                        skills={items}
                        onRename={renameCategory}
                        onDelete={deleteCategory}
                        onSkillsChange={(list) => {
                            setFormData(prev => ({ ...prev, skills: { ...prev.skills, [category]: list } }));
                        }}
                    />
                ))}
                <button onClick={addCategory} className="text-sm font-bold text-sky-600 flex items-center gap-1 w-full justify-center p-2 hover:bg-sky-50 rounded mt-2">
                    <Plus className="w-4 h-4" /> Add Skill Category
                </button>
            </AccordionItem>
        </div>
    );
}

export default EditorPanel;
