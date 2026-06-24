import React, { useState } from 'react';
import { getTable, logAction } from '../MockData';
import tanzaniaLogo from '../images/Coat_of_arms_of_Tanzania.svg';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('executive@moe.go.tz'); // Default filled for demo ease
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [validatedUser, setValidatedUser] = useState(null);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = getTable('users');
    const matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (matchedUser && password === 'password123') {
      // Simulate MFA for government logins
      setValidatedUser(matchedUser);
      setShowMfa(true);
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode.length === 6) {
      logAction(validatedUser.username, 'LOGIN', 'User Session', 'Successful authentication with MFA');
      localStorage.setItem('me_current_user', JSON.stringify(validatedUser));
      onLoginSuccess(validatedUser);
    } else {
      setError('Invalid 6-digit verification code. Enter any 6 digits for testing.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={tanzaniaLogo} alt="Tanzania Coat of Arms" />
          <h1>MoEST M&E Portal</h1>
          <p>United Republic of Tanzania</p>
        </div>

        {!showMfa ? (
          <form onSubmit={handleLoginSubmit}>
            {error && (
              <div className="error-text" style={{ padding: '8px 12px', background: 'var(--error-bg)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                ⚠️ {error}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label" htmlFor="username">Email Address</label>
              <input
                id="username"
                type="email"
                className="form-input"
                placeholder="enter your MoEST email"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Remember session
              </label>
              <a href="#forgot" style={{ fontSize: '0.8rem' }} onClick={() => alert('Please contact ICT support desk to reset password')}>Forgot Password?</a>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              🔓 Sign In Securely
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <div className="error-text" style={{ padding: '8px 12px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              💬 A verification code has been simulated. Enter any 6 digits (e.g. 123456) to proceed.
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mfaCode">MFA Token Verification</label>
              <input
                id="mfaCode"
                type="text"
                maxLength="6"
                className="form-input"
                placeholder="6-digit verification code"
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem' }}
                required
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Confirm Verification
            </button>
            
            <button 
              type="button" 
              className="btn btn-ghost" 
              style={{ width: '100%', marginTop: '8px', fontSize: '0.8rem' }}
              onClick={() => { setShowMfa(false); setMfaCode(''); }}
            >
              Cancel
            </button>
          </form>
        )}

        <div style={{ borderTop: '1px solid var(--neutral-200)', marginTop: '24px', paddingTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--neutral-600)' }}>
          🔒 This portal is for authorized Tanzanian government officials only. Action logging is enforced under standard e-GA regulations.
        </div>
      </div>
    </div>
  );
}
