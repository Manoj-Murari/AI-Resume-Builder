
import React from 'react';
import clsx from 'clsx';

const InputGroup = ({ label, value, onChange, placeholder, type = "text", className }) => (
    <div className={clsx("mb-4", className)}>
        {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
        {type === 'textarea' ? (
            <textarea
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all resize-none"
                rows={4}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        )}
    </div>
);

export default InputGroup;
