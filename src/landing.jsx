import { useEffect, useState } from 'react';

import exampleImg from '../example.png';

const Landing = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#0b1220', color: 'white' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(11,18,32,0.75)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg,#10b981,#2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                letterSpacing: 0.5
              }}
            >
              FC
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>FunChat</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Chat app UI clone</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => alert('Hook up to your routing/login flow')}
              style={{
                border: '1px solid #334155',
                background: '#0f172a',
                color: 'white',
                borderRadius: 9999,
                padding: '10px 14px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => alert('Hook up to your routing/login flow')}
              style={{
                border: 'none',
                background: '#10b981',
                color: 'white',
                borderRadius: 9999,
                padding: '10px 14px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: isMobile ? '26px 16px' : '44px 20px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
          gap: 22,
          alignItems: 'center'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              gap: 10,
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: 9999,
              background: '#0f172a',
              border: '1px solid #334155'
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: '#10b981',
                display: 'inline-block'
              }}
            />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>
              Real-time messaging • Media • Voice
            </span>
          </div>
          <h1
            style={{
              marginTop: 16,
              marginBottom: 12,
              fontSize: isMobile ? 34 : 46,
              lineHeight: 1.05,
              letterSpacing: -0.6
            }}
          >
            A WhatsApp-style chat UI, <span style={{ color: '#10b981' }}> built fast</span>.
          </h1>
          <p style={{ maxWidth: 520, color: '#94a3b8', fontSize: 16, lineHeight: 1.6 }}>
            Clean sidebar + chat window, voice recording, image/file uploads with crop, and message statuses.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
            <button
              onClick={() => alert('Connect this to your app routing')}
              style={{
                border: 'none',
                background: '#2563eb',
                color: 'white',
                borderRadius: 9999,
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              Try the chat UI
            </button>
            <button
              onClick={() => alert('Add a link to docs/feature list')}
              style={{
                border: '1px solid #334155',
                background: '#0f172a',
                color: 'white',
                borderRadius: 9999,
                padding: '12px 16px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              View features
            </button>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
            {[
              { title: 'Media messages', desc: 'Upload images, files, and audio.', icon: '🖼️' },
              { title: 'Voice recording', desc: 'Record and send voice notes.', icon: '🎙️' },
              { title: 'Status updates', desc: 'Sent / delivered / read UI.', icon: '✅' }
            ].map((f) => (
              <div key={f.title} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 20 }}>{f.icon}</div>
                <div style={{ fontWeight: 900, marginTop: 8 }}>{f.title}</div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right preview */}
        <div>
          <div
            style={{
              borderRadius: 22,
              background: '#0f172a',
              border: '1px solid #334155',
              padding: 14,
              boxShadow: '0 30px 80px rgba(0,0,0,0.35)'
            }}
          >
            <div style={{ borderBottom: '1px solid #1f2a44', padding: '10px 10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#10b981' }} />
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>Preview</div>
            </div>

            <div style={{ marginTop: 12, borderRadius: 18, overflow: 'hidden', border: '1px solid #1f2a44' }}>
              <img
                src={exampleImg}
                alt="Landing page preview"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 14, color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
            Tip: Replace this image with a screenshot of your actual chat UI if you want the landing page to match perfectly.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1f2a44', padding: '18px 20px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
        © {new Date().getFullYear()} FunChat. Built with React + Vite.
      </div>
    </div>
  );
};

export default Landing;

