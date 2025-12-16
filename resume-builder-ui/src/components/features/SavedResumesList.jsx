import React, { useEffect, useState } from 'react';
import { useResumeStore } from '../../store';
import { FileText, Calendar, Trash2, Download, Briefcase, MapPin, Globe } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios'; // We can use store fetch, but direct is fine too since we have fetchApplications in store

export default function SavedResumesList() {
    const { fetchApplications } = useResumeStore();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await fetchApplications();
        if (data) setApplications(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        // Optional: Add logic to delete application if needed
        if (!window.confirm("Delete this application record?")) return;
        // We didn't add delete endpoint for applications yet, so skipping implementation or assume /saved-resume logic doesn't apply
        alert("Deletion not yet implemented.");
    };

    const handleDownload = async (resumeData, filename) => {
        try {
            const response = await axios.post('http://localhost:8000/render-pdf', resumeData, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || `Resume.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download PDF");
        }
    };

    // Status Badge Helper
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'interviewing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'offer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading applications...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">My Applications</h2>
            <p className="text-slate-500 mb-8">Track your job search progress.</p>

            {applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">No applications tracked yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Generate a resume and save it to start tracking.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">

                            {/* Icon / Date */}
                            <div className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[80px]">
                                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                                    <Briefcase size={24} />
                                </div>
                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(app.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{app.job_title}</h3>
                                <div className="text-slate-600 font-medium mb-1">{app.company_name}</div>

                                <div className="flex flex-wrap gap-3 text-sm text-slate-500 mt-2">
                                    {app.job_location && (
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                            <MapPin size={12} /> {app.job_location}
                                        </span>
                                    )}
                                    {app.platform && (
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                            <Globe size={12} /> {app.platform}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col gap-3 min-w-[200px] items-end">
                                <span className={clsx("px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border", getStatusColor(app.status))}>
                                    {app.status || 'Applied'}
                                </span>

                                <div className="flex items-center gap-2">
                                    {app.job_url && (
                                        <a href={app.job_url} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline">
                                            View Job
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDownload(app.resume_json, `${app.company_name}_${app.job_title}.pdf`)}
                                        className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <Download size={14} /> Resume
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
