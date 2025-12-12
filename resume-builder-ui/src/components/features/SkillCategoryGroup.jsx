
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import ArrayInput from '../ui/ArrayInput';

const SkillCategoryGroup = ({ name, skills, onRename, onDelete, onSkillsChange }) => {
    const [editingName, setEditingName] = useState(name);

    useEffect(() => {
        setEditingName(name);
    }, [name]);

    const handleBlur = () => {
        if (editingName !== name && editingName.trim()) {
            onRename(name, editingName);
        } else {
            setEditingName(name); // Reset if invalid
        }
    };

    return (
        <div className="mb-6 relative group">
            <div className="flex justify-between items-center mb-1">
                <input
                    className="font-bold text-slate-700 text-sm uppercase tracking-wider bg-transparent border border-transparent hover:border-slate-300 focus:border-sky-500 rounded px-1 -ml-1 w-full transition-all outline-none"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                />
                <button onClick={() => onDelete(name)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <ArrayInput
                label={null}
                items={skills}
                onChange={onSkillsChange}
                placeholder="Add skills..."
            />
        </div>
    );
};

export default SkillCategoryGroup;
