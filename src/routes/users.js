const express = require('express');
const UserController = require('../controllers/userController.js');
const { ensureDBConnection } = require('../middleware/index.js');

const router = express.Router()

// Apply database connection middleware to all routes
router.use(ensureDBConnection)

// User routes
router.post('/', UserController.createUser)
router.get('/', UserController.getUsers)
router.get('/stats', UserController.getUserStats)
router.post('/check-email', UserController.checkEmail)
router.get('/:id', UserController.getUserById)
router.put('/:id', UserController.updateUser)
router.delete('/:id', UserController.deleteUser)

module.exports = router;
