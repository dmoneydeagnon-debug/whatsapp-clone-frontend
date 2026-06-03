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
  const lockThreshold = 60;
  const cancelThreshold = 100;

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
    if (!selectedChat?._id || isRecording) return;

    setCancelArmed(false);
    setIsLocked(false);
    setRecordMs(0);

    gestureRef.current = {
      startY: 0,
      startX: 0
    };

    const started = await startRecording(intent);
    if (!started) return;

    setIsRecording(true);
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
    if (isRecording && !isLocked) {
      cancelRecord();
      return;
    }
    sendMessage();
  };

  const updateGestureState = (clientX, clientY) => {
    if (!isRecording) return;

    const dy = gestureRef.current.startY - clientY;
    const dx = clientX - gestureRef.current.startX;

    if (!isLocked && dy > lockThreshold) {
      setIsLocked(true);
      setCancelArmed(false);
      return;
    }

    if (!isLocked) {
      setCancelArmed(dx < -cancelThreshold);
    }
  };

  const attachGestureListeners = (pointerId) => {
    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onCancel);
    };

    const finish = () => {
      cleanup();
      if (!isRecording || isLocked) return;
      if (cancelArmed) cancelRecord();
      else endRecord();
    };

    const onMove = (ev) => {
      if (!isRecording) return;
      if (pointerId != null && ev.pointerId != null && ev.pointerId !== pointerId) return;
      updateGestureState(ev.clientX, ev.clientY);
    };

    const onUp = () => {
      finish();
    };

    const onCancel = () => {
      cleanup();
      if (isRecording && !isLocked) cancelRecord();
    };

    const onTouchMove = (ev) => {
      if (!isRecording) return;
      const t = ev.touches?.[0];
      if (!t) return;
      updateGestureState(t.clientX, t.clientY);
    };

    const onTouchEnd = () => {
      finish();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onCancel);
  };

  const handleMicPointerDown = async (ev) => {
    ev?.preventDefault?.();

    const clientY = ev?.clientY ?? ev?.touches?.[0]?.clientY;
    const clientX = ev?.clientX ?? ev?.touches?.[0]?.clientX;
    gestureRef.current.startY = clientY ?? 0;
    gestureRef.current.startX = clientX ?? 0;

    const started = await beginRecord('send');
    if (!started) return;

    if ('pointerId' in ev) {
      ev?.target?.setPointerCapture?.(ev.pointerId);
      attachGestureListeners(ev.pointerId);
    } else {
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
            touchAction: 'none',
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

        {/* Recording overlay */}
        {isRecording && (
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
                {isLocked ? 'Recording…' : cancelArmed ? 'Release to cancel' : 'Recording…'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12 }}>{recordTimeLabel}</div>
            </div>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <div style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.4 }}>
                  {isLocked
                    ? 'Tap stop to send, or tap trash to cancel.'
                    : cancelArmed
                      ? 'Release to cancel voice message.'
                      : 'Slide up to lock, swipe left to cancel.'}
                </div>
                <div style={{ color: cancelArmed ? '#f87171' : '#94a3b8', fontSize: 12, fontWeight: 700 }}>
                  {isLocked ? 'Locked' : cancelArmed ? 'Cancel' : 'Hold'}
                </div>
              </div>

              <div
                style={{
                  height: 44,
                  borderRadius: 16,
                  background: cancelArmed ? 'rgba(239,68,68,0.12)' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', width: '100%' }}>
                  {Array.from({ length: 26 }).map((_, i) => {
                    const waveHeight = 10 + Math.round((Math.sin((i * 0.55) + recordMs / 400) * 12) + 12);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          maxWidth: 6,
                          height: waveHeight,
                          borderRadius: 999,
                          background: cancelArmed ? '#ef4444' : '#10b981',
                          opacity: i % 2 === 0 ? 0.9 : 0.45
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {isLocked && (
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
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
              )}
            </div>
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

