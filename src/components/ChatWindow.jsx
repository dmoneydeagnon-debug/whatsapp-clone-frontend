import { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import TypingBubble from './TypingBubble';
import MessageBubble from './MessageBubble';



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
  stopRecording,
  isOtherTyping,
  otherTypingName,
  onTyping,
  onStopTyping,
  onReact,
  onDeleteMessage
}) => {

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, selectedChat]);

  const getPlayableAudioUrl = (url) => {
    if (!url) return url;

    // Backend already uploads voice as mp3 via Cloudinary (see backend/routes/upload.js).
    // So if the URL is already playable, just return it.
    // Fallback: if it isn't in the expected Cloudinary /upload/ format, don't rewrite.
    if (!url.includes('/upload/')) return url;
    if (url.includes('/upload/f_')) return url;

    // If for some reason the stored URL isn't mp3-transcoded, keep existing behavior.
    return url.replace('/upload/', '/upload/f_mp3/');
  };

  return (
    <>
      <div style={{ padding: '20px', borderBottom: '1px solid #334155', background: '#1e2937', display: 'flex', alignItems: 'center' }}>
        {isMobile && (
          <button
            onClick={onBack}
            title="Back"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '1px solid #475569',
              background: '#0f172a',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '14px',
              flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
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
            <div style={{ fontSize: '13px', color: isOtherTyping ? '#93c5fd' : (selectedChat.isOnline ? '#10b981' : '#94a3b8') }}>
              {isOtherTyping ? `${otherTypingName || 'Someone'} typing...` : (selectedChat.isOnline ? 'Online' : `Last seen ${new Date(selectedChat.lastSeen).toLocaleTimeString()}`)}
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
              <MessageBubble
                msg={msg}
                isMine={msg.sender?.toString() === user._id?.toString()}
                isMobile={isMobile}
                getPlayableAudioUrl={getPlayableAudioUrl}
                onReact={onReact}
                onDeleteMessage={onDeleteMessage}
              />


              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: msg.sender?.toString() === user._id?.toString() ? 'flex-end' : 'flex-start' }}>
                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

            </div>
          ))
        )}
        <div style={{ marginTop: 8 }}>
          <TypingBubble isOtherTyping={isOtherTyping} otherName={otherTypingName} />
        </div>
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
          isMobile={isMobile}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          selectedChat={selectedChat}
        />
      </div>
    </>
  );
};

export default ChatWindow;
