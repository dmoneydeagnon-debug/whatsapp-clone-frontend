const TypingBubble = ({ isOtherTyping, otherName }) => {
  if (!isOtherTyping) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 18,
          background: '#334155',
          color: '#e2e8f0',
          maxWidth: '70%',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd' }}>
          {otherName || 'Someone'} is typing
        </span>
        <span style={{ fontSize: 13, opacity: 0.9 }}>…</span>
      </div>
    </div>
  );
};

export default TypingBubble;

