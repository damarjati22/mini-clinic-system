function DashboardAdmin({ user, onLogout, onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">AD</div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Panel Administrator</h1>
            <p className="text-xs text-slate-400">Mini Clinic System</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-600 font-medium text-sm rounded-xl border border-red-100">Keluar</button>
      </nav>
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-purple-600 p-8 rounded-2xl text-white shadow-xl">
          <h2 className="text-2xl font-extrabold">Selamat Datang, Administrator {user.name} 🚀</h2>
          <p className="text-purple-100 text-sm mt-1">Anda memiliki akses penuh untuk memantau seluruh sistem dan antrean klinik.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => onNavigate('patients')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-800">Master Data Pasien</h3>
            <p className="text-xs text-slate-500 mt-1">Tambah, ubah, hapus, dan cari rekam medis pasien.</p>
          </div>
          <div onClick={() => onNavigate('queue')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer">
            <h3 className="text-lg font-bold text-slate-800">Monitoring Antrean</h3>
            <p className="text-xs text-slate-500 mt-1">Pantau nomor antrean otomatis dan status pelayanan poli.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-60">
            <h3 className="text-lg font-bold text-slate-800">Manajemen Pengguna Staf</h3>
            <p className="text-xs text-slate-500 mt-1">Atur akun dokter dan petugas pendaftaran.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;