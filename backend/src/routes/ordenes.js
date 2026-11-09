const express = require('express');
const ordenController = require('../controllers/ordenController');

const router = express.Router();

router.get('/posibles-duplicados', ordenController.listarPosiblesDuplicados);

module.exports = router;
