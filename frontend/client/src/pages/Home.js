import{ React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Home.css';
import { jwtDecode } from "jwt-decode";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.role) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
  }, []);
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            IT Support <span className="highlight">Ticketing System</span>
          </h1>
          <p className="hero-subtitle">
            Streamlined technical issue reporting and resolution tracking
          </p>
          <div className="hero-cta">
            <Link to="/features" className="btn btn-outline-light btn-lg me-3">
              Learn More
            </Link>
            {!localStorage.getItem('token') && (
              <Link to="/register" className="btn btn-light btn-lg">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="features-section">
        <h2 className="section-title">Why Choose Our System?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-people"></i>
            </div>
            <h3>User Access</h3>
            <p>Create tickets and track progress in real-time with notifications.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-shield-lock"></i>
            </div>
            <h3>Admin Dashboard</h3>
            <p>Comprehensive tools for ticket management and assignment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="bi bi-graph-up"></i>
            </div>
            <h3>Analytics</h3>
            <p>Track resolution times, team performance, and ticket trends.</p>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Report an Issue</h3>
              <p>Submit a detailed ticket describing your technical problem.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Ticket Assignment</h3>
              <p>Our system automatically routes your ticket to the right team.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Resolution Tracking</h3>
              <p>Monitor progress and communicate with support staff.</p>
            </div>
          </div>
        </div>
      </div>
      {!isLoggedIn && (
      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who streamline their IT support process with us.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account
        </Link>
      </div>
      )}
    </div>
  );
};

export default Home;