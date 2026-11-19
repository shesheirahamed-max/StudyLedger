import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5000/api/auth';

const Auth = ({ setToken, setUser }) => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const token = res.data?.token;
      const user = res.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        if (typeof setToken === 'function') setToken(token);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        if (typeof setUser === 'function') setUser(user);
      }
      window.location.reload();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/register`, {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      const registeredEmail = regEmail.trim();
      setMessage(res.data?.message || 'User registered successfully');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setLoginEmail(registeredEmail);
      setIsRightPanelActive(false);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <style>{`
        .auth-page-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #090314 !important;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .ambient-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          z-index: 0;
        }
        .auth-container {
          background: rgba(18, 12, 32, 0.7);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(168, 85, 247, 0.25);
          border: 1px solid rgba(192, 132, 252, 0.3);
          position: relative;
          overflow: hidden;
          width: 900px;
          max-width: 95%;
          min-height: 540px;
          z-index: 10;
        }
        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
          opacity: 1;
          visibility: visible;
        }
        .auth-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          visibility: hidden;
          z-index: 1;
          pointer-events: none;
        }
        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          visibility: visible;
          z-index: 5;
          pointer-events: auto;
          animation: show 0.6s;
        }
        @keyframes show {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100% { opacity: 1; z-index: 5; }
        }
        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 100;
        }
        .auth-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }
        .overlay {
          background-color: #260c4d !important;
          background-image: 
            linear-gradient(30deg, #4f1b8c 12%, transparent 12.5%, transparent 87%, #4f1b8c 87.5%, #4f1b8c),
            linear-gradient(150deg, #4f1b8c 12%, transparent 12.5%, transparent 87%, #4f1b8c 87.5%, #4f1b8c),
            linear-gradient(30deg, #4f1b8c 12%, transparent 12.5%, transparent 87%, #4f1b8c 87.5%, #4f1b8c),
            linear-gradient(150deg, #4f1b8c 12%, transparent 12.5%, transparent 87%, #4f1b8c 87.5%, #4f1b8c),
            linear-gradient(60deg, rgba(168, 85, 247, 0.25) 25%, transparent 25.5%, transparent 75%, rgba(168, 85, 247, 0.25) 75%, rgba(168, 85, 247, 0.25)),
            linear-gradient(60deg, rgba(168, 85, 247, 0.25) 25%, transparent 25.5%, transparent 75%, rgba(168, 85, 247, 0.25) 75%, rgba(168, 85, 247, 0.25)) !important;
          background-size: 80px 140px !important;
          background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px !important;
          color: #ffffff;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .auth-container.right-panel-active .overlay {
          transform: translateX(50%);
        }
        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 35px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .overlay-left { transform: translateX(-20%); }
        .auth-container.right-panel-active .overlay-left { transform: translateX(0); }
        .overlay-right { right: 0; transform: translateX(0); }
        .auth-container.right-panel-active .overlay-right { transform: translateX(20%); }

        .isometric-object-container {
          width: 220px;
          height: 220px;
          perspective: 1100px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          filter: drop-shadow(0 20px 20px rgba(12, 2, 35, 0.45));
        }
        .archive-rotator {
          width: 190px;
          height: 170px;
          position: relative;
          transform-style: preserve-3d;
          animation: archiveSpin 16s linear infinite;
        }
        @keyframes archiveSpin {
          0%   { transform: rotateX(-17deg) rotateY(0deg) translateY(0); }
          50%  { transform: rotateX(-17deg) rotateY(180deg) translateY(-5px); }
          100% { transform: rotateX(-17deg) rotateY(360deg) translateY(0); }
        }
        .archive-sheets { position: absolute; inset: 0; transform-style: preserve-3d; }
        .archive-sheet {
          position: absolute;
          bottom: 58px;
          width: 55px;
          height: 95px;
          border: 2px solid rgba(244, 210, 255, 0.95);
          border-bottom-width: 4px;
          border-radius: 10px 10px 4px 4px;
          background: linear-gradient(145deg, #f2b7ff 0%, #b44cff 42%, #7021d2 100%);
          transform-style: preserve-3d;
        }
        .sheet-1 { left: 25px; transform: translateZ(-25px) rotateY(-9deg); }
        .sheet-2 { left: 42px; transform: translateZ(-10px) rotateY(-7deg); }
        .sheet-3 { left: 59px; transform: translateZ(5px) rotateY(-5deg); }
        .sheet-4 { left: 76px; transform: translateZ(20px) rotateY(-3deg); }
        .archive-tray {
          position: absolute;
          left: 10px;
          bottom: 15px;
          width: 170px;
          height: 60px;
          border: 2px solid rgba(236, 190, 255, .95);
          border-radius: 15px 15px 20px 20px;
          background: linear-gradient(145deg, #9b36ed 0%, #5710bd 48%, #25065e 100%);
          transform: rotateX(62deg) translateZ(18px);
        }
        .archive-side-panel {
          position: absolute;
          width: 45px;
          height: 65px;
          right: 5px;
          bottom: 5px;
          border: 2px solid rgba(237,194,255,.9);
          border-radius: 9px;
          background: linear-gradient(145deg,#d46cff,#7925d7 65%,#3a087e);
          transform: translateZ(50px) rotateY(-12deg) rotateX(-5deg);
        }

        .auth-form {
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          height: 100%;
          text-align: center;
          color: #f4f4f5;
        }
        .auth-form h1 {
          font-weight: 800;
          font-size: 24px;
          line-height: 1.25;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .auth-form span {
          font-size: 13px;
          line-height: 1.4;
          color: #a1a1aa;
          margin-bottom: 16px;
        }
        .auth-input {
          background-color: rgba(20, 10, 35, 0.85);
          border: 1px solid rgba(168, 85, 247, 0.25);
          color: #f4f4f5;
          padding: 12px 14px;
          margin: 6px 0;
          width: 100%;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
          line-height: 1.3;
        }
        .auth-input:focus {
          border-color: #c084fc;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
        }
        .auth-btn {
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          padding: 12px 36px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 12px;
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
        }
        .ghost-btn {
          background-color: transparent;
          border: 2px solid rgba(255, 255, 255, 0.85);
          color: #ffffff;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 24px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 12px;
        }
      `}</style>

      <div className="ambient-glow"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}
      >
        {/* Register Form */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <span>Register for a new account</span>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="Full Name" 
              value={regName}
              onChange={e => setRegName(e.target.value)}
              required 
            />
            <input 
              type="email" 
              className="auth-input" 
              placeholder="Email Address" 
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Password" 
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
              required 
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Please wait...' : 'Register'}
            </button>
            {message && <p style={{ fontSize: '12px', marginTop: '8px', color: '#e9d5ff' }}>{message}</p>}
          </form>
        </div>

        {/* Login Form */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLogin}>
            <h1>Welcome Back!</h1>
            <span>Login with your personal info</span>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="Email Address" 
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              required 
            />
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Password" 
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              required 
            />
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Please wait...' : 'Login'}
            </button>
            {message && <p style={{ fontSize: '12px', marginTop: '8px', color: '#e9d5ff' }}>{message}</p>}
          </form>
        </div>

        {/* Overlay Panel */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="isometric-object-container">
                <div className="archive-rotator">
                  <div className="archive-sheets">
                    <div className="archive-sheet sheet-1"></div>
                    <div className="archive-sheet sheet-2"></div>
                    <div className="archive-sheet sheet-3"></div>
                    <div className="archive-sheet sheet-4"></div>
                  </div>
                  <div className="archive-tray"></div>
                  <div className="archive-side-panel"></div>
                </div>
              </div>
              <h1 style={{ color: '#fff', fontSize: '20px' }}>Welcome Back!</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>To keep connected with us please login with your personal info</p>
              <button type="button" className="ghost-btn" onClick={() => { setMessage(''); setIsRightPanelActive(false); }}>Sign In</button>
            </div>
            
            <div className="overlay-panel overlay-right">
              <div className="isometric-object-container">
                <div className="archive-rotator">
                  <div className="archive-sheets">
                    <div className="archive-sheet sheet-1"></div>
                    <div className="archive-sheet sheet-2"></div>
                    <div className="archive-sheet sheet-3"></div>
                    <div className="archive-sheet sheet-4"></div>
                  </div>
                  <div className="archive-tray"></div>
                  <div className="archive-side-panel"></div>
                </div>
              </div>
              <h1 style={{ color: '#fff', fontSize: '20px' }}>Hello, Student!</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>Enter your personal details and start your journey with us</p>
              <button type="button" className="ghost-btn" onClick={() => { setMessage(''); setIsRightPanelActive(true); }}>Sign Up</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;