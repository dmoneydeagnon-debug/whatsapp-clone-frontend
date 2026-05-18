import { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';

const ChatWindow = ({
  selectedChat,
  currentMessages,
  user,
  isMobile,
  onBack,
  messageText,
  setMessageText,
  sendMessage,
  sendMediaMessage,
  startRecording,
  stopRecording
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, selectedChat]);

  return (
    <>
      <div style={{ padding: '20px', borderBottom: '1px solid #334155', background: '#1e2937', display: 'flex', alignItems: 'center' }}>
        {isMobile && (
          <button onClick={onBack} style={{ marginRight: '15px', fontSize: '28px' }}>
            ←
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {selectedChat.avatar ? (
              <img src={selectedChat.avatar} alt={selectedChat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{selectedChat.name?.[0]}</span>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{selectedChat.name}</h2>
            <div style={{ fontSize: '13px', color: selectedChat.isOnline ? '#10b981' : '#94a3b8' }}>
              {selectedChat.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#0f172a' }}>
        {currentMessages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            No messages yet. Say hello!
          </div>
        ) : (
          currentMessages.map((msg) => (
            <div key={msg._id} style={{ marginBottom: '15px', textAlign: msg.sender?.toString() === user._id?.toString() ? 'right' : 'left' }}>
              <div style={{ display: 'inline-block', padding: '12px 18px', borderRadius: '18px', background: msg.sender?.toString() === user._id?.toString() ? '#10b981' : '#334155', maxWidth: '70%' }}>
                {msg.mediaType === 'image' && <img src={msg.mediaUrl} style={{ maxWidth: '200px', borderRadius: '10px' }} />}
                {msg.mediaType === 'voice' && <audio controls src={msg.mediaUrl} />}
                {msg.mediaType === 'file' && (
                  <div>
                    <a href={msg.mediaUrl} target="_blank" rel="noreferrer" style={{ color: '#a5f3fc', wordBreak: 'break-all' }}>
                      Download file
                    </a>
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '20px', background: '#1e2937' }}>
        <MessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          sendMessage={sendMessage}
          sendMediaMessage={sendMediaMessage}
          startRecording={startRecording}
          stopRecording={stopRecording}
        />
      </div>
    </>
  );
};

export default ChatWindow;
