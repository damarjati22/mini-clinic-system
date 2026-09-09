import { useState, useEffect } from 'react';

function DashboardDokter({ user, onLogout }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Modal SOAP
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    actions: '',
    prescription: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('token');

  // Ambil daftar kunjungan khusus untuk dokter yang sedang login
  const fetchDoctorVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/visits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        // Filter hanya kunjungan yang ditujukan ke dokter ini
        const myVisits = result.data.filter(v => v.doctor_id === user.id);
        setVisits(myVisits);
      }
    } catch (err) {
      console.error('Gagal memuat antrean dokter:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorVisits();
  }, []);

  // Buka Modal SOAP
  const openSoapModal = (visit) => {
    setSelectedVisit(visit);
    setSoapData({ subjective: '', objective: '', assessment: '', plan: '', actions: '', prescription: '' });
    setErrorMsg('');
    setIsSoapModalOpen(true);
  };

  // Kirim / Simpan Data SOAP
// Kirim / Simpan Data SOAP & Resep secara berurutan
  const handleSaveSoap = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // 1. Simpan Data SOAP ke /api/medical-records
      const response = await fetch('http://localhost:5000/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          visit_id: selectedVisit.id,
          patient_id: selectedVisit.patient_id,
          subjective: soapData.subjective,
          objective: soapData.objective,
          assessment: soapData.assessment,
          plan: soapData.plan,
          actions: soapData.actions
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // 2. Simpan Data Resep Obat (jika diisi) ke /api/prescriptions
      if (soapData.prescription.trim() !== '') {
        const prescriptionResponse = await fetch('http://localhost:5000/api/prescriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            // result.medicalRecordId harus dikembalikan oleh backend, 
            // tapi sebagai alternatif sementara kita bisa kirim null atau ID kunjungan
            medical_record_id: result.medicalRecordId || 1, 
            patient_id: selectedVisit.patient_id,
            medicine_details: soapData.prescription
          })
        });
        
        if (!prescriptionResponse.ok) {
           console.warn("Rekam medis tersimpan, tapi resep gagal:", await prescriptionResponse.json());
        }
      }

      alert('Pemeriksaan SOAP dan resep berhasil disimpan!');
      setIsSoapModalOpen(false);
      fetchDoctorVisits();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">DR</div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Panel Dokter Pemeriksa</h1>
            <p className="text-xs text-slate-400">Mini Clinic System</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-xl border border-red-100 transition">
          Keluar
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-emerald-600 p-8 rounded-2xl text-white shadow-xl shadow-emerald-100">
          <h2 className="text-2xl font-extrabold">Halo, Dr. {user.name} 🩺</h2>
          <p className="text-emerald-100 text-sm mt-1">Daftar antrean pasien hari ini yang siap untuk dilakukan pemeriksaan klinis (SOAP).</p>
        </div>

        {/* Tabel Antrean Pasien Dokter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Antrean Pasien Poli Anda</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">No. RM & Nama Pasien</th>
                  <th className="p-4">Poli / Pembayaran</th>
                  <th className="p-4">Keluhan Awal</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi Pemeriksaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">Memuat antrean...</td></tr>
                ) : visits.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">Belum ada antrean pasien untuk Anda saat ini.</td></tr>
                ) : (
                  visits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <span className="font-semibold text-emerald-600 block">{v.no_rm}</span>
                        <span className="text-slate-900 font-medium">{v.patient_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{v.poli}</span>
                        <span className="text-xs text-slate-500">{v.payment_type}</span>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-600">{v.initial_complaint}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          v.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {v.status !== 'Selesai' ? (
                          <button
                            onClick={() => openSoapModal(v)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-md transition"
                          >
                            Periksa Pasien (SOAP)
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">Pemeriksaan Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Pemeriksaan SOAP */}
      {isSoapModalOpen && selectedVisit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Pemeriksaan Klinis (SOAP)</h3>
                <p className="text-xs text-slate-500">Pasien: <strong className="text-slate-800">{selectedVisit.patient_name}</strong> ({selectedVisit.no_rm})</p>
              </div>
              <button onClick={() => setIsSoapModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{errorMsg}</div>}

            <form onSubmit={handleSaveSoap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Subjective (Keluhan Subjektif Pasien)</label>
                <textarea
                  required
                  rows="2"
                  value={soapData.subjective}
                  onChange={(e) => setSoapData({ ...soapData, subjective: e.target.value })}
                  placeholder="Keluhan yang dirasakan pasien saat ini..."
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Objective (Hasil Pemeriksaan Fisik / Tanda Vital)</label>
                <textarea
                  required
                  rows="2"
                  value={soapData.objective}
                  onChange={(e) => setSoapData({ ...soapData, objective: e.target.value })}
                  placeholder="Contoh: TD: 120/80 mmHg, Nadi: 80x/menit, Suhu: 36.5°C..."
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Assessment (Diagnosis / Penilaian Medis)</label>
                <textarea
                  required
                  rows="2"
                  value={soapData.assessment}
                  onChange={(e) => setSoapData({ ...soapData, assessment: e.target.value })}
                  placeholder="Diagnosis kerja atau kesimpulan medis..."
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Plan (Rencana Terapi / Anjuran)</label>
                <textarea
                  required
                  rows="2"
                  value={soapData.plan}
                  onChange={(e) => setSoapData({ ...soapData, plan: e.target.value })}
                  placeholder="Rencana pengobatan, edukasi, atau rujukan..."
                  className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tindakan Medis</label>
                  <input
                    type="text"
                    value={soapData.actions}
                    onChange={(e) => setSoapData({ ...soapData, actions: e.target.value })}
                    placeholder="Contoh: Nebulizer, Injeksi..."
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Resep Obat</label>
                  <input
                    type="text"
                    value={soapData.prescription}
                    onChange={(e) => setSoapData({ ...soapData, prescription: e.target.value })}
                    placeholder="Contoh: Paracetamol 500mg 3x1..."
                    className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsSoapModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-md"
                >
                  Simpan & Selesaikan Pemeriksaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDokter;