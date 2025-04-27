const db = require('../config/db');

const createMessage = (ticketId, senderId, senderRole, content, callback) => {
  const sql = `
    INSERT INTO messages 
    (ticket_id, sender_id, sender_role, content) 
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [ticketId, senderId, senderRole, content], callback);
};

const getMessagesByTicketId = (ticketId, callback) => {
  const sql = `
    SELECT 
      m.*,
      u.name as sender_name
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE ticket_id = ? 
    ORDER BY created_at ASC
  `;
  db.query(sql, [ticketId], callback);
};

module.exports = {
  createMessage,
  getMessagesByTicketId
};