const db = require('../config/db');

const cleanupExpiredTokens = async () => {
    try {
        await db.query('DELETE FROM blacklisted_tokens WHERE expired_at < NOW()');
        console.log('Blacklist token expired berhasil dibersihkan.');
    } catch (error) {
        console.error('Gagal membersihkan blacklist:', error);
    }
};

// Jalankan setiap 1 jam
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = cleanupExpiredTokens;