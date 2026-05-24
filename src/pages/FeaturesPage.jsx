import { useEffect } from 'react';

export default function FeaturesPage() {
  // If user is logged in, send them to the chat UI immediately.
  useEffect(() => {
    if (localStorage.getItem('token')) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', color: 'white', padding: '28px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 42, margin: 0 }}>Features</h1>
          <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 16 }}>
            Everything you need for a fun, fast, real-time chat experience.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16
          }}
        >
          <FeatureCard
            title="Real-time Messaging"
            icon="⚡"
            desc="Send and receive messages instantly using socket.io."
          />
          <FeatureCard
            title="Media + Voice"
            icon="🖼️"
            desc="Share images, files, and voice messages directly in the chat."
          />
          <FeatureCard
            title="Typing Indicators"
            icon="⌨️"
            desc="Show when someone is typing so conversations feel alive."
          />
          <FeatureCard
            title="Delivery / Read Status"
            icon="✅"
            desc="Track delivery and read states to know what your contact received."
          />
          <FeatureCard
            title="Message Reactions"
            icon="😀"
            desc="React to messages with emojis."
          />
          <FeatureCard
            title="Profile & Avatar"
            icon="👤"
            desc="Update your profile and avatar."
          />
          <FeatureCard
            title="Status Online / Last Seen"
            icon="🟢"
            desc="See online presence and last seen timestamps."
          />
          <FeatureCard
            title="Responsive UI"
            icon="📱"
            desc="Works smoothly on mobile and desktop layouts."
          />
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 22,
            borderRadius: 14,
            background: 'linear-gradient(90deg, #0b1220, #0f172a)',
            border: '1px solid rgba(148, 163, 184, 0.15)'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 24 }}>Ready to start chatting?</h2>
          <p style={{ color: '#94a3b8', marginTop: 10, marginBottom: 18 }}>
            Sign in to access your chats.
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
              fontWeight: 600
            }}
          >
            Go to Login →
          </a>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, icon, desc }) {
  return (
    <div
      style={{
        background: '#111827',
        borderRadius: 14,
        padding: 18,
        border: '1px solid rgba(148, 163, 184, 0.12)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
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
      <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

