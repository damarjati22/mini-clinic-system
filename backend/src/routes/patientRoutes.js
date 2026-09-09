const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Semua route pasien memerlukan autentikasi
router.use(verifyToken);

router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.post('/', authorizeRoles('Administrator', 'Petugas Pendaftaran'), patientController.createPatient);
router.put('/:id', authorizeRoles('Administrator', 'Petugas Pendaftaran'), patientController.updatePatient);
router.delete('/:id', authorizeRoles('Administrator', 'Petugas Pendaftaran'), patientController.deletePatient);

module.exports = router;