const express = require('express');
const alertaController = require('../controllers/alertaController');

const router = express.Router();

router.get('/', alertaController.listar);
router.get('/reorden', alertaController.listarReorden);
router.patch('/:id/cerrar', alertaController.cerrar);

module.exports = router;
