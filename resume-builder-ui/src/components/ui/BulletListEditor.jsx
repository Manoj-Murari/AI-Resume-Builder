
import React from 'react';
import { Trash2, Plus } from 'lucide-react';

function BulletListEditor({ bullets, onChange }) {
    const updateBullet = (idx, text) => {
        const newBullets = [...bullets];
        newBullets[idx] = text;
        onChange(newBullets);
    };
    return (
        <div className="space-y-3 mt-3 pl-2 border-l-2 border-slate-100">
            {bullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-2 group">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                    <textarea
                        className="flex-grow p-2 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-sky-500 focus:bg-white rounded text-sm text-slate-700 outline-none resize-none transition-all"
                        rows={Math.max(2, Math.ceil(bullet.length / 60))}
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                    />
                    <button onClick={() => onChange(bullets.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button onClick={() => onChange([...bullets, ""])} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-2 ml-4">
                <Plus className="w-3 h-3" /> Add Bullet Point
            </button>
        </div>
    );
}

export default BulletListEditor;
