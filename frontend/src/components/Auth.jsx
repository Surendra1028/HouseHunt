import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { API_URL } from '../config';

export default function Auth({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const roleParam = searchParams.get('role');

  const [isLogin, setIsLogin] = useState(modeParam !== 'register');
  const [role, setRole] = useState(roleParam === 'admin' ? 'tenant' : (roleParam || 'tenant')); // 'tenant' or 'landlord'

  useEffect(() => {
    setIsLogin(modeParam !== 'register');
  }, [modeParam]);

  useEffect(() => {
    if (roleParam) {
      setRole(roleParam === 'admin' ? 'tenant' : roleParam);
    }
  }, [roleParam]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, role, phone, bio };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        onLoginSuccess(data.token, data.user);
      } else {
        alert('Account created successfully! Please sign in with your credentials.');
        setIsLogin(true);
        setError('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass relative pt-12">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-indigo-400 hover:text-white hover:bg-[#6366f1] transition-all duration-300 cursor-pointer"
        >
          ← Home
        </button>
        <div className="auth-header">
          <h1>HouseHunt</h1>
          <p>{isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to get started.'}</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div className="role-selector" style={{ display: 'flex', gap: '0.5rem' }}>
                  <div 
                    className={`role-option ${role === 'tenant' ? 'selected' : ''}`}
                    onClick={() => setRole('tenant')}
                    style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}
                  >
                    Tenant
                  </div>
                  <div 
                    className={`role-option ${role === 'landlord' ? 'selected' : ''}`}
                    onClick={() => setRole('landlord')}
                    style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}
                  >
                    Landlord
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio (Brief Description)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            className="auth-toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>
      </div>
    </div>
  );
}
