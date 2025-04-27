const db = require('../config/db');
const { logError } = require('../utils/logger');

const getMessages = async (req, res) => {
    try {
      const { ticketId } = req.params;
      console.log(`Fetching messages for ticket ${ticketId}`); // Add this line
      
      const [messages] = await db.query(`
        SELECT m.*, u.name as sender_name
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE ticket_id = ?
        ORDER BY created_at ASC
      `, [ticketId]);
  
      console.log(`Found ${messages.length} messages`); // Add this line
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error in getMessages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  };

//   sendMessage: async (req, res) => {
//     try {
//       const { ticketId } = req.params;
//       const { content } = req.body;
//       const { id: senderId, role: senderRole } = req.user;

//       if (!content || typeof content !== 'string') {
//         return res.status(400).json({ error: 'Message content is required' });
//       }

//       const [result] = await db.query(
//         `INSERT INTO messages 
//         (ticket_id, sender_id, sender_role, content) 
//         VALUES (?, ?, ?, ?)`,
//         [ticketId, senderId, senderRole, content]
//       );

//       const [newMessage] = await db.query(`
//         SELECT 
//           m.*,
//           u.name as sender_name
//         FROM messages m
//         LEFT JOIN users u ON m.sender_id = u.id
//         WHERE m.id = ?
//       `, [result.insertId]);

//       res.status(201).json(newMessage[0]);
//     } catch (error) {
//       logError('Error sending message', error);
//       res.status(500).json({ error: 'Failed to send message' });
//     }
//   }

module.exports = messageController;