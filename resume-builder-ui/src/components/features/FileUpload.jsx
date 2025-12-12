
import React from 'react';
import { useResumeStore } from '../../store';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, Loader2, FileText, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

function FileUpload() {
    const { handleFileUpload, isLoading, error } = useResumeStore();
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleFileUpload,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    return (
        <div className="max-w-xl mx-auto text-center mt-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Upload your Resume</h2>
                <p className="text-slate-500 mb-8 text-lg">We'll extract your skills and experience to build your new profile.</p>
            </motion.div>

            <div {...getRootProps()} className={clsx(
                "border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300 group bg-white",
                isDragActive ? "border-sky-500 bg-sky-50 ring-4 ring-sky-100" : "border-slate-200 hover:border-sky-400 hover:shadow-lg"
            )}>
                <input {...getInputProps()} />
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
                        <p className="text-slate-600 font-medium animate-pulse">Analyzing Document Structure...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <p className="text-lg font-medium text-slate-700 group-hover:text-sky-700 transition-colors">
                            Click to upload or drag & drop
                        </p>
                        <p className="text-sm text-slate-400 mt-2">PDF format only (Max 5MB)</p>
                    </>
                )}
            </div>
            {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center justify-center gap-2 border border-red-100">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </motion.div>
            )}
        </div>
    );
}

export default FileUpload;
