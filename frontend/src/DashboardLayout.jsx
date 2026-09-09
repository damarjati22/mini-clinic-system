import React from 'react';
import Sidebar from './sidebar';

function DashboardLayout({ user, currentView, onNavigate, onLogout, children }) {
  return (
    <div className="flex h-screen bg-[#ececee] font-sans antialiased overflow-hidden">
      {/* Sidebar ala macOS Settings */}
      <Sidebar user={user} currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Area Konten Utama ala Jendela macOS Panel Kanan */}
      <main className="flex-1 bg-white flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;