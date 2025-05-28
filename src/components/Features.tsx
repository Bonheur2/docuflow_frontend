import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <section className="features-section">
      <h2>Key Features</h2>
      <div className="features-grid">
        <div className="feature-card">
          <h3>Secure Authentication</h3>
          <p>Login securely using LDAP authentication.</p>
        </div>
        <div className="feature-card">
          <h3>Document Management</h3>
          <p>Upload, organize, and manage documents efficiently.</p>
        </div>
        <div className="feature-card">
          <h3>Approval Workflow</h3>
          <p>Automate document approvals with real-time tracking.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
