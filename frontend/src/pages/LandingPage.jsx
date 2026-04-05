import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AbstractLogo from "../components/AbstractLogo";

/* ─── Scroll reveal hook ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Blur Fade Up ─── */
function BlurFadeUp({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      filter: visible ? "blur(0px)" : "blur(8px)",
      transition: `all 1s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ─── Word-by-word Scroll Reveal with Silver Gradient ─── */
function RevealText({ children, tag = "p", style = {}, delay = 0, gradient = false }) {
  const [ref, visible] = useReveal(0.1);
  const words = String(children).split(" ");
  const Tag = tag;
  return (
    <Tag ref={ref} style={{ ...style, display: "inline-block" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", marginRight: "0.28em", verticalAlign: "bottom", paddingBottom:"0.1em" }}>
          <span style={{
            display: "inline-block",
            transform: visible ? "translateY(0)" : "translateY(110%) rotate(4deg)",
            opacity: visible ? 1 : 0,
            transition: `transform 0.8s cubic-bezier(.16,1,.3,1) ${delay + i * 0.08}s, opacity 0.6s ease ${delay + i * 0.08}s`,
            color: gradient ? "#b3b3b3" : "inherit",
          }}>{w}</span>
        </span>
      ))}
    </Tag>
  );
}

/* ─── Glowing stat ─── */
function Stat({ value, label, delay }) {
  const [ref, visible] = useReveal(0.2);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      filter: visible ? "blur(0px)" : "blur(4px)",
      transition: `all 0.9s cubic-bezier(.16,1,.3,1) ${delay}s`,
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
        fontWeight: 800,
        color: "#b3b3b3",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginTop: "10px",
      }}>{label}</div>
    </div>
  );
}

const Icons = {
  lightning: <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  lock:     <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  chart:    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/></svg>,
  globe:    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>,
  receipt:  <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
  qr:       <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM15 15h2.25V13.5H21v2.25h-2.25V21h-2.25v-3.75H15V15z"/></svg>,
  check:    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
};

/* ─── Feature card ─── */
function FeatureCard({ icon, title, desc, index }) {
  const [ref, visible] = useReveal(0.08);
  const [hov, setHov] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "36px 30px",
        border: `1px solid ${hov ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}`,
        borderRadius: "14px",
        background: hov ? "rgba(255,255,255,0.03)" : "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0) 100%)",
        transition: `all 0.65s cubic-bezier(.16,1,.3,1) ${index * 0.08}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? (hov ? "translateY(-6px)" : "translateY(30px)") : "translateY(30px)",
        cursor: "default",
        boxShadow: hov ? "0 15px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.02)",
      }}
    >
      <div style={{
        width: 46, height: 46,
        background: hov ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff",
        marginBottom: "24px",
        transition: "all 0.4s",
        boxShadow: hov ? "0 0 25px rgba(255,255,255,0.1)" : "none",
        transform: hov ? "scale(1.05)" : "scale(1)",
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "1.1rem",
        fontWeight: 700,
        color: hov ? "#fff" : "rgba(255,255,255,0.8)",
        marginBottom: "12px",
        letterSpacing: "-0.01em",
        transition: "color 0.3s",
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.85rem",
        lineHeight: 1.7,
        color: "rgba(255,255,255,0.4)",
        fontWeight: 400,
      }}>{desc}</p>
    </div>
  );
}

/* ─── Pricing Card ─── */
function PricingCard({ tier, price, desc, features, recommended, delay }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div ref={ref} style={{
      padding: "48px 40px",
      border: `1px solid ${recommended ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: "20px",
      background: recommended ? "rgba(255,255,255,0.04)" : "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)",
      opacity: visible ? 1 : 0,
      transform: visible ? (recommended ? "translateY(-10px)" : "translateY(0)") : "translateY(30px)",
      transition: `all 0.8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      position: "relative",
      boxShadow: recommended ? "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
    }}>
      {recommended && (
        <div style={{
          position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
          background: "#fff", color: "#000", fontFamily: "'Inter', sans-serif", fontWeight: 600,
          fontSize: "0.75rem", padding: "6px 16px", borderRadius: "20px", letterSpacing: "0.05em",
        }}>MOST POPULAR</div>
      )}
      <div style={{ fontFamily:"'Inter',sans-serif",fontSize:"1rem",fontWeight:500,color:"rgba(255,255,255,0.6)",marginBottom:"16px" }}>{tier}</div>
      <div style={{ display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"16px" }}>
        <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"3.5rem",fontWeight:800,color:"#b3b3b3",letterSpacing:"-0.03em" }}>{price}</span>
        {price !== "Custom" && <span style={{ fontFamily:"'Inter',sans-serif",fontSize:".9rem",color:"rgba(255,255,255,0.4)" }}>/ mo</span>}
      </div>
      <p style={{ fontFamily:"'Inter',sans-serif",fontSize:".9rem",color:"rgba(255,255,255,.4)",lineHeight:1.6,marginBottom:"32px",height:"48px" }}>{desc}</p>
      <Link to="/signup" className={recommended ? "btn-main" : "btn-line"} style={{ width:"100%",marginBottom:"40px" }}>
        {price === "Custom" ? "Contact Sales" : "Get Started"}
      </Link>
      <div style={{ display:"flex",flexDirection:"column",gap:"16px" }}>
        {features.map((f,i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",gap:"12px",fontFamily:"'Inter',sans-serif",fontSize:".85rem",color:"rgba(255,255,255,.7)" }}>
            <span style={{ color:"#fff" }}>{Icons.check}</span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [cursorDelay, setCursorDelay] = useState({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // delayed ring cursor
  useEffect(() => {
    let pos = { x: -100, y: -100 };
    let target = { x: -100, y: -100 };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      setCursorDelay({ x: pos.x, y: pos.y });
      rafRef.current = requestAnimationFrame(loop);
    };
    const onMove = (e) => { target = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafRef.current); };
  }, []);

  const px = (mouse.x / (window.innerWidth || 1) - 0.5) * 20;
  const py = (mouse.y / (window.innerHeight || 1) - 0.5) * 20;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #030303; color: #e8e8e8; font-family: 'Inter', sans-serif; overflow-x: hidden; cursor: none; }

        @keyframes scanDown { 0%{top:-1px} 100%{top:100vh} }
        @keyframes pulseGlow { 0%,100%{opacity:0.3; filter:blur(40px)} 50%{opacity:0.5; filter:blur(50px)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .btn-main {
          background: linear-gradient(135deg, #fff 0%, #dcdcdc 100%);
          color: #000;
          font-family: 'Syne', sans-serif; font-size: .85rem; font-weight: 700;
          letter-spacing: .02em;
          padding: 14px 38px; border: none; border-radius: 8px;
          cursor: none; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          transition: all .3s ease;
          box-shadow: 0 0 20px rgba(255,255,255,.1);
        }
        .btn-main::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          transform: translateX(-100%);
          transition: transform .5s;
        }
        .btn-main:hover::before { transform: translateX(100%); }
        .btn-main:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(255,255,255,.25); }

        .btn-line {
          background: transparent; color: rgba(255,255,255,.8);
          font-family: 'Syne', sans-serif; font-size: .85rem; font-weight: 600;
          letter-spacing: .02em;
          padding: 13px 38px; border: 1px solid rgba(255,255,255,.2); border-radius: 8px;
          cursor: none; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
          transition: all .3s ease;
        }
        .btn-line:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.5); color: #fff; transform: translateY(-3px); box-shadow: 0 8px 25px rgba(255,255,255,.08); }

        .nav-link { font-family: 'Inter', sans-serif; font-size: .85rem; font-weight: 400; color: rgba(255,255,255,.5); text-decoration: none; transition: color .2s; cursor: none; }
        .nav-link:hover { color: #fff; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #030303; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 10px; }
      `}</style>

      {/* ── Custom cursor ── */}
      <div style={{ position:"fixed",zIndex:9999,pointerEvents:"none", left:cursor.x,top:cursor.y, transform:"translate(-50%,-50%)", width:6,height:6, borderRadius:"50%", background:"#fff", boxShadow:"0 0 10px rgba(255,255,255,1)", transition:"transform .08s" }} />
      <div style={{ position:"fixed",zIndex:9998,pointerEvents:"none", left:cursorDelay.x,top:cursorDelay.y, transform:"translate(-50%,-50%)", width:34,height:34, borderRadius:"50%", border:"1px solid rgba(255,255,255,.25)", background:"rgba(255,255,255,0.02)", backdropFilter:"blur(2px)" }} />

      {/* ── Sleek Grid BG ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        backgroundImage:`linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)`,
        backgroundSize:"60px 60px",
        maskImage:"radial-gradient(ellipse 80% 80% at 50% 10%, black 10%, transparent 70%)"
      }} />

      {/* ── Ambient silver glow ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }}>
        <div style={{ position:"absolute",top:"-40%",left:"50%",transform:"translateX(-50%)", width:"80vw",height:"70vw", borderRadius:"50%", background:"radial-gradient(ellipse,rgba(255,255,255,.025) 0%,transparent 60%)", animation:"pulseGlow 12s ease-in-out infinite" }} />
      </div>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:500,
        padding:"0 6vw", height:"80px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        background: scrolled ? "rgba(3,3,3,.85)" : "transparent",
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,.08)" : "transparent"}`,
        transition:"all .4s cubic-bezier(.16,1,.3,1)",
      }}>
        <Link to="/" style={{ display:"flex",alignItems:"center",gap:"12px",textDecoration:"none",cursor:"none" }}>
          <AbstractLogo size={28} />
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"1.2rem",fontWeight:800,color:"#fff",letterSpacing:"-0.02em" }}>QuickPay</span>
        </Link>
        <div style={{ display:"flex",gap:"36px",alignItems:"center" }}>
          {[
            { name: "Features", href: "#features" },
            { name: "Security", href: "#security" },
            { name: "Pricing", href: "#pricing" }
          ].map(n => <a key={n.name} href={n.href} className="nav-link">{n.name}</a>)}
          
          <div style={{ width:"1px",height:"16px",background:"rgba(255,255,255,.15)" }} />
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/signup" className="btn-main" style={{ padding:"10px 24px",fontSize:".8rem",boxShadow:"none",borderRadius:"6px" }}>Get Started</Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"120px 6vw 80px",position:"relative",overflow:"hidden" }}>
        
        {/* Holographic glowing orb background element */}
        <div style={{
          position:"absolute",right:"10%",top:"30%",
          transform:`translate(${px*0.6}px,${py*0.6}px)`,
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(50px)",
          pointerEvents:"none",zIndex:1,
        }} />

        <div style={{ maxWidth:"840px",position:"relative",zIndex:2, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>

          {/* Hero headline — word by word scrolling animation */}
          <RevealText
            tag="h1"
            delay={0.1}
            gradient={true}
            style={{
              fontFamily:"'Syne',sans-serif",
              fontSize:"clamp(3.5rem, 8vw, 6.5rem)",
              fontWeight:800,
              lineHeight:1.05,
              letterSpacing:"-0.035em",
              marginBottom:"32px",
            }}
          >
            Stop waiting. Start paying instantly.
          </RevealText>

          <BlurFadeUp delay={0.6}>
            <p style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:"1.1rem",fontWeight:300,lineHeight:1.7,
              color:"rgba(255,255,255,.5)",
              marginBottom:"50px",maxWidth:"560px",margin:"0 auto 50px"
            }}>
              QuickPay is the premium payment layer — instant routing, smart analytics, and absolute transparency in every transaction.
            </p>
          </BlurFadeUp>

          <BlurFadeUp delay={0.8} style={{ display:"flex",gap:"16px",alignItems:"center",flexWrap:"wrap",justifyContent:"center",marginBottom:"80px" }}>
            <Link to="/signup" className="btn-main">Open Free Account</Link>
            <Link to="/login" className="btn-line">View Dashboard</Link>
          </BlurFadeUp>

          {/* Stats */}
          <div style={{ display:"flex",gap:"70px",flexWrap:"wrap",justifyContent:"center",paddingTop:"40px",borderTop:"1px solid rgba(255,255,255,.05)" }}>
            <Stat value="$2.4B+" label="Daily Volume" delay={0.9} />
            <Stat value="1.8M+" label="Active Users" delay={1.0} />
            <Stat value="0.3s" label="Avg Transfer" delay={1.1} />
          </div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,.03)",borderBottom:"1px solid rgba(255,255,255,.03)",padding:"24px 0",overflow:"hidden",position:"relative",zIndex:2,background:"rgba(255,255,255,0.005)" }}>
        <div style={{ display:"flex",width:"max-content",animation:"ticker 30s linear infinite" }}>
          {[...Array(2)].map((_,ri)=>(
            <div key={ri} style={{ display:"flex" }}>
              {["Instant Routing","Zero Fees","Bank-Grade Security","Smart Analytics","24/7 Support","Regulated","1.8M+ Users","API First","Auto Receipts"].map((t,i)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:"40px",padding:"0 40px",
                  fontFamily:"'Syne',sans-serif",fontSize:".8rem",fontWeight:600,
                  letterSpacing:".1em",textTransform:"uppercase",whiteSpace:"nowrap",
                  color: "rgba(255,255,255,0.3)",
                }}>
                  {t}
                  <span style={{ width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"inline-block" }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ padding:"140px 6vw",position:"relative",zIndex:2,scrollMarginTop:"120px" }}>
        <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
          <div style={{ marginBottom:"80px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <BlurFadeUp delay={0}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:"12px",marginBottom:"24px" }}>
                <div style={{ width:40,height:"1px",background:"rgba(255,255,255,0.3)" }} />
                <span style={{ fontFamily:"'Inter',sans-serif",fontSize:".8rem",fontWeight:500,color:"rgba(255,255,255,0.6)",letterSpacing:".12em",textTransform:"uppercase" }}>
                  Core Infrastructure
                </span>
                <div style={{ width:40,height:"1px",background:"rgba(255,255,255,0.3)" }} />
              </div>
            </BlurFadeUp>
            <RevealText
              tag="h2"
              delay={0.1}
              gradient={true}
              style={{
                fontFamily:"'Syne',sans-serif",
                fontSize:"clamp(2.5rem,4vw,3.5rem)",
                fontWeight:800,letterSpacing:"-0.03em",
                lineHeight:1.1,maxWidth:"600px",
              }}
            >
              Everything you need to move money.
            </RevealText>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:"24px" }}>
            {[
              { icon:Icons.lightning,title:"Instant Transfers",desc:"Sub-second transfers across all nodes. Zero queue, zero waiting times for execution." },
              { icon:Icons.lock,title:"Vault Security",desc:"256-bit AES encryption, multi-factor auth, real-time threat detection on every call." },
              { icon:Icons.chart,title:"Spend Analytics",desc:"Live dashboards that show precisely where your capital flows. Built for ultimate clarity." },
              { icon:Icons.globe,title:"Global Wires",desc:"Route payments to 80+ countries at mid-market rates with transparent flat fees." },
              { icon:Icons.receipt,title:"Smart Receipts",desc:"Auto-categorized history with exportable, audit-ready statements dynamically generated." },
              { icon:Icons.qr,title:"Universal Scan",desc:"Scan any standard tag or ID—personal or commercial—in under two seconds flat." },
            ].map((f,i)=><FeatureCard key={i} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ BENTO UI / SECURITY ══ */}
      <section id="security" style={{ padding:"0 6vw 140px",position:"relative",zIndex:2,scrollMarginTop:"120px" }}>
        <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1.2fr 1fr",gridTemplateRows:"auto auto",gap:"24px" }}>

            {/* Left tall */}
            <BlurFadeUp delay={0} style={{ gridRow:"span 2" }}>
              <div style={{
                height:"100%",minHeight:"450px",
                padding:"60px 48px",
                border:"1px solid rgba(255,255,255,.08)",
                borderRadius:"20px",
                background:"linear-gradient(135deg, rgba(255,255,255,.04) 0%, rgba(0,0,0,0) 100%)",
                position:"relative",overflow:"hidden",
                display:"flex",flexDirection:"column",justifyContent:"flex-end",
              }}>
                {/* floating sleek graphic */}
                <div style={{ position:"absolute",top:"50px",right:"50px", width:"180px",height:"180px", borderRadius:"50%", background:"radial-gradient(circle,rgba(255,255,255,.08) 0%,transparent 70%)", animation:"floatY 6s ease-in-out infinite", display:"flex",alignItems:"center",justifyContent:"center" }}>
                   <div style={{
                     width: "120px", height: "120px",
                     border: "1px solid rgba(255,255,255,0.15)",
                     borderRadius: "20px",
                     transform: "rotate(15deg)",
                     backdropFilter: "blur(12px)",
                     boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                     display: "flex", alignItems: "center", justifyContent: "center",
                     background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)"
                   }}>
                     <div style={{
                        fontFamily:"'Syne',sans-serif",fontSize:"4.5rem",fontWeight:700,
                        color: "#b3b3b3", filter:"drop-shadow(0 0 15px rgba(255,255,255,0.4))"
                     }}>$</div>
                   </div>
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"clamp(2rem,3vw,2.8rem)",fontWeight:800,color:"#b3b3b3",letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:"20px" }}>
                  Your money.<br />Moving at light speed.
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"1.05rem",color:"rgba(255,255,255,.45)",lineHeight:1.7,fontWeight:300,maxWidth:"85%" }}>
                  No delay periods. No processing windows. QuickPay routes every bit in real-time.
                </p>
              </div>
            </BlurFadeUp>

            {/* Right top */}
            <BlurFadeUp delay={0.2}>
              <div style={{ padding:"48px",border:"1px solid rgba(255,255,255,.06)",borderRadius:"20px",background:"rgba(255,255,255,.015)", position:"relative", overflow:"hidden" }}>
                <div style={{ color:"#fff", marginBottom:"20px", padding:"12px", background:"rgba(255,255,255,0.05)", display:"inline-block", borderRadius:"12px" }}>{Icons.lock}</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"1.3rem",fontWeight:700,color:"#fff",marginBottom:"12px" }}>Bank-Grade Encryption</div>
                <p style={{ fontFamily:"'Inter',sans-serif",fontSize:".95rem",color:"rgba(255,255,255,.4)",lineHeight:1.6 }}>Every packet is signed with 256-bit curves. Your payload never touches unencrypted storage zones.</p>
              </div>
            </BlurFadeUp>

            {/* Right bottom */}
            <BlurFadeUp delay={0.4}>
              <div style={{ padding:"48px",border:"1px solid rgba(255,255,255,.12)",borderRadius:"20px",background:"rgba(255,255,255,.04)", boxShadow:"0 10px 40px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                <div style={{ color:"#fff", marginBottom:"20px", padding:"12px", background:"rgba(255,255,255,0.08)", display:"inline-block", borderRadius:"12px" }}>{Icons.lightning}</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:"1.3rem",fontWeight:700,color:"#fff",marginBottom:"12px", textShadow:"0 0 15px rgba(255,255,255,0.2)" }}>0.3s Average Execution</div>
                <p style={{ fontFamily:"'Inter',sans-serif",fontSize:".95rem",color:"rgba(255,255,255,.5)",lineHeight:1.6 }}>Benchmarked faster than any competing ledger in independent testing—consistently.</p>
              </div>
            </BlurFadeUp>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" style={{ padding:"0 6vw 140px",position:"relative",zIndex:2,scrollMarginTop:"120px" }}>
        <div style={{ maxWidth:"1200px",margin:"0 auto" }}>
          <div style={{ marginBottom:"80px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <BlurFadeUp delay={0}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:"12px",marginBottom:"24px" }}>
                <div style={{ width:40,height:"1px",background:"rgba(255,255,255,0.3)" }} />
                <span style={{ fontFamily:"'Inter',sans-serif",fontSize:".8rem",fontWeight:500,color:"rgba(255,255,255,0.6)",letterSpacing:".12em",textTransform:"uppercase" }}>
                  Simple Pricing
                </span>
                <div style={{ width:40,height:"1px",background:"rgba(255,255,255,0.3)" }} />
              </div>
            </BlurFadeUp>
            <RevealText
              tag="h2"
              delay={0.1}
              gradient={true}
              style={{
                fontFamily:"'Syne',sans-serif",
                fontSize:"clamp(2.5rem,4vw,3.5rem)",
                fontWeight:800,letterSpacing:"-0.03em",
                lineHeight:1.1,maxWidth:"600px",
              }}
            >
              Scale without limits.
            </RevealText>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"32px", alignItems:"center" }}>
            <PricingCard 
              tier="Developer" 
              price="$0" 
              desc="Perfect to test the rails and build your first full-stack integration."
              features={["10,000 requests/month", "Sandbox Environment", "Community Support"]}
              delay={0.1}
            />
            <PricingCard 
              tier="Pro" 
              price="$49" 
              desc="For fast-growing startups that need higher rate limits and live analytics."
              features={["500,000 requests/month", "Production Environment", "Real-time Analytics", "Email Support"]}
              recommended={true}
              delay={0.25}
            />
            <PricingCard 
              tier="Enterprise" 
              price="Custom" 
              desc="Dedicated infrastructure, custom SLAs, and VIP hand-holding."
              features={["Unlimited requests", "Dedicated VPS Nodes", "99.99% SLA", "24/7 Phone Support"]}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:"0 6vw 160px",position:"relative",zIndex:2 }}>
        <div style={{ maxWidth:"1000px",margin:"0 auto" }}>
          <BlurFadeUp delay={0}>
            <div style={{
              padding:"100px 60px",
              border:"1px solid rgba(255,255,255,.12)",
              borderRadius:"24px",
              background:"linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%)",
              textAlign:"center",
              position:"relative",overflow:"hidden",
              boxShadow:"0 30px 80px rgba(0,0,0,0.5)",
            }}>
              {/* aesthetic grid top/bottom within CTA */}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize:"40px 40px", maskImage:"radial-gradient(ellipse 60% 60% at 50% 50%, black 10%, transparent 100%)", pointerEvents:"none" }} />

              <RevealText
                tag="h2"
                delay={0.1}
                gradient={true}
                style={{
                  fontFamily:"'Syne',sans-serif",
                  fontSize:"clamp(2.5rem,6vw,4.5rem)",
                  fontWeight:800,letterSpacing:"-0.035em",
                  color:"#fff",lineHeight:1.05,marginBottom:"28px",
                  position:"relative",
                }}
              >
                Ready to move faster?
              </RevealText>

              <BlurFadeUp delay={0.3}>
                <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"1.15rem",fontWeight:300,color:"rgba(255,255,255,.45)",lineHeight:1.7,marginBottom:"54px",maxWidth:"450px",margin:"0 auto 54px", position:"relative" }}>
                  Join top-tier teams deploying capital globally. Free to initialize.
                </p>
              </BlurFadeUp>

              <BlurFadeUp delay={0.45} style={{ display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap", position:"relative" }}>
                <Link to="/signup" className="btn-main" style={{ padding:"16px 44px", fontSize:".9rem" }}>Start Free Trial</Link>
              </BlurFadeUp>
            </div>
          </BlurFadeUp>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{
        borderTop:"1px solid rgba(255,255,255,.05)",
        padding:"48px 6vw",
        position:"relative",zIndex:2,
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"30px",
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:"12px" }}>
          <AbstractLogo size={28} />
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"1.1rem",fontWeight:800,color:"rgba(255,255,255,.4)" }}>QuickPay</span>
        </div>
        <p style={{ fontFamily:"'Inter',sans-serif",fontSize:".9rem",color:"rgba(255,255,255,.25)",letterSpacing:".02em" }}>
          © 2026 QuickPay Systems · Fully Compliant
        </p>
        <div style={{ display:"flex",gap:"36px" }}>
          {["Privacy","Terms","API Status"].map(n=>(
            <a key={n} href="#" style={{ fontFamily:"'Inter',sans-serif",fontSize:".9rem",fontWeight:500,color:"rgba(255,255,255,.3)",textDecoration:"none",transition:"color .2s",cursor:"none" }}
            onMouseEnter={e=>e.target.style.color="#fff"}
            onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.3)"}>{n}</a>
          ))}
        </div>
      </footer>
    </>
  );
}
