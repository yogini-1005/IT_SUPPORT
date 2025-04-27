const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken, checkTicketAccess } = require('../middleware/auth');

// Get messages for a ticket
router.get('/:ticketId', verifyToken, checkTicketAccess, messageController.getMessages);

// Send a new message
router.post('/:ticketId', verifyToken, checkTicketAccess, messageController.sendMessage);

module.exports = router;