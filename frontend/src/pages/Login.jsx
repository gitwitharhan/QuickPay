import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AbstractLogo from '../components/AbstractLogo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030303",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "60vw", height: "60vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)",
        pointerEvents: "none"
      }} />

      <div style={{
        width: "100%", maxWidth: "400px", zIndex: 2, padding: "20px"
      }}>
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%" }}>
            <AbstractLogo size={28} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#fff", letterSpacing: "-0.02em" }}>QuickPay</span>
          </Link>
        </div>

        <div style={{
          padding: "40px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)"
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 700, color: "#b3b3b3", marginBottom: "8px", textAlign: "center" }}>Welcome back</h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginBottom: "32px", textAlign: "center" }}>Enter your credentials to access your account.</p>

          {error && (
            <div style={{ background: "rgba(220, 53, 69, 0.1)", border: "1px solid rgba(220, 53, 69, 0.3)", color: "#ff8787", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>Email address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: "0.95rem", outline: "none"
                }} 
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: "0.95rem", outline: "none"
                }} 
              />
            </div>
            
            <button type="submit" disabled={isLoading} style={{
              width: "100%", padding: "14px", marginTop: "10px", borderRadius: "8px",
              background: isLoading ? "rgba(255,255,255,0.5)" : "linear-gradient(135deg, #fff 0%, #ccc 100%)", border: "none",
              color: "#000", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem", 
              cursor: isLoading ? "not-allowed" : "pointer", transition: "opacity 0.2s"
            }}>
              {isLoading ? 'Processing...' : 'Log In'}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
            Don't have an account? <Link to="/signup" style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
