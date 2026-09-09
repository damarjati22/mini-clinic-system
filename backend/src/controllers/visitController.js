const db = require('../config/db');

// Fungsi helper untuk generate nomor antrean otomatis
const generateQueueNumber = async (poli) => {
    let prefix = 'A';
    if (poli === 'Poli Gigi') prefix = 'B';
    else if (poli === 'Poli Anak') prefix = 'C';
    else if (poli === 'Poli KIA') prefix = 'D';

    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
        `SELECT queue_number FROM visits 
         WHERE poli = ? AND DATE(visit_date) = ? 
         ORDER BY id DESC LIMIT 1`,
        [poli, today]
    );

    let sequence = 1;
    if (rows.length > 0 && rows[0].queue_number) {
        const lastQueue = rows[0].queue_number;
        const lastSeq = parseInt(lastQueue.replace(/[^0-9]/g, ''), 10);
        sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
};

// 1. Ambil semua data pendaftaran kunjungan
exports.getVisits = async (req, res) => {
    try {
        const query = `
            SELECT v.*, 
            p.name as patient_name, p.no_rm, p.nik, 
            u.name as doctor_name 
            FROM visits v
            JOIN patients p ON v.patient_id = p.id
            JOIN users u ON v.doctor_id = u.id
            ORDER BY v.id DESC
        `;
        const [visits] = await db.query(query);

        res.status(200).json({
            success: true,
            data: visits
        });
    } catch (error) {
        console.error('Error getVisits:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data pendaftaran.' });
    }
};

// 2. Tambah Pendaftaran Kunjungan Baru
exports.createVisit = async (req, res) => {
    try {
        const { patient_id, doctor_id, poli, visit_date, payment_type, initial_complaint } = req.body;

        if (!patient_id || !doctor_id || !poli || !visit_date || !payment_type || !initial_complaint) {
            return res.status(400).json({ success: false, message: 'Semua kolom pendaftaran wajib diisi!' });
        }

        const queue_number = await generateQueueNumber(poli);

        const [result] = await db.query(
            `INSERT INTO visits (queue_number, patient_id, doctor_id, poli, visit_date, payment_type, initial_complaint, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu')`,
            [queue_number, patient_id, doctor_id, poli, visit_date, payment_type, initial_complaint]
        );

        res.status(201).json({ 
            success: true, 
            message: `Pendaftaran berhasil! Nomor antrean: ${queue_number}`,
            queue_number,
            visitId: result.insertId 
        });
    } catch (error) {
        console.error('Error createVisit:', error);
        res.status(500).json({ success: false, message: 'Gagal melakukan pendaftaran pasien.' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [totalPatientsRes] = await db.query('SELECT COUNT(*) as total FROM patients');
        const [todayVisitsRes] = await db.query('SELECT COUNT(*) as total FROM visits WHERE DATE(visit_date) = ?', [today]);
        const [statusRes] = await db.query(`
            SELECT 
                SUM(CASE WHEN status IN ('Menunggu', 'Check In') THEN 1 ELSE 0 END) as waiting,
                SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as finished,
                COUNT(*) as total_queue
            FROM visits WHERE DATE(visit_date) = ?
        `, [today]);

        const stats = {
            totalPatients: totalPatientsRes[0].total || 0,
            totalPatientsToday: todayVisitsRes[0].total || 0,
            totalQueueToday: statusRes[0].total_queue || 0,
            totalWaiting: statusRes[0].waiting || 0,
            totalFinished: statusRes[0].finished || 0
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getDashboardStats:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard.' });
    }
};

// 3. Update Status Kunjungan
exports.updateVisitStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Menunggu', 'Check In', 'Pemeriksaan', 'Selesai'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status kunjungan tidak valid!' });
        }

        await db.query('UPDATE visits SET status = ? WHERE id = ?', [status, id]);

        res.status(200).json({ success: true, message: `Status kunjungan berhasil diubah menjadi ${status}!` });
    } catch (error) {
        console.error('Error updateVisitStatus:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status kunjungan.' });
    }
};