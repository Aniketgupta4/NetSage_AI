import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    
    try {
      await signup({ name, email, password });
      setDone(true);
      setTimeout(() => nav('/login'), 700);
    } catch (x) {
      setError(x.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <style>{`
        .auth-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0b1120;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 1rem;
          box-sizing: border-box;
        }

        .auth-card {
          background-color: #131d2b;
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          border-radius: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.15);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
        }

        .header-section {
          margin-bottom: 2rem;
        }

        .eyebrow {
          color: #22d3ee;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #22d3ee;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        .auth-card h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
          margin: 0;
        }

        .error-banner {
          background-color: rgba(127, 29, 29, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #f87171;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .success-banner {
          background-color: rgba(6, 78, 59, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.5);
          color: #34d399;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .error-banner svg,
        .success-banner svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .input-group {
          margin-bottom: 1.25rem;
        }

        .input-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #cbd5e1;
          margin-bottom: 0.375rem;
        }

        .input-group input {
          width: 100%;
          background-color: #0b1120;
          border: 1px solid #475569;
          border-radius: 0.5rem;
          padding: 0.625rem 1rem;
          color: #ffffff;
          font-size: 0.875rem;
          box-sizing: border-box;
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #06b6d4;
          box-shadow: 0 0 0 1px #06b6d4;
        }

        .input-group input::placeholder {
          color: #64748b;
        }

        .primary-button {
          width: 100%;
          margin-top: 1rem;
          background-color: #0891b2;
          color: #ffffff;
          font-weight: 500;
          font-size: 1rem;
          padding: 0.625rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
          box-shadow: 0 4px 6px -1px rgba(8, 145, 178, 0.2);
        }

        .primary-button:hover:not(:disabled) {
          background-color: #06b6d4;
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer-text {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .footer-text a {
          color: #22d3ee;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .footer-text a:hover {
          color: #67e8f9;
          text-decoration: underline;
        }
      `}</style>

      <main className="auth-screen">
        <form className="auth-card" onSubmit={submit}>
          
          <div className="header-section">
            <div className="eyebrow">
              <div className="pulse-dot"></div>
              NETSAGE AI
            </div>
            <h1>Create account</h1>
            <p className="subtitle">Your own private network diagnosis workspace.</p>
          </div>

          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {done && (
            <div className="success-banner">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Account created. Redirecting to login…
            </div>
          )}

          <div className="input-group">
            <label>Full name</label>
            <input 
              required 
              minLength="2" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Your name"
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              minLength="8" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="At least 8 characters"
            />
          </div>

          <button type="submit" className="primary-button" disabled={busy || done}>
            {busy ? 'Creating...' : 'Sign up'}
          </button>

          <p className="footer-text">
            Already registered? <Link to="/login">Login</Link>
          </p>

        </form>
      </main>
    </>
  );
}