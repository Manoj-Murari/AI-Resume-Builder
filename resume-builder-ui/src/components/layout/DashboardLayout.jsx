import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, UserCircle, PlusCircle, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout() {
    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Overview" },
        { to: "/builder", icon: <PlusCircle size={20} />, label: "New Resume" },
        { to: "/saved", icon: <FileText size={20} />, label: "My Applications" },
        { to: "/profile", icon: <UserCircle size={20} />, label: "Master Profile" },
    ];

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                        AI Resume
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
