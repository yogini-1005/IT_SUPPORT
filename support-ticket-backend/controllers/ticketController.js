const Ticket = require('../models/Ticket');

const createTicket = (req, res) => {
  console.log("🔐 User from token:", req.user); 

  const { title, description, priority, department_id } = req.body;

  // Extract user ID from decoded token
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: 'User not authenticated' });
  }

  const newTicket = {
    title,
    description,
    priority,
    status: 'open',
    department_id,
    assigned_to: null,
    user_id: userId,
  };

  Ticket.createTicket(newTicket, (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to create ticket', error: err });

    res.status(201).json({ message: 'Ticket created successfully', ticketId: result.insertId });
  });
};

const assignTicket = (req, res) => {
  const ticketId = req.params.id;
  const { userId } = req.body;

  console.log('Assigning ticket:', ticketId, 'to user:', userId);  

  Ticket.assignTicket(ticketId, userId, (err, result) => {
    if (err) {
      console.error("Error while assigning ticket:", err); 
      return res.status(500).json({ message: 'Failed to assign ticket', error: err });
    }

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json({ message: 'Ticket assigned successfully' });
  });
};


const updateTicketStatus = (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  Ticket.updateTicketStatus(ticketId, status, (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update status', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found' });

    res.status(200).json({ message: 'Ticket status updated successfully' });
  });
};

const getTickets = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'admin') {
    Ticket.getAllTickets((err, tickets) => {
      if (err) return res.status(500).json({ message: 'Error fetching tickets' });
      res.status(200).json(tickets);
    });
  } else {
    Ticket.getTicketsByUser(userId, (err, tickets) => {
      if (err) return res.status(500).json({ message: 'Error fetching user tickets' });
      res.status(200).json(tickets);
    });
  }
};

const getTicketById = (req, res) => {
  const ticketId = req.params.id;
  Ticket.getTicketById(ticketId, (err, ticket) => {
    if (err) return res.status(500).json({ message: 'Error fetching ticket' });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json(ticket);
  });
};

module.exports = {
  createTicket,
  assignTicket,
  updateTicketStatus,
  getTickets,
  getTicketById
};
