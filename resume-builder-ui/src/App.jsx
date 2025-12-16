import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ResumeBuilder from './components/features/ResumeBuilder';
import SavedResumesList from './components/features/SavedResumesList';
import MasterProfile from './components/features/MasterProfile';
import Dashboard from './components/features/Dashboard';

export default function App() {
  const isExtension = useMemo(() => {
    return window.location.protocol === 'chrome-extension:' || window.location.protocol === 'moz-extension:';
  }, []);

  const isDashboardMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'dashboard';
  }, []);

  // Show full app if NOT extension OR if extension AND dashboard mode is active
  const showFullApp = !isExtension || isDashboardMode;

  return (
    <HashRouter>
      <Routes>
        {!showFullApp ? (
          // Extension Side Panel View: Keep it simple, just the builder
          <>
            <Route path="/" element={<ResumeBuilder isSidePanel={true} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Web App View: Full Dashboard
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="builder" element={<ResumeBuilder />} />
            <Route path="saved" element={<SavedResumesList />} />
            <Route path="profile" element={<MasterProfile />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  );
}
