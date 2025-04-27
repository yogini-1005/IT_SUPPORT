import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import '../assets/styles/EditTicket.css'; // Assuming you'll put the CSS in this file

const EditTicket = () => {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    department_id: '',
    attachment: '', 
  });

  const [file, setFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ticket details
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFormData({
          title: res.data.title,
          description: res.data.description,
          priority: res.data.priority,
          department_id: res.data.department_id,
          attachment: res.data.attachment || '',
        });
      } catch (err) {
        toast.error('Failed to load ticket');
      }
    };

    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/departments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setDepartments(res.data);
      } catch (err) {
        toast.error('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
    fetchDepartments();
  }, [ticketId]);

  const handleChange = (e) => {
    if (e.target.name === 'attachment') {
      setFile(e.target.files[0]);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('priority', formData.priority);
    data.append('department_id', formData.department_id);
    data.append('existingAttachment', formData.attachment || '');

    if (file) {
      data.append('attachment', file);
    }

    try {
      await axios.put(`/tickets/update/${ticketId}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Ticket updated successfully!');
      navigate('/my-tickets');
    } catch (err) {
      toast.error('Failed to update ticket');
    }
  };

  if (loading) {
    return <div className="ticket-container">Loading...</div>;
  }

  return (
    <div className="ticket-container">
      <div className="ticket-card">
        <h2>Edit Ticket</h2>
        <form onSubmit={handleSubmit} className="ticket-form" encType="multipart/form-data">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Attachment (optional)</label>
            <input
              type="file"
              name="attachment"
              accept="image/*,application/*"
              onChange={handleChange}
            />
            {formData.attachment && !file && (
              <p className="attachment-info">Current: {formData.attachment}</p>
            )}
          </div>

          <button type="submit" className="submit-button">
            Update Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;