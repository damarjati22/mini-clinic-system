const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function createUser() {
    try {
        const name = process.argv[2] || 'Admin Baru';
        const email = process.argv[3] || 'newadmin@miniclinic.com';
        const plainPassword = process.argv[4] || 'password123';
        const role = process.argv[5] || 'Administrator'; // Pilihan: Administrator, Dokter, Petugas Pendaftaran

        // Hash password menggunakan bcrypt
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Masukkan ke database
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        await db.query(query, [name, email, hashedPassword, role]);

        console.log(`✅ Berhasil membuat akun baru!`);
        console.log(`- Nama: ${name}`);
        console.log(`- Email: ${email}`);
        console.log(`- Password: ${plainPassword}`);
        console.log(`- Role: ${role}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Gagal membuat user:', error.message);
        process.exit(1);
    }
}

createUser();