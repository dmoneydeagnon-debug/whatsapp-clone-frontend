


import { Link } from 'react-router-dom';

const LandingPage = () => {

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
          background: #0b1220;
          color: white;
        }

        .container {
          padding: 20px 8%;
        }

        /* NAVBAR */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-weight: bold;
          font-size: 20px;
          color: #22c55e;
        }

        .nav-links a {
          margin: 0 15px;
          color: #aaa;
          text-decoration: none;
        }

        .nav-buttons button {
          margin-left: 10px;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        .login {
          background: transparent;
          color: #aaa;
        }

        .cta {
          background: #22c55e;
          color: white;
        }

        /* HERO */
        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 60px;
          flex-wrap: wrap;
        }

        .hero-text {
          max-width: 500px;
        }

        .hero h1 {
          font-size: 48px;
        }

        .hero span {
          color: #22c55e;
        }

        .hero p {
          color: #aaa;
          margin: 20px 0;
        }

        .hero-buttons button {
          margin-right: 10px;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        .outline {
          background: transparent;
          border: 1px solid #444;
          color: white;
        }

        .users {
          margin-top: 20px;
          color: #aaa;
        }

        .hero-image img {
          width: 520px;
          border-radius: 20px;
          box-shadow: 0 0 50px rgba(34, 197, 94, 0.3);
          display: block;
        }

        /* FEATURES */
        .features {
          text-align: center;
          margin-top: 80px;
        }

        .features h2 {
          margin-bottom: 40px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .feature {
          background: #111827;
          padding: 20px;
          border-radius: 12px;
        }

        .feature span {
          font-size: 24px;
        }

        /* CTA */
        .cta-section {
          margin-top: 60px;
          padding: 30px;
          text-align: center;
          background: linear-gradient(90deg, #0b1220, #0f172a);
          border-radius: 12px;
        }

        /* FOOTER */
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #777;
        }

        /* MOBILE */
        @media (max-width: 900px) {
          .hero {
            flex-direction: column;
            text-align: center;
          }

          .hero-image img {
            width: 100%;
            margin-top: 30px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        {/* NAVBAR */}
        <div className="navbar">
          <div className="logo">💬 FunChat</div>

          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/security">Security</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
          </div>

          <div className="nav-buttons">
            <Link to="/login" className="nav-link-button login" style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 8, color: '#aaa', textDecoration: 'none', marginLeft: 10 }}>
              Login
            </Link>
            <Link to="/register" className="nav-link-button cta" style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 8, background: '#22c55e', color: 'white', textDecoration: 'none', marginLeft: 10 }}>
              Get Started
            </Link>
          </div>
        </div>


        {/* HERO */}
        <div className="hero">
          <div className="hero-text">
            <h1>
              Chat. Connect. <br />
              <span>Have Fun 👋</span>
            </h1>

            <p>
              FunChat is a real-time messaging app that helps you connect
              with friends and family, share moments, and stay in touch —
              anytime, anywhere.
            </p>

            <div className="hero-buttons">
              <a
                href="/register"
                className="cta"
                style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 8, textDecoration: 'none', color: 'white', marginRight: 10 }}
              >
                Start Chatting →
              </a>
              <a
                href="/about"
                className="outline"
                style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 8, border: '1px solid #444', textDecoration: 'none', color: 'white' }}
              >
                Learn More
              </a>
            </div>


            <div className="users">👥 Join 10,000+ users who love FunChat</div>
          </div>

          <div className="hero-image">
            <img src={"/chat-ui.png"} alt="Chat UI" />
          </div>
        </div>

        {/* FEATURES */}
        <div className="features">
          <h2>Why Choose FunChat?</h2>

          <div className="feature-grid">
            <div className="feature">
              <span>⚡</span>
              <h3>Real-time Messaging</h3>
              <p>Send and receive messages instantly.</p>
            </div>

            <div className="feature">
              <span>🖼️</span>
              <h3>Share Moments</h3>
              <p>Images, videos, and voice messages.</p>
            </div>

            <div className="feature">
              <span>🔒</span>
              <h3>Secure & Private</h3>
              <p>Your chats are encrypted.</p>
            </div>

            <div className="feature">
              <span>📱</span>
              <h3>Always Connected</h3>
              <p>Access from any device.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <p>Ready to start your journey?</p>
          <a
            href="/register"
            className="cta"
            style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 8, textDecoration: 'none', color: 'white' }}
          >
            Start Chatting Now →
          </a>
        </div>


        {/* FOOTER */}
        <div className="footer">© 2026 FunChat. All rights reserved.</div>
      </div>
    </>
  );
};

export default LandingPage;


