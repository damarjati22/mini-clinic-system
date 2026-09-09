import { useState, useEffect } from 'react';

function DashboardPetugas({ user, onLogout, onNavigate }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPatientsToday: 0,
    totalQueueToday: 0,
    totalWaiting: 0,
    totalFinished: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const token = localStorage.getItem('token');

  // Ambil data statistik dashboard secara real-time
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (err) {
        console.error('Gagal mengambil statistik:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Auto-refresh tiap 15 detik
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">PT</div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Panel Petugas Pendaftaran</h1>
            <p className="text-xs text-slate-400">Mini Clinic System</p>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-xl border border-red-100 transition"
        >
          Keluar
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Banner Sambutan */}
        <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl shadow-blue-100">
          <h2 className="text-2xl font-extrabold">Halo, {user.name} 📋</h2>
          <p className="text-blue-100 text-sm mt-1">Kelola pendaftaran pasien baru, kunjungan klinik, dan pemantauan antrean secara real-time.</p>
        </div>

        {/* Dashboard Stats (Digabung Langsung Disini) */}
        {loadingStats ? (
          <div className="text-sm text-slate-400 text-center py-4">Memuat ringkasan statistik...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Total Pasien */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pasien</p>
              <div className="flex items-baseline justify-between mt-3">
                <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalPatients}</h3>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">👥</span>
              </div>
            </div>

            {/* 2. Total Pasien Hari Ini */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pasien Hari Ini</p>
              <div className="flex items-baseline justify-between mt-3">
                <h3 className="text-3xl font-extrabold text-indigo-600">{stats.totalPatientsToday}</h3>
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">📅</span>
              </div>
            </div>

            {/* 3. Total Antrean Hari Ini */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Antrean Hari Ini</p>
              <div className="flex items-baseline justify-between mt-3">
                <h3 className="text-3xl font-extrabold text-blue-600">{stats.totalQueueToday}</h3>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">🎟️</span>
              </div>
            </div>

            {/* 4. Total Pasien Menunggu */}
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pasien Menunggu</p>
              <div className="flex items-baseline justify-between mt-3">
                <h3 className="text-3xl font-extrabold text-amber-700">{stats.totalWaiting}</h3>
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">⏳</span>
              </div>
            </div>

            {/* 5. Total Pasien Selesai Dilayani */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Selesai Dilayani</p>
              <div className="flex items-baseline justify-between mt-3">
                <h3 className="text-3xl font-extrabold text-emerald-700">{stats.totalFinished}</h3>
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✅</span>
              </div>
            </div>

          </div>
        )}

        {/* Grid Menu Navigasi Modul Petugas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Menu 1: Master Data Pasien */}
          <div 
            onClick={() => onNavigate('patients')} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Master Data Pasien</h3>
              <p className="text-xs text-slate-500 mt-1">Daftarkan pasien baru, ubah data identitas, validasi NIK, dan cetak No RM.</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Buka Modul</span> &rarr;
            </span>
          </div>

          {/* Menu 2: Pendaftaran Kunjungan */}
          <div 
            onClick={() => onNavigate('visits')} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Pendaftaran Kunjungan</h3>
              <p className="text-xs text-slate-500 mt-1">Kelola antrean poli, pilih dokter, jenis pembayaran, dan keluhan awal pasien.</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Buka Modul</span> &rarr;
            </span>
          </div>

          {/* Menu 3: Modul Antrean */}
          <div 
            onClick={() => onNavigate('queue')} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Live Display Antrean</h3>
              <p className="text-xs text-slate-500 mt-1">Pantau nomor antrean otomatis (A001, B001) secara real-time dan kelola status panggilan.</p>
            </div>
            <span className="text-xs font-semibold text-amber-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Buka Modul</span> &rarr;
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}

export default DashboardPetugas;