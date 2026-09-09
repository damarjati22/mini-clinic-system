const db = require('../config/db');

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