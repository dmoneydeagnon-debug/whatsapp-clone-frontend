import { useRef } from 'react';

const MessageInput = ({
  messageText,
  setMessageText,
  sendMessage,
  sendMediaMessage,
  startRecording,
  stopRecording,
  isMobile
}) => {
  const fileInputRef = useRef(null);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'nowrap',
      width: '100%',
      minWidth: 0
    }}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Attach file"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid #475569',
          background: '#1f2937',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          sendMediaMessage(file);
          e.target.value = null;
        }}
      />

      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
        style={{
          flex: 1,
          minWidth: 0,
          padding: '14px 16px',
          borderRadius: '9999px',
          background: '#334155',
          border: 'none',
          color: 'white',
          height: '44px'
        }}
      />

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        title="Record voice"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid #475569',
          background: '#1f2937',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" />
          <path d="M19 10V12C19 15.3137 16.3137 18 13 18H11C7.68629 18 5 15.3137 5 12V10" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      <button
        onClick={sendMessage}
        title="Send message"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: '#10b981',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          flexShrink: 0
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;
