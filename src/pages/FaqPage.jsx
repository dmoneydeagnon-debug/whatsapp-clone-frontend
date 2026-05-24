import { useEffect, useState } from 'react';

export default function FaqPage() {
  useEffect(() => {
    if (localStorage.getItem('token')) {
      window.location.href = '/login';
    }
  }, []);

  const faqs = [
    {
      q: 'How do I log in?',
      a: 'Use the Login page with email/phone + password, or click Google login.'
    },
    {
      q: 'Do messages update in real time?',
      a: 'Yes. The app uses socket.io to deliver messages instantly to the receiver and update your chat UI.'
    },
    {
      q: 'What media types are supported?',
      a: 'Images, files, and voice messages are supported. Uploads go through /api/upload.'
    },
    {
      q: 'What are delivery / read statuses?',
      a: 'They indicate whether the message was delivered to the recipient and whether it was marked as read.'
    },
    {
      q: 'Can I react to messages?',
      a: 'Yes. Tap/Right-click a message to open the emoji picker and send reactions.'
    },
    {
      q: 'Is this production-ready encryption?',
      a: 'This is a demo UI. It implements authenticated sockets and message statuses, but it does not provide end-to-end encryption in this codebase.'
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', color: 'white', padding: '28px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h1 style={{ margin: 0, fontSize: 42 }}>FAQ</h1>
          <p style={{ color: '#94a3b8', marginTop: 12, fontSize: 16, lineHeight: 1.6 }}>
            Quick answers about FunChat.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {faqs.map((item, idx) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex((prev) => (prev === idx ? -1 : idx))}
            />
          ))}
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
          <h2 style={{ margin: 0, fontSize: 24 }}>Still have questions?</h2>
          <p style={{ marginTop: 10, marginBottom: 18, color: '#94a3b8', lineHeight: 1.6 }}>
            Sign in and try the chat UI—most features are self-explanatory.
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
            Go to Login →
          </a>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div
      style={{
        background: '#111827',
        borderRadius: 14,
        padding: 16,
        border: '1px solid rgba(148, 163, 184, 0.12)'
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: 'white',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700 }}>{q}</span>
        <span style={{ color: '#22c55e', fontSize: 18 }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <p style={{ margin: '10px 0 0', color: '#94a3b8', lineHeight: 1.6 }}>{a}</p>}
    </div>
  );
}

