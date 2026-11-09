const express = require('express');
const movimientoController = require('../controllers/movimientoController');

const router = express.Router();

router.post('/', movimientoController.crear);

module.exports = router;
