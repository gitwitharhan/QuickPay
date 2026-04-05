// import React from 'react';
import { Link } from 'react-router-dom';
import AbstractLogo from '../components/AbstractLogo';

export default function Signup() {
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
      overflow: "hidden",
      padding: "20px"
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "70vw", height: "70vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)",
        pointerEvents: "none"
      }} />

      <div style={{
        width: "100%", maxWidth: "440px", zIndex: 2
      }}>
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#fff", display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <AbstractLogo size={24} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>QuickPay</span>
          </Link>
        </div>

        <div style={{
          padding: "40px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)"
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 700, color: "#b3b3b3", marginBottom: "8px", textAlign: "center" }}>Create your account</h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginBottom: "32px", textAlign: "center" }}>Start routing capital at light speed.</p>

          <form style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>First name</label>
                <input type="text" placeholder="John" style={{
                  width: "100%", padding: "12px 16px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: "0.95rem", outline: "none"
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>Last name</label>
                <input type="text" placeholder="Doe" style={{
                  width: "100%", padding: "12px 16px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: "0.95rem", outline: "none"
                }} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>Email address</label>
              <input type="email" placeholder="name@company.com" style={{
                width: "100%", padding: "12px 16px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: "0.95rem", outline: "none"
              }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px" }}>Password</label>
              <input type="password" placeholder="••••••••" style={{
                width: "100%", padding: "12px 16px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: "0.95rem", outline: "none"
              }} />
            </div>
            
            <button type="button" style={{
              width: "100%", padding: "14px", marginTop: "10px", borderRadius: "8px",
              background: "linear-gradient(135deg, #fff 0%, #ccc 100%)", border: "none",
              color: "#000", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer"
            }}>Sign Up</button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
            Already have an account? <Link to="/login" style={{ color: "#fff", textDecoration: "none", fontWeight: 600 }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
