import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "../assets/styles/Dashboard.css"; // your CSS
import "bootstrap/dist/css/bootstrap.min.css";
import empty from "../assets/images/out-of-stock.png";
import edit from "../assets/images/edit.png";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const ticketsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded.id;

    axios
      .get(`/tickets/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setTickets(res.data))
      .catch((err) => console.error("Error fetching tickets:", err));
  }, []);

  useEffect(() => {
    let data = [...tickets];
    if (statusFilter !== "All") {
      data = data.filter((t) => t.status === statusFilter);
    }
    data.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );
    setFiltered(data);
    setCurrentPage(1);
  }, [statusFilter, sortOrder, tickets]);

  const indexOfLast = currentPage * ticketsPerPage;
  const indexOfFirst = indexOfLast - ticketsPerPage;
  const currentTickets = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / ticketsPerPage);

  const handleCardClick = (ticket) => {
    navigate(`/conversation/${ticket.id}`);
  };

  return (
    <div className="tickets-page container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title">My Tickets</h3>
        <button
          className="create-btn"
          onClick={() => navigate("/create-ticket")}
        >
          + Create Ticket
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select filter-dropdown w-auto"
        >
          <option>All</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="form-select filter-dropdown w-auto"
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      {currentTickets.length === 0 ? (
        <div className="empty-state text-center text-muted">
          <img src={empty} alt="No tickets found" />
          <h5>No tickets found.</h5>
        </div>
      ) : (
        <div className="ticket-grid">
          {currentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card p-4 text-decoration-none text-dark"
              onClick={() => handleCardClick(ticket)}
            >
              <div>
                <div className="title">
                  <h5 className="fw-semibold mb-3 text-center">
                    {ticket.title}
                  </h5>
                  {!["resolved", "closed"].includes(
                    ticket.status.toLowerCase()
                  ) && (
                    <button
                      className="btn btn-sm mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-ticket/${ticket.id}`);
                      }}
                    >
                      <img src={edit} alt="Edit" />
                    </button>
                  )}
                </div>
                <span
                  className={`priority-badge ${ticket.priority.toLowerCase()}`}
                >
                  {ticket.priority}
                </span>
              </div>

              <p className="text-muted mb-1">
                <strong>Department:</strong> {ticket.department_name}
              </p>

              <p className="mb-1">
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${ticket.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {ticket.status}
                </span>
              </p>

              <p className="text-muted mb-0">
                <small>
                  Created: {new Date(ticket.created_at).toLocaleString()}
                </small>
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination d-flex justify-content-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`btn btn-sm mx-1 ${
                currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
