import { useEffect, useMemo, useRef, useState } from 'react';
import CompactAudioPlayer from './CompactAudioPlayer';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageBubble = ({
  msg,
  isMine,
  isMobile,
  getPlayableAudioUrl,
  onReact,
  onDeleteMessage
}) => {
  // Prevent white-screen crashes on reload if a message is temporarily undefined
  if (!msg) return null;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const rootRef = useRef(null);
  const longPressTimerRef = useRef(null);

  const groupedReactions = useMemo(() => {
    const reactions = Array.isArray(msg.reactions) ? msg.reactions : [];
    const counts = new Map();

    for (const r of reactions) {
      if (!r?.emoji) continue;
      counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count);
  }, [msg.reactions]);

  const openPicker = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setPickerOpen(true);
    setDeleteOpen(false);
  };

  const closePicker = () => {
    setPickerOpen(false);
  };

  const closeDelete = () => setDeleteOpen(false);

  useEffect(() => {
    if (!pickerOpen) return;

    const onDoc = (ev) => {
      if (!rootRef.current) return closePicker();
      if (!rootRef.current.contains(ev.target)) closePicker();
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
    };
  }, [pickerOpen]);

  const handleTouchStart = (e) => {
    // long-press: open picker
    longPressTimerRef.current = window.setTimeout(() => {
      openPicker(e);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      ref={rootRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMine ? 'flex-end' : 'flex-start'
      }}
      onContextMenu={(e) => openPicker(e)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '12px 18px',
          borderRadius: '18px',
          background: isMine ? '#10b981' : '#334155',
          maxWidth: isMobile ? '90%' : '70%',
          boxSizing: 'border-box',
          overflowWrap: 'anywhere',
          userSelect: 'text'
        }}
      >
        {msg?.deletedForEveryone ? (
          <div style={{ color: '#e2e8f0', fontStyle: 'italic' }}>This message has been deleted</div>
        ) : (
          <>
            {msg.mediaType === 'image' && (
              <img src={msg.mediaUrl} style={{ maxWidth: '200px', borderRadius: '10px' }} />
            )}
            {msg.mediaType === 'voice' && (
              <CompactAudioPlayer src={getPlayableAudioUrl(msg.mediaUrl)} isMobile={isMobile} />
            )}
            {msg.mediaType === 'file' && (
              <div>
                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" style={{ color: '#a5f3fc', wordBreak: 'break-all' }}>
                  Download file
                </a>
              </div>
            )}
            {msg.text}
          </>
        )}
      </div>

      {groupedReactions.length > 0 && !msg?.deletedForEveryone && (
        <div
          style={{
            marginTop: 6,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: isMine ? 'flex-end' : 'flex-start',
            maxWidth: isMobile ? '90%' : '70%'
          }}
        >
          {groupedReactions.map(({ emoji, count }) => (
            <button
              key={emoji}
              onClick={() => onReact?.(msg._id, emoji)}
              style={{
                border: 'none',
                cursor: 'pointer',
                background: isMine ? 'rgba(2,132,199,0.15)' : 'rgba(16,185,129,0.15)',
                color: isMine ? '#e0f2fe' : '#ecfdf5',
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              title="React"
            >
              <span>{emoji}</span>
              <span style={{ opacity: 0.9 }}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction picker */}
      {pickerOpen && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: isMobile ? 92 : 140,
            background: '#0b1220',
            border: '1px solid #1f2937',
            borderRadius: 12,
            padding: '10px 10px',
            display: 'flex',
            gap: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact?.(msg._id, emoji);
                closePicker();
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1px solid #334155',
                background: '#111827',
                color: 'white',
                cursor: 'pointer',
                fontSize: 18
              }}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={closePicker}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid #334155',
              background: '#111827',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 16
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      )}

      {/* Delete icon at top-right of the overlay */}
      {pickerOpen && (
        <div
          style={{
            position: 'fixed',
            zIndex: 10001,
            top: isMobile ? 90 : 70,
            right: 22,
            width: 46,
            height: 46,
            borderRadius: 12,
            background: '#111827',
            border: '1px solid #ef4444',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
          title="Delete"
        >
          <button
            onClick={() => {
              closePicker();
              setDeleteOpen(true);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1
            }}
          >
            🗑️
          </button>
        </div>
      )}

      {/* Delete modal */}
      {deleteOpen && (
        <div
          style={{
            position: 'fixed',
            zIndex: 10000,
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: isMobile ? 92 : 140,
            background: '#0b1220',
            border: '1px solid #1f2937',
            borderRadius: 12,
            padding: 12,
            width: isMobile ? '92vw' : 320,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontWeight: 700, marginBottom: 10, color: '#e2e8f0' }}>Delete message</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => {
                onDeleteMessage?.(msg._id, 'me');
                setDeleteOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #334155',
                background: '#111827',
                color: '#e2e8f0',
                cursor: 'pointer'
              }}
            >
              Delete for only me
            </button>

            <button
              onClick={() => {
                onDeleteMessage?.(msg._id, 'everyone');
                setDeleteOpen(false);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #ef4444',
                background: '#111827',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Delete for everyone
            </button>

            <button
              onClick={closeDelete}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

