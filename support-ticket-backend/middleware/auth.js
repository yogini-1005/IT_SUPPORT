// authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Make sure this path is correct

const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`Authenticated user: ${decoded.id} (${decoded.role})`);
    next();
  } catch (err) {
    console.log('Invalid token:', err.message);
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      console.log('No user role found');
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`User role ${req.user.role} not authorized`);
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to perform this action' 
      });
    }

    console.log(`Role ${req.user.role} authorized`);
    next();
  };
};

const checkTicketAccess = async (req, res, next) => {
  const { ticketId } = req.params;
  const { id: userId, role } = req.user;

  if (!ticketId) {
    console.log('No ticket ID provided');
    return res.status(400).json({ 
      success: false,
      message: 'Ticket ID is required' 
    });
  }

  try {
    // Get ticket from database
    const [ticket] = await db.query(
      `SELECT user_id, assigned_agent_id, status 
       FROM tickets 
       WHERE id = ?`,
      [ticketId]
    );

    if (!ticket) {
      console.log(`Ticket ${ticketId} not found`);
      return res.status(404).json({ 
        success: false,
        message: 'Ticket not found' 
      });
    }

    // Check access permissions
    const isAdmin = role === 'admin';
    const isAssignedAgent = role === 'agent' && ticket.assigned_agent_id === userId;
    const isTicketOwner = role === 'user' && ticket.user_id === userId;

    if (isAdmin || isAssignedAgent || isTicketOwner) {
      console.log(`Access granted to ticket ${ticketId}`);
      req.ticket = ticket; // Attach ticket to request for later use
      return next();
    }

    console.log(`Access denied for user ${userId} to ticket ${ticketId}`);
    return res.status(403).json({ 
      success: false,
      message: 'You do not have permission to access this ticket' 
    });

  } catch (err) {
    console.error('Database error in checkTicketAccess:', err);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  verifyToken,
  authorizeRoles,
  checkTicketAccess
};