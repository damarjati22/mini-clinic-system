import React from 'react';

function Sidebar({ user, currentView, onNavigate, onLogout }) {
  const getMenuItems = () => {
    const role = user?.role;
    
    if (role === 'Administrator') {
      return [
        { id: 'dashboard', label: 'Dashboard Utama', icon: '🏠' },
        { id: 'patients', label: 'Master Data Pasien', icon: '👥' },
        { id: 'queue', label: 'Live Display Antrean', icon: '🎟️' },
        { id: 'visits', label: 'Pendaftaran Kunjungan', icon: '📋' },
      ];
    } else if (role === 'Petugas Pendaftaran') {
      return [
        { id: 'dashboard', label: 'Dashboard Utama', icon: '🏠' },
        { id: 'patients', label: 'Master Data Pasien', icon: '👥' },
        { id: 'visits', label: 'Pendaftaran Kunjungan', icon: '📋' },
        { id: 'queue', label: 'Live Display Antrean', icon: '🎟️' },
      ];
    } else if (role === 'Dokter') {
      return [
        { id: 'dashboard', label: 'Antrean Pemeriksaan', icon: '🩺' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-72 bg-[#f6f6f8] text-slate-700 flex flex-col justify-between h-screen border-r border-slate-200/80 select-none flex-shrink-0">
      {/* Bagian Atas: Simbol Traffic Light macOS & Kolom Search */}
      <div className="p-4 space-y-4">
        {/* Tombol Window ala macOS (Merah, Kuning, Hijau) */}
        <div className="flex items-center space-x-2 px-2 pt-1">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
        </div>

        {/* Menu Navigasi Utama */}
        <div className="space-y-0.5 pt-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0061ff] text-white shadow-sm font-semibold'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bagian Bawah: Profil Ringkas & Tombol Keluar */}
      <div className="p-4 border-t border-slate-200/60 bg-[#f0f0f3]/50">
        <div className="flex items-center space-x-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden leading-tight">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white hover:bg-red-55 hover:text-red-600 text-slate-600 font-medium text-xs rounded-lg border border-slate-200/80 shadow-2xs transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;