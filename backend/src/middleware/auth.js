const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware untuk verifikasi token JWT
exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan!' });
    }

    try {
        // Cek apakah token sudah di-blacklist (user sudah logout)
        const [blacklisted] = await db.query(
            'SELECT id FROM blacklisted_tokens WHERE token = ?',
            [token]
        );

        if (blacklisted.length > 0) {
            return res.status(401).json({
                success: false,
                message: 'Sesi sudah berakhir. Silakan login kembali.'
            });
        }

        // Verifikasi token JWT
        jwt.verify(token, process.env.JWT_SECRET || 'super_secret_mini_clinic_key_2026', (err, user) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa!' });
            }
            req.user = user; // Menyimpan data payload user ke request
            next();
        });

    } catch (error) {
        console.error('Error verifyToken:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat verifikasi token.' });
    }
};

// Middleware untuk membatasi akses berdasarkan role tertentu
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Akses dilarang. Peran '${req.user ? req.user.role : 'Unknown'}' tidak memiliki izin untuk fitur ini.` 
            });
        }
        next();
    };
};