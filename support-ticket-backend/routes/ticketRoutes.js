const express = require('express');
const router = express.Router();
const {
  createTicket,
  assignTicket,
  updateTicketStatus,
  getTickets,
  getTicketById
} = require('../controllers/ticketController');

const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const db = require('../config/db');

// Route to create a ticket
router.post('/create', authenticateToken, createTicket);

// Route to assign a ticket (only accessible by admin)
router.put('/:id/assign', authenticateToken, authorizeRoles('admin'), assignTicket);

// Route to update ticket status
router.put('/:id/status', authenticateToken, updateTicketStatus);

// Route to get all tickets (admin-only)
router.get('/', authenticateToken, getTickets);

// Route to get tickets by user (only the authenticated user can access their own tickets)
router.get('/user/:id', authenticateToken, (req, res) => {
  const userId = req.user.id; // Securely get user ID from token

  const query = `
    SELECT t.*, d.name AS department_name
    FROM tickets t
    LEFT JOIN departments d ON t.department_id = d.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', err });
    res.json(results);
  });
});


router.get('/assigned', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [tickets] = await db.promise().query(
      `SELECT tickets.*, departments.name AS department_name, u.name AS created_by_name
       FROM tickets 
       JOIN departments ON tickets.department_id = departments.id
       JOIN users u ON tickets.user_id = u.id
       WHERE tickets.assigned_to = ?`,
      [userId]
    );

    res.json(tickets);
  } catch (err) {
    console.error('Error fetching assigned tickets:', err);
    res.status(500).json({ error: 'Failed to fetch assigned tickets' });
  }
});


router.put('/:id/status', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const { status } = req.body;

  console.log(`🚨 Update request: TicketID=${ticketId}, UserID=${userId}, Status=${status}`);

  const allowedStatuses = ['in_progress', 'resolved', 'closed'];
if (!allowedStatuses.includes(status)) {
  return res.status(400).json({ message: 'Invalid status update' });
}


  try {
    const [check] = await db.promise().query(
      'SELECT * FROM tickets WHERE id = ? AND assigned_to = ?',
      [ticketId, userId]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    const [updateResult] = await db.promise().query(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, ticketId]
    );
    console.log("Updating ticket", ticketId, "with status:", status);

    console.log("✅ Update result:", updateResult);

    res.json({ message: 'Ticket status updated to solved' });
  } catch (err) {
    console.error('🔥 Error updating ticket:', err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
});


// Route to get solved tickets for admin
router.get('/solved-tickets', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [tickets] = await db.promise().query(
      `SELECT tickets.*, departments.name AS department_name, u.name AS created_by_name
       FROM tickets 
       JOIN departments ON tickets.department_id = departments.id
       JOIN users u ON tickets.user_id = u.id
       WHERE tickets.status = 'solved'`
    );
    res.json(tickets); // Send the solved tickets to the frontend
  } catch (err) {
    console.error('Error fetching solved tickets:', err);
    res.status(500).json({ error: 'Failed to fetch solved tickets' });
  }
});



// Route to get ticket by ID
router.get('/:id', authenticateToken, getTicketById);

module.exports = router;
