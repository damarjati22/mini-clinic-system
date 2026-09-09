const express = require('express');
const router = express.Router(); // <-- Inisialisasi router di sini
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

// Endpoint Login, Logout & Profil
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

// Endpoint untuk mengambil list dokter (Digunakan pada Form Pendaftaran Kunjungan)
router.get('/doctors', verifyToken, async (req, res) => {
    try {
        const [doctors] = await db.query("SELECT id, name, email FROM users WHERE role = 'Dokter'");
        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error('Error get doctors:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data dokter.' });
    }
});

module.exports = router;