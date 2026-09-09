const db = require('../config/db');

// Fungsi untuk generate Nomor Rekam Medis otomatis (Contoh: RM-202609-0001)
const generateNoRM = async () => {
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `RM-${yearMonth}-`;

    const [rows] = await db.query(
        'SELECT no_rm FROM patients WHERE no_rm LIKE ? ORDER BY id DESC LIMIT 1',
        [`${prefix}%`]
    );

    let sequence = 1;
    if (rows.length > 0) {
        const lastNoRM = rows[0].no_rm;
        const lastSeq = parseInt(lastNoRM.split('-')[2], 10);
        sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Ambil semua data pasien (dengan pencarian & pagination)
exports.getPatients = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM patients';
        let countQuery = 'SELECT COUNT(*) as total FROM patients';
        let queryParams = [];

        if (search) {
            query += ' WHERE name LIKE ? OR nik LIKE ? OR no_rm LIKE ?';
            countQuery += ' WHERE name LIKE ? OR nik LIKE ? OR no_rm LIKE ?';
            const searchTerm = `%${search}%`;
            queryParams = [searchTerm, searchTerm, searchTerm];
        }

        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        
        // Eksekusi query dengan konversi integer untuk limit & offset
        const [patients] = await db.query(query, [...queryParams, parseInt(limit), parseInt(offset)]);
        const [countResult] = await db.query(countQuery, queryParams);
        
        const total = countResult[0].total;

        res.status(200).json({
            success: true,
            data: patients,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getPatients:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data pasien.' });
    }
};

// Tambah Data Pasien
exports.createPatient = async (req, res) => {
    try {
        const { nik, name, gender, birth_date, phone, address } = req.body;

        if (!nik || !name || !gender || !birth_date || !phone || !address) {
            return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi!' });
        }

        // Validasi NIK tidak boleh duplikat
        const [existingNik] = await db.query('SELECT id FROM patients WHERE nik = ?', [nik]);
        if (existingNik.length > 0) {
            return res.status(400).json({ success: false, message: 'Nomor NIK sudah terdaftar!' });
        }

        // Generate No RM Otomatis
        const no_rm = await generateNoRM();

        await db.query(
            'INSERT INTO patients (no_rm, nik, name, gender, birth_date, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [no_rm, nik, name, gender, birth_date, phone, address]
        );

        res.status(201).json({ success: true, message: 'Data pasien berhasil ditambahkan!', no_rm });
    } catch (error) {
        console.error('Error createPatient:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan data pasien.' });
    }
};

// Ubah Data Pasien
exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { nik, name, gender, birth_date, phone, address } = req.body;

        // Cek duplikasi NIK jika NIK diubah
        const [existingNik] = await db.query('SELECT id FROM patients WHERE nik = ? AND id != ?', [nik, id]);
        if (existingNik.length > 0) {
            return res.status(400).json({ success: false, message: 'Nomor NIK sudah digunakan oleh pasien lain!' });
        }

        await db.query(
            'UPDATE patients SET nik = ?, name = ?, gender = ?, birth_date = ?, phone = ?, address = ? WHERE id = ?',
            [nik, name, gender, birth_date, phone, address, id]
        );

        res.status(200).json({ success: true, message: 'Data pasien berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updatePatient:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui data pasien.' });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);

        if (patients.length === 0) {
            return res.status(404).json({ success: false, message: 'Data pasien tidak ditemukan.' });
        }

        res.status(200).json({ success: true, data: patients[0] });
    } catch (error) {
        console.error('Error getPatientById:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat detail pasien.' });
    }
};

// Hapus Data Pasien
exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM patients WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Data pasien berhasil dihapus!' });
    } catch (error) {
        console.error('Error deletePatient:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data pasien.' });
    }
};