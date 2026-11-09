const express = require('express');
const materialController = require('../controllers/materialController');

const router = express.Router();

router.get('/', materialController.listar);
router.get('/:id/stock', materialController.consultarStock);

module.exports = router;
