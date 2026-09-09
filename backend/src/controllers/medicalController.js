const db = require('../config/db');

// Ambil rekam medis berdasarkan visit_id atau patient_id
exports.getMedicalRecordByVisit = async (req, res) => {
    try {
        const { visitId } = req.params;
        const [records] = await db.query(
            `SELECT mr.*, u.name as doctor_name 
             FROM medical_records mr
             JOIN users u ON mr.doctor_id = u.id
             WHERE mr.visit_id = ?`,
            [visitId]
        );

        res.status(200).json({
            success: true,
            data: records.length > 0 ? records[0] : null
        });
    } catch (error) {
        console.error('Error getMedicalRecordByVisit:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat rekam medis.' });
    }
};

exports.getMedicalRecordByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const [records] = await db.query(
            `SELECT mr.*, u.name as doctor_name, v.visit_date, v.poli 
             FROM medical_records mr
             JOIN users u ON mr.doctor_id = u.id
             JOIN visits v ON mr.visit_id = v.id
             WHERE mr.patient_id = ?
             ORDER BY mr.id DESC`,
            [patientId]
        );

        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('Error getMedicalRecordByPatient:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat rekam medis pasien.' });
    }
};

// Simpan Rekam Medis (SOAP) & Ubah Status Kunjungan jadi 'Selesai'
exports.createMedicalRecord = async (req, res) => {
    try {
        const { visit_id, patient_id, subjective, objective, assessment, plan, actions, prescription } = req.body;
        const doctor_id = req.user.id; // Diambil dari token JWT dokter yang sedang login

        if (!visit_id || !patient_id || !subjective || !objective || !assessment || !plan) {
            return res.status(400).json({ success: false, message: 'Form SOAP (S, O, A, P) wajib diisi lengkap!' });
        }

        // Simpan rekam medis
        await db.query(
            `INSERT INTO medical_records (visit_id, patient_id, doctor_id, subjective, objective, assessment, plan, actions, prescription) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [visit_id, patient_id, doctor_id, subjective, objective, assessment, plan, actions || '-', prescription || '-']
        );

        // Otomatis ubah status kunjungan menjadi 'Selesai'
        await db.query("UPDATE visits SET status = 'Selesai' WHERE id = ?", [visit_id]);

        res.status(201).json({
            success: true,
            message: 'Pemeriksaan SOAP berhasil disimpan dan status kunjungan selesai!'
        });
    } catch (error) {
        console.error('Error createMedicalRecord:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan rekam medis.' });
    }
};