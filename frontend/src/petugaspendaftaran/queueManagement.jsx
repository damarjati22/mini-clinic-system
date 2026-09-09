import { useState, useEffect } from 'react';

function QueueManagement({ onBack, user }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPoli, setFilterPoli] = useState('Semua');

  const token = localStorage.getItem('token');

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/visits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setVisits(result.data);
      }
    } catch (err) {
      console.error('Gagal memuat antrean:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
    // Auto-refresh antrean setiap 10 detik untuk tampilan live-display
    const interval = setInterval(fetchVisits, 10000);
    return () => clearInterval(interval);
  }, []);

  // Ubah status antrean (Menunggu -> Check In -> Pemeriksaan -> Selesai)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/visits/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      fetchVisits();
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter antrean berdasarkan poli
  const filteredVisits = filterPoli === 'Semua' 
    ? visits 
    : visits.filter(v => v.poli === filterPoli);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center space-x-1">
                <span>← Kembali</span>
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-800">Modul Antrean Pasien (Live Display)</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Filter Poli:</span>
            <select
              value={filterPoli}
              onChange={(e) => setFilterPoli(e.target.value)}
              className="px-3 py-2 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Poli</option>
              <option value="Poli Umum">Poli Umum</option>
              <option value="Poli Gigi">Poli Gigi</option>
              <option value="Poli Anak">Poli Anak</option>
              <option value="Poli KIA">Poli KIA</option>
            </select>
          </div>
        </div>

        {/* Ringkasan Kartu Antrean Aktif */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Antrean Hari Ini</p>
            <h4 className="text-2xl font-extrabold text-slate-800 mt-1">{filteredVisits.length} Pasien</h4>
          </div>
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-xs font-semibold text-amber-600 uppercase">Menunggu</p>
            <h4 className="text-2xl font-extrabold text-amber-700 mt-1">
              {filteredVisits.filter(v => v.status === 'Menunggu').length}
            </h4>
          </div>
          <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 shadow-sm">
            <p className="text-xs font-semibold text-purple-600 uppercase">Sedang Diperiksa</p>
            <h4 className="text-2xl font-extrabold text-purple-700 mt-1">
              {filteredVisits.filter(v => v.status === 'Pemeriksaan').length}
            </h4>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600 uppercase">Selesai</p>
            <h4 className="text-2xl font-extrabold text-emerald-700 mt-1">
              {filteredVisits.filter(v => v.status === 'Selesai').length}
            </h4>
          </div>
        </div>

        {/* Tabel Daftar Antrean */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 text-center">Nomor Antrean</th>
                  <th className="p-4">No. RM & Nama Pasien</th>
                  <th className="p-4">Poli & Dokter Tujuan</th>
                  <th className="p-4">Keluhan Awal</th>
                  <th className="p-4 text-center">Status Antrean</th>
                  <th className="p-4 text-center">Aksi Panggilan / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">Memuat data antrean...</td></tr>
                ) : filteredVisits.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">Tidak ada antrean pada poli ini.</td></tr>
                ) : (
                  filteredVisits.map((v) => (
                    <tr key={v.id} className={`transition ${v.status === 'Pemeriksaan' ? 'bg-purple-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1.5 bg-blue-600 text-white font-extrabold text-base rounded-xl shadow-md shadow-blue-100">
                          {v.queue_number || 'A001'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-blue-600 block">{v.no_rm}</span>
                        <span className="text-slate-900 font-medium">{v.patient_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{v.poli}</span>
                        <span className="text-xs text-slate-500">Dr. {v.doctor_name}</span>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-600">{v.initial_complaint}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'Menunggu' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          v.status === 'Check In' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          v.status === 'Pemeriksaan' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        {/* Tombol Pintasan Cepat Ubah Status / Panggil Antrean */}
                        {v.status === 'Menunggu' && (
                          <button
                            onClick={() => handleStatusChange(v.id, 'Check In')}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-medium rounded-xl text-xs transition"
                          >
                            Check In
                          </button>
                        )}
                        {v.status === 'Check In' && (
                          <button
                            onClick={() => handleStatusChange(v.id, 'Pemeriksaan')}
                            className="px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 font-medium rounded-xl text-xs shadow-sm transition"
                          >
                            🔊 Panggil Masuk
                          </button>
                        )}
                        {v.status === 'Pemeriksaan' && (
                          <button
                            onClick={() => handleStatusChange(v.id, 'Selesai')}
                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-medium rounded-xl text-xs shadow-sm transition"
                          >
                            Selesaikan
                          </button>
                        )}
                        {v.status === 'Selesai' && (
                          <span className="text-xs text-slate-400 font-medium">Selesai Dilayani</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default QueueManagement;