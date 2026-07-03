import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import LandlordDashboard from './components/LandlordDashboard';
import TenantDashboard from './components/TenantDashboard';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import './App.css';
import { API_URL } from './config';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have a token, fetch the user profile to confirm token is valid
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // If we already have the user details, skip the verification
      if (user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.ok ? await response.json() : null;
        if (data) {
          setUser(data);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify session token:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>Synchronizing Secure Session...</h3>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/auth" 
        element={
          token && user 
            ? <Navigate to="/dashboard" replace /> 
            : <Auth onLoginSuccess={handleLoginSuccess} />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          !token || !user 
            ? <Navigate to="/auth" replace /> 
            : user.role === 'admin' 
              ? <AdminDashboard token={token} user={user} onUserUpdate={(updatedUser) => setUser(updatedUser)} /> 
              : user.role === 'landlord' 
                ? <LandlordDashboard token={token} user={user} /> 
                : <TenantDashboard token={token} user={user} />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
