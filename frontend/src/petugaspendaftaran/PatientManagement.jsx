import { useState, useEffect } from 'react';

function PatientManagement({ onBack, user }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
  const [currentId, setCurrentId] = useState(null);
  
  // State Input Form
  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    gender: 'Laki-laki',
    birth_date: '',
    phone: '',
    address: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('token');

  // Ambil Data Pasien dari Backend
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await httpGet(`http://localhost:5000/api/patients?search=${search}&page=${page}&limit=5`, token);
      if (res.success) {
        setPatients(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Gagal mengambil data pasien:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, page]);

  // Helper Fetch GET
  const httpGet = async (url, token) => {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  };

  // Handle Submit Form (Tambah / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const url = modalMode === 'add' 
      ? 'http://localhost:5000/api/patients' 
      : `http://localhost:5000/api/patients/${currentId}`;
    
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan data.');
      }

      alert(result.message);
      setIsModalOpen(false);
      fetchPatients();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Handle Hapus Pasien
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert(result.message);
      fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  // Buka Modal Tambah
  const openAddModal = () => {
    setModalMode('add');
    setFormData({ nik: '', name: '', gender: 'Laki-laki', birth_date: '', phone: '', address: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const openEditModal = (patient) => {
    setModalMode('edit');
    setCurrentId(patient.id);
    setFormData({
      nik: patient.nik,
      name: patient.name,
      gender: patient.gender,
      birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
      phone: patient.phone,
      address: patient.address
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Hak akses: Apakah user bisa menambah/edit (Admin & Petugas Pendaftaran)
  const canModify = user?.role === 'Administrator' || user?.role === 'Petugas Pendaftaran';

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center space-x-3">
              {onBack && (
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  <span>Kembali</span>
                </button>
              )}
              <h1 className="text-2xl font-bold text-slate-800">Master Data Pasien</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Kelola data rekam medis pasien klinik dengan mudah.</p>
          </div>

          {canModify && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              <span>Tambah Pasien Baru</span>
            </button>
          )}
        </div>

        {/* Pencarian */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <input
            type="text"
            placeholder="Cari berdasarkan Nama, NIK, atau Nomor RM..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabel Data Pasien */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">No. RM & NIK</th>
                  <th className="p-4">Nama Pasien</th>
                  <th className="p-4">Gender / Tgl Lahir</th>
                  <th className="p-4">No. Telepon</th>
                  <th className="p-4">Alamat</th>
                  {canModify && <th className="p-4 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">Memuat data...</td></tr>
                ) : patients.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-400">Tidak ada data pasien ditemukan.</td></tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <span className="font-semibold text-blue-600 block">{p.no_rm}</span>
                        <span className="text-xs text-slate-400">NIK: {p.nik}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-900">{p.name}</td>
                      <td className="p-4">
                        <span>{p.gender}</span>
                        <span className="block text-xs text-slate-400">{p.birth_date ? p.birth_date.split('T')[0] : '-'}</span>
                      </td>
                      <td className="p-4">{p.phone}</td>
                      <td className="p-4 max-w-xs truncate">{p.address}</td>
                      {canModify && (
                        <td className="p-4 text-center space-x-2">
                          <button onClick={() => openEditModal(p)} className="text-amber-600 hover:text-amber-800 font-medium text-xs bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Ubah</button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Hapus</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>Halaman {page} dari {totalPages || 1}</span>
            <div className="space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Form Tambah/Ubah Pasien */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'add' ? 'Tambah Data Pasien' : 'Ubah Data Pasien'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">NIK (16 Digit)</label>
                <input
                  type="text"
                  maxLength="16"
                  required
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Contoh: 3271xxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nama Lengkap Pasien</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Alamat Lengkap</label>
                <textarea
                  required
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat domisili pasien..."
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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default PatientManagement;