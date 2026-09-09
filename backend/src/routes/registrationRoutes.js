const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

// Endpoint Registration sesuai requirement minimum
router.get('/', visitController.getVisits);
router.post('/', authorizeRoles('Administrator', 'Petugas Pendaftaran'), visitController.createVisit);
router.put('/:id', visitController.updateVisitStatus);

module.exports = router;