# Mini Clinic System

Sistem Informasi Manajemen Klinik Pratama (Mini Clinic System) berbasis *Fullstack Web Application* (React Vite & Node.js/Express) yang dirancang untuk mengelola data pasien, pendaftaran kunjungan, antrean *real-time*, rekam medis elektronik (SOAP), dan manajemen resep obat.

---

🚀 Cara Instalasi Aplikasi
1. clone repository
git clone [https://github.com/USERNAME-ANDA/mini-clinic-system.git](https://github.com/USERNAME-ANDA/mini-clinic-system.git)
cd mini-clinic-system

2. Instal Dependensi Backend:
cd backend
npm install

3. Instal Dependensi Frontend:
cd ../frontend
npm install

🗄️ Cara Migrasi Database

1.Buat database baru di MySQL/phpMyAdmin dengan nama mini_clinic_db.
2.Impor struktur tabel yang dibutuhkan (tabel users, patients, visits, medical_records, prescriptions, dan blacklisted_tokens).

▶️ Cara Menjalankan Aplikasi

1. Jalankan Server Backend:

Buka terminal baru, arahkan ke folder backend, lalu jalankan:
cd backend
npm run dev

2. Jalankan Aplikasi Frontend (Vite):
Buka terminal terpisah, arahkan ke folder frontend, lalu jalankan:
cd frontend
npm run dev

🔑 Akun Login (Default / Seeding)
Anda dapat masuk menggunakan akun dengan peran (role) berikut yang sudah terdaftar di database:

Administrator
Email: damar@miniclinic.com
Password: password123

Petugas Pendaftaran
Email: bagas@miniclinic.com
Password: password123

Dokter Pemeriksa
Email: andi@miniclinic.com
Password: password123

## 📂 Struktur Project

```text
mini-clinic-system/
├── backend/
│   ├── src/
│   │   ├── config/        # Konfigurasi database (db.js)
│   │   ├── controllers/   # Logika bisnis (auth, patient, visit, medical, prescription, dashboard)
│   │   ├── middleware/    # Autentikasi JWT & Role Authorization
│   │   ├── routes/        # Rute API REST minimum
│   │   └── index.js       # Titik masuk utama server Express
│   └── .env.example       # Template variabel lingkungan backend
├── frontend/
│   ├── src/
│   │   ├── admin/         # Modul panel Administrator
│   │   ├── dokter/        # Modul panel Dokter (SOAP & Resep)
│   │   ├── petugaspendaftaran/ # Modul Pasien, Kunjungan, & Antrean
│   │   ├── App.jsx        # Root komponen & router views
│   │   └── main.jsx       # Entry point React
│   └── package.json
└── README.md



