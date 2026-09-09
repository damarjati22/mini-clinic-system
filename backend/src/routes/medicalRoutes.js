const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

// Hanya Dokter (dan Admin untuk monitoring) yang dapat mengakses rekam medis
router.get('/visit/:visitId', medicalController.getMedicalRecordByVisit);
router.post('/', authorizeRoles('Dokter', 'Administrator'), medicalController.createMedicalRecord);

module.exports = router;