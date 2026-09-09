import { useState, useEffect } from 'react';

function VisitManagement() {
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    poli: 'Poli Umum',
    visit_date: new Date().toISOString().split('T')[0],
    payment_type: 'Umum',
    initial_complaint: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resVisits, resPatients, resDoctors] = await Promise.all([
        fetch('http://localhost:5000/api/visits', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('http://localhost:5000/api/patients?limit=100', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('http://localhost:5000/api/auth/doctors', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);

      if (resVisits.success) setVisits(resVisits.data);
      if (resPatients.success) setPatients(resPatients.data);
      if (resDoctors.success) setDoctors(resDoctors.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan pendaftaran.');
      }

      alert(result.message);
      setIsModalOpen(false);
      
      setFormData({
        patient_id: '',
        doctor_id: '',
        poli: 'Poli Umum',
        visit_date: new Date().toISOString().split('T')[0],
        payment_type: 'Umum',
        initial_complaint: ''
      });

      fetchData();
    } catch (err) {
      console.error('Error submit visit:', err);
      setErrorMsg(err.message);
    }
  };

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
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pendaftaran Kunjungan Pasien</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola antrean poli dan pendaftaran harian pasien.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition text-sm flex items-center space-x-2"
        >
          <span>+ Daftarkan Kunjungan Baru</span>
        </button>
      </div>

      {/* Tabel Data Kunjungan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 text-center">No. Antrean</th>
                <th className="p-4">No. RM & Pasien</th>
                <th className="p-4">Poli & Dokter Tujuan</th>
                <th className="p-4">Tanggal & Pembayaran</th>
                <th className="p-4">Keluhan Awal</th>
                <th className="p-4 text-center">Status Antrean</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-400">Memuat data...</td></tr>
              ) : visits.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-400">Belum ada kunjungan pasien terdaftar.</td></tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-sm rounded-lg border border-blue-100">
                        {v.queue_number || '-'}
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
                    <td className="p-4">
                      <span className="block">{v.visit_date ? v.visit_date.split('T')[0] : '-'}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-md font-medium">{v.payment_type}</span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-600">{v.initial_complaint}</td>
                    <td className="p-4 text-center">
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusChange(v.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border focus:ring-2 focus:ring-blue-500 ${
                          v.status === 'Menunggu' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          v.status === 'Check In' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          v.status === 'Pemeriksaan' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Check In">Check In</option>
                        <option value="Pemeriksaan">Pemeriksaan</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Pendaftaran Kunjungan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-lg font-bold text-slate-800">Form Pendaftaran Kunjungan Pasien</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Pilih Pasien Terdaftar</label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Pasien (Berdasarkan Master Data) --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.no_rm} - {p.name} ({p.nik})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Poli Tujuan</label>
                  <select
                    value={formData.poli}
                    onChange={(e) => setFormData({ ...formData, poli: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Poli Umum">Poli Umum</option>
                    <option value="Poli Gigi">Poli Gigi</option>
                    <option value="Poli Anak">Poli Anak</option>
                    <option value="Poli KIA">Poli KIA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Dokter Pemeriksa</label>
                  <select
                    required
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>Dr. {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    required
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Jenis Pembayaran</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Umum">Umum</option>
                    <option value="BPJS">BPJS</option>
                    <option value="Asuransi Lain">Asuransi Lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Keluhan Awal Pasien</label>
                <textarea
                  required
                  rows="3"
                  value={formData.initial_complaint}
                  onChange={(e) => setFormData({ ...formData, initial_complaint: e.target.value })}
                  placeholder="Deskripsikan keluhan utama pasien..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-md"
                >
                  Simpan Pendaftaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisitManagement;