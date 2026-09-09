const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', authorizeRoles('Dokter', 'Administrator'), prescriptionController.createPrescription);
router.get('/:id', prescriptionController.getPrescriptionById);

module.exports = router;