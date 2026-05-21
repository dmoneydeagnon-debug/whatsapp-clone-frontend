import { useEffect, useState } from 'react';

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
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '26px 16px' : '44px 20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: 22, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center', padding: '8px 12px', borderRadius: 9999, background: '#0f172a', border: '1px solid #334155' }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>Real-time messaging • Media • Voice</span>
          </div>
          <h1 style={{ marginTop: 16, marginBottom: 12, fontSize: isMobile ? 34 : 46, lineHeight: 1.05, letterSpacing: -0.6 }}>
            A WhatsApp-style chat UI,
            <span style={{ color: '#10b981' }}> built fast</span>.
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

        {/* Right mock */}
        <div>
          <div style={{ borderRadius: 22, background: '#0f172a', border: '1px solid #334155', padding: 14, boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px 12px', borderBottom: '1px solid #1f2a44' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#f59e0b' }} />
                <div style={{ width: 10, height: 10, borderRadius: 999, background: '#10b981' }} />
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>Live preview</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.45fr 0.55fr', gap: 10, paddingTop: 12 }}>
              <div style={{ borderRadius: 18, background: '#111827', border: '1px solid #1f2a44', padding: 10 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, marginBottom: 10 }}>Chats</div>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 8px', borderRadius: 12, background: i === 1 ? '#1f3a8a' : 'transparent' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: '#334155' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>User {i + 1}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Last message preview…</div>
                    </div>
                    {i === 2 && <div style={{ width: 22, height: 22, borderRadius: 999, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>3</div>}
                  </div>
                ))}
              </div>

              <div style={{ borderRadius: 18, background: '#0b1220', border: '1px solid #1f2a44', padding: 10, display: 'flex', flexDirection: 'column', minHeight: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 6px 10px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: '#334155' }} />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>User 2</div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 800 }}>Online</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 20, color: '#94a3b8' }}>⋮</div>
                </div>

                <div style={{ flex: 1, background: '#0f172a', border: '1px solid #1f2a44', borderRadius: 14, padding: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ alignSelf: 'flex-start', background: '#334155', color: 'white', padding: '10px 12px', borderRadius: 16, maxWidth: '80%' }}>
                      Hello! 👋
                    </div>
                    <div style={{ alignSelf: 'flex-end', background: '#10b981', color: 'white', padding: '10px 12px', borderRadius: 16, maxWidth: '80%' }}>
                      Sent via voice / media too ✅
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, paddingTop: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#111827', border: '1px solid #1f2a44', borderRadius: 9999, padding: '10px 14px', color: '#94a3b8', fontWeight: 700, fontSize: 13 }}>
                    Type a message…
                  </div>
                  <button style={{ width: 42, height: 42, borderRadius: 9999, border: 'none', background: '#10b981', cursor: 'pointer', color: 'white', fontWeight: 900 }}>➤</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>
            Tip: Replace the buttons with real navigation (react-router) to wire the landing page to your existing chat app.
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

