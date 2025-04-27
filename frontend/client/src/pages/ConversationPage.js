import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../assets/styles/Conversation.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ConversationPage = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  // Fetch user data from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      setUserId(decoded.id);
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch ticket and messages
  useEffect(() => {
    if (!userId || !ticketId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch ticket
        const ticketRes = await axios.get(`tickets/${ticketId}`);

        // Verify user has access to this ticket
        if (
          (userRole === "user" && ticketRes.data.user_id !== userId) ||
          (userRole === "agent" && ticketRes.data.assigned_agent_id !== userId)
        ) {
          throw new Error("You don't have permission to view this ticket");
        }

        setTicket(ticketRes.data);

        // Fetch messages
        const messagesRes = await axios.get(`messages/${ticketId}`);
        setMessages(messagesRes.data);
        setError("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load data"
        );
        if (err.response?.status === 403) {
          navigate("/unauthorized");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [ticketId, userId, userRole, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`messages/${ticketId}`, {
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`tickets/${ticketId}/status`, {
        status: newStatus,
      });
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="conversation-page container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversation-page container py-4">
        <div className="alert alert-danger">
          <h5>Error</h5>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-page container py-4">
      {/* Ticket Header with Status Controls */}
      <div className="ticket-header mb-4 p-3 bg-light rounded">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-sm btn-secondary mb-2"
        >
          ← Back to Tickets
        </button>

        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h3>{ticket?.title}</h3>
            <p className="mb-1">
              <strong>Department:</strong> {ticket?.department_name}
            </p>
          </div>

          {(userRole === "agent" || userRole === "admin") && (
            <div className="status-controls">
              <select
                value={ticket?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        <div className="d-flex gap-3 mt-2">
          <span
            className={`badge ${
              ticket?.status === "Closed" ? "bg-secondary" : "bg-primary"
            }`}
          >
            {ticket?.status}
          </span>
          <span
            className={`badge ${
              ticket?.priority === "High"
                ? "bg-danger"
                : ticket?.priority === "Medium"
                ? "bg-warning"
                : "bg-info"
            }`}
          >
            {ticket?.priority}
          </span>
          {ticket?.assigned_agent && (
            <span className="badge bg-dark">
              Agent: {ticket.assigned_agent.name}
            </span>
          )}
        </div>

        <div className="mt-3">
          <p>
            <strong>Description:</strong>
          </p>
          <p className="ticket-description">{ticket?.description}</p>
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-container mb-4">
        {messages.length === 0 ? (
          <p className="text-muted text-center py-3">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${
                msg.sender_id === userId ? "sent" : "received"
              }`}
            >
              <div className="message-header">
                <strong>
                  {msg.sender_id === userId ? "You" : msg.sender_name}
                </strong>
                <span
                  className={`badge ${
                    msg.sender_role === "agent"
                      ? "bg-primary"
                      : msg.sender_role === "admin"
                      ? "bg-danger"
                      : "bg-secondary"
                  } ms-2`}
                >
                  {msg.sender_role.charAt(0).toUpperCase() +
                    msg.sender_role.slice(1)}
                </span>
              </div>
              <p className="message-content">{msg.content}</p>
              <small className="message-time">
                {new Date(msg.created_at).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>

      {/* Reply Box */}
      {ticket?.status !== "Closed" && (
        <form onSubmit={handleSendMessage} className="reply-box sticky-bottom">
          <div className="input-group">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="form-control"
              placeholder={
                userRole === "user"
                  ? "Reply to this ticket..."
                  : "Type your response..."
              }
              disabled={userRole === "agent" && !ticket?.assigned_agent_id}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={userRole === "agent" && !ticket?.assigned_agent_id}
            >
              Send
            </button>
          </div>
          {userRole === "agent" && !ticket?.assigned_agent_id && (
            <small className="text-warning d-block mt-1">
              You must be assigned to this ticket to reply
            </small>
          )}
        </form>
      )}
    </div>
  );
};

export default ConversationPage;
