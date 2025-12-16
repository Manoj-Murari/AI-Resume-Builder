import React, { useEffect, useState } from 'react';
import { Layout } from 'lucide-react';

const DashboardButton = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check parameters to see if we are already in dashboard mode
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'dashboard') {
            setIsVisible(false);
        }
    }, []);

    const handleOpenDashboard = () => {
        // Check if running as Chrome Extension
        if (typeof chrome !== "undefined" && chrome.tabs && chrome.runtime && chrome.runtime.getURL) {
            const url = chrome.runtime.getURL('index.html?mode=dashboard');
            chrome.tabs.create({ url }, () => {
                // Attempt to close the side panel window after opening the tab
                // This might not work in all contexts, but is worth a try
                window.close();
            });
        } else {
            // Fallback for localhost / web
            window.open('/?mode=dashboard', '_blank');
        }
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleOpenDashboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 rounded-md transition-colors"
            title="Open in full-screen dashboard"
        >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
        </button>
    );
};

export default DashboardButton;
