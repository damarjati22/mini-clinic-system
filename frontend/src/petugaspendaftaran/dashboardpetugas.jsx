import { useState, useEffect } from 'react';

function DashboardPetugas({ user, onNavigate }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPatientsToday: 0,
    totalQueueToday: 0,
    totalWaiting: 0,
    totalFinished: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const token = localStorage.getItem('token');

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
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-6 font-sans">
      {/* Banner Sambutan */}
      <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl shadow-blue-100">
        <h2 className="text-2xl font-extrabold">Halo, {user.name} 📋</h2>
        <p className="text-blue-100 text-sm mt-1">Kelola pendaftaran pasien baru, kunjungan klinik, dan pemantauan antrean secara real-time.</p>
      </div>

      {/* Dashboard Stats */}
      {loadingStats ? (
        <div className="text-sm text-slate-400 text-center py-4">Memuat ringkasan statistik...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pasien</p>
            <div className="flex items-baseline justify-between mt-3">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalPatients}</h3>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">👥</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pasien Hari Ini</p>
            <div className="flex items-baseline justify-between mt-3">
              <h3 className="text-3xl font-extrabold text-indigo-600">{stats.totalPatientsToday}</h3>
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">📅</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Antrean Hari Ini</p>
            <div className="flex items-baseline justify-between mt-3">
              <h3 className="text-3xl font-extrabold text-blue-600">{stats.totalQueueToday}</h3>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">🎟️</span>
            </div>
          </div>
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pasien Menunggu</p>
            <div className="flex items-baseline justify-between mt-3">
              <h3 className="text-3xl font-extrabold text-amber-700">{stats.totalWaiting}</h3>
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">⏳</span>
            </div>
          </div>
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
        <div 
          onClick={() => onNavigate('patients')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-lg font-bold text-slate-800">Master Data Pasien</h3>
            <p className="text-xs text-slate-500 mt-1">Daftarkan pasien baru, ubah data identitas, validasi NIK, dan cetak No RM.</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Buka Modul</span> &rarr;
          </span>
        </div>

        <div 
          onClick={() => onNavigate('visits')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="text-lg font-bold text-slate-800">Pendaftaran Kunjungan</h3>
            <p className="text-xs text-slate-500 mt-1">Kelola antrean poli, pilih dokter, jenis pembayaran, dan keluhan awal pasien.</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Buka Modul</span> &rarr;
          </span>
        </div>

        <div 
          onClick={() => onNavigate('queue')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">🎟️</div>
            <h3 className="text-lg font-bold text-slate-800">Live Display Antrean</h3>
            <p className="text-xs text-slate-500 mt-1">Pantau nomor antrean otomatis (A001, B001) secara real-time dan kelola status panggilan.</p>
          </div>
          <span className="text-xs font-semibold text-amber-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
            <span>Buka Modul</span> &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardPetugas;