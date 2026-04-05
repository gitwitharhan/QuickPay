import React from 'react';

export default function AbstractLogo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.1))",
      padding: "1px",
      position: "relative",
      boxShadow: "0 0 20px rgba(255,255,255,0.1)",
    }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "50%",
        background: "#030303",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden"
      }}>
         <div style={{
           position: "absolute",
           width: "50%", height: "50%",
           borderRadius: "50%",
           border: "1.5px solid rgba(255,255,255,0.7)",
           boxShadow: "0 0 10px rgba(255,255,255,0.3), inset 0 0 10px rgba(255,255,255,0.1)",
         }} />
         <div style={{
           position: "absolute",
           width: "18%", height: "18%",
           background: "#fff",
           borderRadius: "50%",
           boxShadow: "0 0 15px #fff",
         }} />
      </div>
    </div>
  );
}
