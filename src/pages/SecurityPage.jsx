import { useEffect } from 'react';

export default function SecurityPage() {
  useEffect(() => {
    if (localStorage.getItem('token')) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', color: 'white', padding: '28px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h1 style={{ margin: 0, fontSize: 42 }}>Security</h1>
          <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 16, lineHeight: 1.6 }}>
            A quick overview of how this demo handles authentication and protects your chat sessions.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}
        >
          <SecurityCard
            icon="🔐"
            title="Token-based auth"
            body="API requests and socket authentication use a JWT stored in localStorage. The backend verifies the token before allowing socket events."
          />
          <SecurityCard
            icon="🧾"
            title="Protected endpoints"
            body="Routes like `/api/auth/me` and messages APIs require the `Authorization: Bearer <token>` header."
          />
          <SecurityCard
            icon="🛡️"
            title="Socket middleware"
            body="The socket server rejects connections when no token is provided and verifies JWT on connect."
          />
          <SecurityCard
            icon="📡"
            title="Presence & read status"
            body="Typing indicators and delivery/read updates are tied to authenticated user identity."
          />
        </div>

        <div
          style={{
            marginTop: 22,
            borderRadius: 14,
            padding: 22,
            background: 'linear-gradient(90deg, #0b1220, #0f172a)',
            border: '1px solid rgba(148, 163, 184, 0.15)'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24 }}>Security note</h2>
          <p style={{ marginTop: 10, marginBottom: 18, color: '#94a3b8', lineHeight: 1.6 }}>
            This is a demo UI. For production, prefer secure token storage, HTTPS-only transport, and
            stronger client-side protections.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              background: '#22c55e',
              color: 'white',
              padding: '12px 18px',
              borderRadius: 10,
              fontWeight: 700
            }}
          >
            Start chatting →
          </a>
        </div>
      </div>
    </div>
  );
}

function SecurityCard({ icon, title, body }) {
  return (
    <div style={{ background: '#111827', borderRadius: 14, padding: 18, border: '1px solid rgba(148, 163, 184, 0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(34, 197, 94, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18
          }}
        >
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      </div>
      <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

