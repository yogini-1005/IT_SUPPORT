import React, { useState } from 'react';
import '../assets/styles/Settings.css'

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [profilePrivacy, setProfilePrivacy] = useState('Public');

  const handleSave = () => {
    alert('Settings saved!');
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Settings</h2>
      <div className="card shadow-sm p-4">
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />
          <label className="form-check-label">Email Notifications</label>
        </div>

        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <label className="form-check-label">Dark Mode (Coming Soon)</label>
        </div>

        <div className="mb-3">
          <label className="form-label">Language Preferences</label>
          <select
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Profile Privacy</label>
          <select
            className="form-select"
            value={profilePrivacy}
            onChange={(e) => setProfilePrivacy(e.target.value)}
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        <button className="btn-save" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
