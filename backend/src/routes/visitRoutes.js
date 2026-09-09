const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

// Endpoint statistik dashboard (Digabung di visitRoutes)
router.get('/stats', visitController.getDashboardStats);

router.get('/', visitController.getVisits);
router.post('/', authorizeRoles('Administrator', 'Petugas Pendaftaran'), visitController.createVisit);
router.put('/:id/status', visitController.updateVisitStatus);

module.exports = router;