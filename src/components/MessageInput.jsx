import { useEffect, useMemo, useRef, useState } from 'react';

const MessageInput = ({
  messageText,
  setMessageText,
  sendMessage,
  sendMediaMessage,
  startRecording,
  stopRecording,
  onTyping,
  onStopTyping,
  selectedChat
}) => {
  const fileInputRef = useRef(null);

  // WhatsApp-like voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const timerRef = useRef(null);

  // gesture tracking
  const gestureRef = useRef({
    startY: 0,
    startX: 0
  });

  const [cancelArmed, setCancelArmed] = useState(false);

  const recordTimeLabel = useMemo(() => {
    const s = Math.floor(recordMs / 1000);
    const mm = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }, [recordMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const beginRecord = async (intent = 'send') => {
    if (!selectedChat?._id) return;
    if (isRecording) return;

    setCancelArmed(false);
    setIsRecording(true);
    setIsLocked(false);
    setRecordMs(0);

    gestureRef.current = {
      startY: 0,
      startX: 0
    };

    await startRecording(intent);

    clearTimer();
    timerRef.current = window.setInterval(() => {
      setRecordMs((p) => p + 200);
    }, 200);
  };

  const endRecord = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsLocked(false);
    setCancelArmed(false);
    clearTimer();
    stopRecording('send');
  };

  const cancelRecord = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsLocked(false);
    setCancelArmed(false);
    clearTimer();
    stopRecording('cancel');
  };

  const onSendButtonPress = () => {
    // If currently recording (unlocked), treat send as cancel.
    if (isRecording && !isLocked) {
      cancelRecord();
      return;
    }
    sendMessage();
  };

  const lockCheck = (clientY) => {
    if (!isRecording) return;

    const dy = gestureRef.current.startY - clientY;
    // WhatsApp-like: drag up to lock
    if (!isLocked && dy > 60) {
      setIsLocked(true);
      setCancelArmed(true);
    }
  };

  const attachGestureListeners = (pointerId) => {
    const onMove = (ev) => {
      if (!isRecording) return;
      if (pointerId != null && ev.pointerId != null && ev.pointerId !== pointerId) return;
      lockCheck(ev.clientY);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      // If unlocked: releasing finger stops & sends.
      // If locked: do nothing (user must press trash / stop)
      if (isRecording && !isLocked) {
        endRecord();
      }
    };

    const onTouchMove = (ev) => {
      if (!isRecording) return;
      const t = ev.touches?.[0];
      if (!t) return;
      lockCheck(t.clientY);
    };

    const onTouchEnd = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (isRecording && !isLocked) {
        endRecord();
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleMicPointerDown = async (ev) => {
    // prevent text selection / focus issues
    ev?.preventDefault?.();

    const clientY = ev?.clientY ?? ev?.touches?.[0]?.clientY;
    const clientX = ev?.clientX ?? ev?.touches?.[0]?.clientX;
    gestureRef.current.startY = clientY ?? 0;
    gestureRef.current.startX = clientX ?? 0;

    // start recording
    await beginRecord('send');

    // attach gesture listeners
    if ('pointerId' in ev) {
      attachGestureListeners(ev.pointerId);
    } else {
      // touch fallback
      attachGestureListeners(null);
    }
  };

  const handleMicPointerUp = () => {
    // actual stopping is handled by global listeners on pointerup/touchend.
    // no-op
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'nowrap',
      width: '100%',
      minWidth: 0
    }}>
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

      {/* Attach */}
      <div
        onClick={() => fileInputRef.current?.click()}
        title="Attach file"
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => {
            const next = e.target.value;
            setMessageText(next);

            if (onTyping && selectedChat?._id && next.trim().length > 0) {
              onTyping();
            }
            if (next.trim().length === 0 && onStopTyping && selectedChat?._id) {
              onStopTyping();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSendButtonPress();
              onStopTyping?.();
            }
          }}
          onBlur={() => {
            onStopTyping?.();
          }}
          placeholder="Type a message..."
          disabled={isRecording}
          style={{
            width: '100%',
            padding: '12px 56px 12px 48px',
            borderRadius: '9999px',
            background: isRecording ? '#1f2937' : '#334155',
            border: 'none',
            color: 'white',
            height: '44px',
            boxSizing: 'border-box'
          }}
        />

        {/* Mic button */}
        <div
          onPointerDown={handleMicPointerDown}
          onPointerUp={handleMicPointerUp}
          title="Record voice"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            background: isRecording ? '#111827' : 'transparent',
            border: isRecording ? '1px solid #334155' : 'none'
          }}
        >
          {isLocked ? (
            // show stop icon when locked
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" />
              <path d="M19 10V12C19 15.3137 16.3137 18 13 18H11C7.68629 18 5 15.3137 5 12V10" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}

          {/* When locked, tap mic again to stop & send */}
          {isLocked && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                endRecord();
              }}
              style={{ position: 'absolute', inset: 0 }}
              title="Stop recording"
            />
          )}
        </div>

        {/* Recording overlay (only when locked) */}
        {isRecording && isLocked && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 54,
              width: 'min(420px, 92vw)',
              background: '#0b1220',
              border: '1px solid #1f2937',
              borderRadius: 12,
              padding: 12,
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              zIndex: 10050
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ef4444', boxShadow: '0 0 0 4px rgba(239,68,68,0.15)' }} />
                Recording…
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>{recordTimeLabel}</div>
            </div>

            {/* Fake “wave line” */}
            <div
              style={{
                marginTop: 10,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(90deg, rgba(16,185,129,0.18), rgba(16,185,129,0.08))',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = 6 + (((i * 13 + recordMs / 200) % 17) / 17) * 22;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 4,
                        height: h,
                        borderRadius: 3,
                        background: '#10b981',
                        opacity: 0.85
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Trash icon to cancel */}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                onClick={cancelRecord}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid #ef4444',
                  background: '#111827',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                title="Cancel recording"
              >
                <span style={{ fontSize: 16 }}>🗑️</span>
                Cancel
              </button>
              <button
onClick={endRecord}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid #10b981',
                  background: '#10b981',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 900
                }}
                title="Send recording"
              >
                Stop
              </button>
            </div>

            {cancelArmed && (
              <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12 }}>
                Drag up to lock (now locked). Press trash to cancel.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        onClick={onSendButtonPress}
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
        disabled={isRecording && !isLocked}
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

