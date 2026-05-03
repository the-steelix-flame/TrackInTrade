// src/api/routes/broker.routes.js
const express = require('express');
const router = express.Router();
const brokerController = require('../controllers/broker.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// The routes to save keys and sync data
router.post('/connect', brokerController.saveBrokerKeys);
router.post('/sync', brokerController.syncTrades);

// The NEW routes to fetch the synced data
router.get('/positions', brokerController.getPositions);
router.get('/investments', brokerController.getInvestments);

module.exports = router;