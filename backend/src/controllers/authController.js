const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Pastikan menggunakan exports.login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi!' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email atau password salah!' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'super_secret_mini_clinic_key_2026',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error pada login:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

// ============================
// LOGOUT (Token Blacklist)
// ============================
exports.logout = async (req, res) => {
    try {
        // Ambil token dari header Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token tidak ditemukan.'
            });
        }

        // Decode token untuk ambil waktu expired aslinya
        const decoded = jwt.decode(token);
        const expiredAt = new Date(decoded.exp * 1000); // exp dalam format unix timestamp (detik)

        // Simpan token ke blacklist supaya tidak bisa dipakai lagi
        await db.query(
            'INSERT INTO blacklisted_tokens (token, user_id, expired_at) VALUES (?, ?, ?)',
            [token, req.user.id, expiredAt]
        );

        res.status(200).json({
            success: true,
            message: 'Logout berhasil. Token telah dinonaktifkan.'
        });

    } catch (error) {
        console.error('Error pada logout:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

// Pastikan menggunakan exports.getProfile
exports.getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};