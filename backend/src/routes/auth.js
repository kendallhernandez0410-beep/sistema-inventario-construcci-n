const express = require('express');
const authController = require('../controllers/authController');
const { authRequired } = require('../middleware/authRequired');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authRequired, authController.currentUser);
router.post('/logout', authRequired, authController.logout);

module.exports = router;
