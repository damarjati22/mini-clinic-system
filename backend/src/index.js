const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./utils/cleanupBlacklist');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes'); 
const medicalRoutes = require('./routes/medicalRoutes');
const dashboardRoute = require('./routes/dashboardRoute');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const queueRoutes = require('./routes/queueRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Daftarkan Endpoint API
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes); 
app.use('/api/medical-records', medicalRoutes);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/queues', queueRoutes);



app.get('/', (req, res) => {
    res.json({ message: 'Selamat datang di API Mini Clinic System!' });
});

app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});