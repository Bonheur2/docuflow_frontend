import React from 'react';
import { useNavigate } from 'react-router-dom';  
import TopBar from './TopBar';
import './Home.css';
import Footer from './Footer';
import Features from './Features';

const Home = () => {
  const navigate = useNavigate();  

  const handleGetStarted = () => {
    navigate('/api/auth/signup'); // Redirect to signup page
  };

  return (
    <>
      <TopBar />
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to DocuFlow</h1>
          <p>Your secure solution for efficient document management and workflow automation.</p>
          <button className="cta-button" onClick={handleGetStarted}>Get Started</button>
        </div>
      </header>
      
      <Features />
      <Footer />
    </>
  );
};

export default Home;
