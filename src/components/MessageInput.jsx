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
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: '10px'
    }}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '12px 18px',
          borderRadius: '9999px',
          border: '1px solid #475569',
          background: '#1f2937',
          color: 'white',
          cursor: 'pointer',
          width: isMobile ? '100%' : 'auto',
          minWidth: 0
        }}
      >
        📎 Add file
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
          padding: '16px',
          borderRadius: '9999px',
          background: '#334155',
          border: 'none',
          color: 'white'
        }}
      />

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        style={{
          padding: '12px 18px',
          borderRadius: '9999px',
          border: '1px solid #475569',
          background: '#1f2937',
          color: 'white',
          cursor: 'pointer',
          width: isMobile ? '100%' : 'auto'
        }}
      >
        🎤 Hold
      </button>

      <button
        onClick={sendMessage}
        style={{
          padding: '12px 24px',
          background: '#10b981',
          border: 'none',
          borderRadius: '9999px',
          color: 'white',
          cursor: 'pointer',
          width: isMobile ? '100%' : 'auto'
        }}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
