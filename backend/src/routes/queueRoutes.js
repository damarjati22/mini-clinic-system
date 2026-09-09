const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

// Endpoint Queue sesuai requirement minimum
router.get('/', visitController.getVisits);
router.post('/', authorizeRoles('Administrator', 'Petugas Pendaftaran'), visitController.createVisit);

// Khusus untuk panggilan antrean atau ubah status antrean
router.put('/:id/call', authorizeRoles('Dokter', 'Administrator', 'Petugas Pendaftaran'), visitController.updateVisitStatus);
router.put('/:id/status', visitController.updateVisitStatus);

module.exports = router;