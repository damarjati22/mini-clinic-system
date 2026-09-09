const db = require('../config/db');

// Simpan Resep Obat baru
exports.createPrescription = async (req, res) => {
    try {
        const { medical_record_id, patient_id, medicine_details } = req.body;

        if (!medical_record_id || !patient_id || !medicine_details) {
            return res.status(400).json({ success: false, message: 'Data resep obat tidak lengkap!' });
        }

        const [result] = await db.query(
            'INSERT INTO prescriptions (medical_record_id, patient_id, medicine_details) VALUES (?, ?, ?)',
            [medical_record_id, patient_id, medicine_details]
        );

        res.status(201).json({
            success: true,
            message: 'Resep obat berhasil disimpan!',
            prescriptionId: result.insertId
        });
    } catch (error) {
        console.error('Error createPrescription:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan resep obat.' });
    }
};

// Ambil Resep Obat berdasarkan ID atau Patient ID
exports.getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params; // Di sini id bisa merujuk pada patient_id atau prescription id sesuai kebutuhan
        const [prescriptions] = await db.query(
            `SELECT p.*, pat.name as patient_name, pat.no_rm 
             FROM prescriptions p
             JOIN patients pat ON p.patient_id = pat.id
             WHERE p.id = ? OR p.patient_id = ?`,
            [id, id]
        );

        res.status(200).json({
            success: true,
            data: prescriptions
        });
    } catch (error) {
        console.error('Error getPrescriptionById:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data resep obat.' });
    }
};