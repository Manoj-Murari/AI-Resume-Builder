import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const cards = [
        {
            title: "Create New Resume",
            description: "Tailor your resume for a specific job description using AI.",
            icon: <PlusCircle size={32} className="text-violet-600" />,
            to: "/builder",
            color: "bg-violet-50 border-violet-200 hover:border-violet-300",
        },
        {
            title: "My Applications",
            description: "Track your job applications and resumes.",
            icon: <FileText size={32} className="text-blue-600" />,
            to: "/saved",
            color: "bg-blue-50 border-blue-200 hover:border-blue-300",
        },
        {
            title: "Master Profile",
            description: "Update your core bio, skills, and experience context.",
            icon: <UserCircle size={32} className="text-emerald-600" />,
            to: "/profile",
            color: "bg-emerald-50 border-emerald-200 hover:border-emerald-300",
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back!</h1>
            <p className="text-slate-500 mb-8">What would you like to do today?</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <Link key={index} to={card.to} className="block group">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className={`h-full p-6 rounded-xl border-2 transition-all ${card.color} shadow-sm group-hover:shadow-md`}
                        >
                            <div className="mb-4">{card.icon}</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
                            <p className="text-slate-600">{card.description}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
