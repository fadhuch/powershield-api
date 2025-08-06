const express = require('express');
const ContactController = require('../controllers/contactController.js');
const { ensureDBConnection } = require('../middleware/index.js');

const router = express.Router()

// Apply database connection middleware to all routes
router.use(ensureDBConnection)

// Public routes
router.post('/', ContactController.createContact)

// Admin routes (you may want to add authentication middleware here)
router.get('/', ContactController.getContacts)
router.get('/stats', ContactController.getContactStats)
router.get('/unread-count', ContactController.getUnreadCount)
router.get('/search', ContactController.searchContacts)
router.get('/status/:status', ContactController.getContactsByStatus)
router.get('/:id', ContactController.getContactById)
router.put('/:id/status', ContactController.updateContactStatus)
router.put('/:id/reply', ContactController.markAsReplied)
router.put('/:id/archive', ContactController.archiveContact)
router.delete('/:id', ContactController.deleteContact)

module.exports = router;
