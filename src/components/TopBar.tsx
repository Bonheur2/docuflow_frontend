import React from 'react';
import './TopBar.css'; 
import { useNavigate } from 'react-router-dom';

function TopBar() {
  const navigate = useNavigate();  
  const handleGetStarted = () => {
    navigate('api/auth/signup'); 
  };

  return (
    <div className="topbar">
        <div className="topbar__logo">
            <img src="/images/image.png" alt="Logo" />
            <div className="topbar__title">DocuFlow</div>
        </div>
        <div className="topbar__menu">
            <ul>
                <li>Home</li>
                <li>Features</li>
                <li>About</li>
                <li className="cta-button" onClick={handleGetStarted}>Get Started</li>
            </ul>
        </div>
    </div>
  );
}

export default TopBar;