import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  BookOpen,
  Headphones,
  PenTool,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Mail,
  MapPin,
  User,
  Code,
  Send,
  Zap,
  Award,
  Globe,
  Briefcase,
  GraduationCap,
  Heart,
  Phone,
  Mic,
} from "lucide-react";
import { FaTelegramPlane } from "react-icons/fa";
import "./About.css";

const BOT_TOKEN = "8737059362:AAFDcMj7evSK1wl27g-o_eUmUu4ntTgekV8";
const CHAT_ID = "7747756904";

export default function About() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const foundersRef = useRef(null);
  const contactRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const move = (e) => {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          life: 50,
        });
      }
    };
    window.addEventListener("mousemove", move);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  const go = () => {
    navigate("/login");
    setMenuOpen(false);
  };

  const goPage = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const scrollTo = (ref) => {
    setMenuOpen(false);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setSending(true);
    setError("");
    const text =
      `📩 *New Message — Cefr Center*\n\n` +
      `👤 *Name:* ${form.name}\n` +
      `📧 *Email:* ${form.email}\n` +
      `💬 *Message:* ${form.message}`;
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text,
            parse_mode: "Markdown",
          }),
        }
      );
      const data = await res.json();
      if (data.ok) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError("Error sending message.");
      }
    } catch {
      setError("An internet error occurred.");
    }
    setSending(false);
  };

  // ── Scroll Reveal Logic ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  // ── Counter Logic ──
  function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      }, { threshold: 0.1 });
      
      if (countRef.current) observer.observe(countRef.current);
      return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={countRef}>{count}{suffix}</span>;
  }

  return (
    <div className="about-page">
      <canvas ref={canvasRef} className="cursor-canvas"></canvas>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo" onClick={() => goPage("/")}>Cefr Center</div>

        <div className="nav-menu">
          <p onClick={() => scrollTo(foundersRef)}>About</p>
          <p onClick={() => scrollTo(contactRef)}>Contact</p>
        </div>

        <div className="nav-right">
          <button className="start-btn" onClick={go}>
            Start <ArrowRight size={16} />
          </button>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <p onClick={() => scrollTo(foundersRef)}>About</p>
          <p onClick={() => scrollTo(contactRef)}>Contact</p>
          <button className="mobile-start-btn" onClick={go}>
            Start <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="about-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} /> Cefr Exam Preparation
          </div>
          <h1>
            Master <span>Cefr</span><br />with Confidence
          </h1>
          <p>
            Professional Cefr exam preparation platform with AI-powered
            feedback, real exam simulations, and expert instructors.
          </p>
          <div className="hero-buttons">
            <button onClick={go} className="btn-red">
              <Zap size={16} /> Start Free
            </button>
            <button onClick={() => scrollTo(foundersRef)} className="btn-outline">
              <User size={16} /> Meet the Team
            </button>
          </div>
          <div className="hero-stats reveal">
            <div className="stat-box">
              <h3><AnimatedCounter end={500} suffix="+" /></h3>
              <p><GraduationCap size={13} /> Students</p>
            </div>
            <div className="stat-box">
              <h3>A1–C2</h3>
              <p><Award size={13} /> All Levels</p>
            </div>
            <div className="stat-box">
              <h3><AnimatedCounter end={4} /></h3>
              <p><BookOpen size={13} /> Skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section reveal">
        <div className="section-label"><Zap size={14} /> What We Offer</div>
        <h2>Everything You Need</h2>
        <p className="section-sub">
          Comprehensive tools designed to help you pass CEFR exams with top scores.
        </p>
        <div className="features-grid features-grid-4">
          <div className="feature-card">
            <div className="feature-icon"><BookOpen size={26} /></div>
            <h3>Reading</h3>
            <p>
              Practice with authentic CEFR-level reading passages. Improve
              comprehension, vocabulary, and speed across all 6 levels.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Headphones size={26} /></div>
            <h3>Listening</h3>
            <p>
              Train with native speaker recordings and accents. Build your
              listening accuracy with timed exercises and instant scoring.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><PenTool size={26} /></div>
            <h3>Writing</h3>
            <p>
              Submit essays and get AI-powered feedback on grammar, structure,
              coherence, and lexical range — just like a real examiner.
            </p>
          </div>
          <div className="feature-card speaking-card">
            <div className="feature-icon speaking-icon">
              <Mic size={26} />
              <span className="speaking-pulse"></span>
            </div>
            <h3>Speaking</h3>
            <p>
              Record your answers and receive instant AI feedback on
              pronunciation, fluency, and coherence. Practice real CEFR
              speaking tasks at any level.
            </p>
            <div className="speaking-tags">
              <span className="stag">AI Feedback</span>
              <span className="stag">Pronunciation</span>
              <span className="stag">Fluency</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="team-section reveal" ref={foundersRef} id="founders">
        <div className="section-label"> Our Team</div>
        <h2>Meet the Founders</h2>
        <p className="section-sub">
          Passionate educators and developers dedicated to making CEFR
          preparation accessible and effective for everyone.
        </p>

        <div className="dev-grid">
          <div className="dev-card">
            <div className="dev-card-top">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="Asatillo Alisherov"
              />
              <span className="dev-badge instructor-badge">
                <Award size={12} /> Head Instructor
              </span>
            </div>
            <h3>Asatillo Alisherov</h3>
            <p className="dev-role">
              <GraduationCap size={14} /> CEFR & IELTS Instructor
            </p>
            <p className="dev-bio-text">
              Over <strong>3 years</strong> of experience teaching English at
              B2–C2 levels. Certified IELTS and Cambridge examiner with a track
              record of helping 300+ students achieve their target scores.
            </p>
            <ul className="dev-facts">
              <li><Award size={13} /> Cambridge CELTA Certified</li>
              <li><Globe size={13} /> B2–C2 Specialist</li>
              <li><Briefcase size={13} /> 3+ Years Teaching</li>
              <li><GraduationCap size={13} /> 300+ Students Coached</li>
            </ul>
            <div className="dev-socials">
              <a
                href="https://t.me/unknown"
                target="_blank"
                rel="noreferrer"
                className="telegram-icon"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>

          <div className="dev-card">
            <div className="dev-card-top">
              <img
                src="xojiakbar.png"
                alt="Xojiakbar Xasanboyev"
              />
              <span className="dev-badge developer-badge">
                <Code size={12} /> Lead Developer
              </span>
            </div>
            <h3>Xojiakbar Xasanboyev </h3>
            <p className="dev-role">
              <Code size={14} /> Full-Stack Developer
            </p>
            <p className="dev-bio-text">
              <strong>2 years</strong> of experience building scalable web
              applications. Specializes in React, Node.js, and AI integration.
              Built the entire CEFR Center platform from scratch.
            </p>
            <ul className="dev-facts">
              <li><Code size={13} /> React & Node.js Expert</li>
              <li><Zap size={13} /> AI Integration Specialist</li>
              <li><Briefcase size={13} /> 2+ Years in Tech</li>
              <li><Globe size={13} /> 10+ Projects Launched</li>
            </ul>
            <div className="dev-socials">
              <a
                href="https://t.me/HojiakbarXasanboyev"
                target="_blank"
                rel="noreferrer"
                className="telegram-icon"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>
        </div>

        <div className="info-glass-card">
          <div className="badge">
            <ShieldCheck size={14} /> Secure & Trusted Platform
          </div>
          <p>
            All user data is fully encrypted and protected. We never share your
            information with third parties.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section reveal" ref={contactRef} id="contact">
        <div className="section-label"><Send size={14} /> Get in Touch</div>
        <h2>Contact Us</h2>
        <p className="section-sub">
          Have a question or want to learn more? Send us a message — we'll reply
          as soon as possible via Telegram.
        </p>

        <div className="contact-wrapper">
          <div className="contact-form-box">
            {sent ? (
              <div className="sent-success">
                <div className="sent-icon"><Send size={32} /></div>
                <h3>Message Sent!</h3>
                <p>Thank you! We'll get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="btn-red">
                  <ArrowRight size={15} /> Send Another
                </button>
              </div>
            ) : (
              <>
                <div className="input-group">
                  <User size={16} className="input-icon" />
                  <input
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <Mail size={16} className="input-icon" />
                  <input
                    placeholder="Your Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="input-group textarea-group">
                  <PenTool size={16} className="input-icon" />
                  <textarea
                    placeholder="Your Message"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  ></textarea>
                </div>
                {error && <p className="form-error">{error}</p>}
                <button
                  className="btn-red send-btn"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <span className="spinner"></span>
                  ) : (
                    <><Send size={15} /> Send Message</>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="contact-info">
            <h3>Reach us directly</h3>
            <div className="contact-item">
              <Mail size={18} />
              <div>
                <span className="ci-label">Email</span>
                <span className="ci-val">cefrcenter365@gmail.com</span>
              </div>
            </div>
            <div className="contact-item telegram-item">
              <FaTelegramPlane className="tg-contact-icon" />
              <div>
                <span className="ci-label">Telegram</span>
                <a
                  href="https://t.me/cefrcenter2"
                  target="_blank"
                  rel="noreferrer"
                  className="ci-val tg-link"
                >
                  @cefrcenter2
                </a>
              </div>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <div>
                <span className="ci-label">Phone</span>
                <span className="ci-val">+998 94 022 44 92</span>
              </div>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <div>
                <span className="ci-label">Location</span>
                <span className="ci-val">Andijan, Uzbekistan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Cefr Center</div>
            <p>
              Professional English exam preparation for A1–C2 levels. Join
              hundreds of students achieving their goals.
            </p>
            <div className="footer-social">
              <a
                href="https://t.me/cefrcenter2"
                target="_blank"
                rel="noreferrer"
                className="footer-tg"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Navigation</h4>
            <p onClick={() => scrollTo(foundersRef)}>About Us</p>
            <p onClick={() => scrollTo(contactRef)}>Contact</p>
            <p onClick={go}>Login</p>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <p onClick={go}>Reading Tests</p>
            <p onClick={go}>Listening Tests</p>
            <p onClick={go}>Writing Practice</p>
            <p onClick={go}>Speaking Practice</p>
          </div>

          <div className="footer-links">
            <h4>Contact</h4>
            <p><Mail size={13} style={{ marginRight: 6 }} />cefrcenter365@gmail.com</p>
            <p><MapPin size={13} style={{ marginRight: 6 }} />Andijan, Uzbekistan</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Cefr Center. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}