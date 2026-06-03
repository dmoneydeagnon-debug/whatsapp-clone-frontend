import { useEffect, useRef, useState } from 'react';

const CompactAudioPlayer = ({ src, isMobile }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = src || '';
    audio.preload = 'metadata';

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setProgress(audio.currentTime || 0);
    const onEnd = () => setPlaying(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  const toggle = () => setPlaying((p) => !p);

  const seek = (e) => {
    const bar = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bar.left;
    const pct = Math.max(0, Math.min(1, x / bar.width));
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = pct * duration;
    setProgress(audio.currentTime);
  };

  const fmt = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: isMobile ? '100%' : 360,
        padding: '10px 12px',
        background: '#0f172a',
        borderRadius: 18,
        border: '1px solid #1f2937'
      }}
    >
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid #334155',
          background: '#111827',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        {!playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={seek}
          style={{
            height: 42,
            borderRadius: 14,
            background: '#0b1220',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 3,
            padding: '8px',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          {Array.from({ length: 24 }).map((_, index) => {
            const height = 12 + Math.round(Math.abs(Math.sin((index + 1) * 0.55 + (progress / Math.max(duration, 1)) * 6)) * 20);
            const played = duration ? (progress / duration) > index / 24 : false;
            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  maxWidth: 6,
                  height,
                  borderRadius: 999,
                  background: played ? '#10b981' : '#334155',
                  opacity: 0.9
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default CompactAudioPlayer;
