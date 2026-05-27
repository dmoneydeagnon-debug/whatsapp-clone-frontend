import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Simple forward UI used from MessageBubble. Supports selecting up to 5 contacts.
// Desktop: bottom-sheet style modal. Mobile: nearly full screen.
const API_URL = 'https://whatsapp-clone-backend-4cpt.onrender.com';

export default function ForwardModal({
  open,
  onClose,
  token,
  onForward,
  excludeUserId
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setSelected([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();

    if (!q) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const t = window.setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/users/search`, {
          params: { q },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cancelled) return;
        const filtered = Array.isArray(res.data)
          ? res.data.filter((u) => (excludeUserId ? u._id?.toString?.() !== excludeUserId?.toString?.() : true))
          : [];
        setResults(filtered);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, query, token, excludeUserId]);

  const canSelect = (userId) => {
    if (!userId) return false;
    const exists = selected.some((id) => id?.toString?.() === userId?.toString?.());
    if (exists) return true;
    return selected.length < 5;
  };

  const toggleUser = (user) => {
    const userId = user?._id;
    if (!userId) return;

    const exists = selected.some((id) => id?.toString?.() === userId?.toString?.());
    if (exists) {
      setSelected((prev) => prev.filter((id) => id?.toString?.() !== userId?.toString?.()));
      return;
    }

    if (!canSelect(userId)) return;
    setSelected((prev) => [...prev, userId]);
  };

  const selectedUsersLabel = useMemo(() => {
    if (!selected.length) return 'No recipients selected';
    return `${selected.length}/5 selected`;
  }, [selected]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(0,0,0,0.45)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: isMobile ? 0 : 40,
          width: isMobile ? '100%' : 420,
          borderRadius: isMobile ? '16px 16px 0 0' : 14,
          background: '#0b1220',
          border: '1px solid #1f2937',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          padding: 14
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 800 }}>Forward message</div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: '1px solid #334155',
              background: '#111827',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ marginTop: 10, color: '#94a3b8', fontSize: 12 }}>{selectedUsersLabel}</div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            style={{
              flex: 1,
              height: 40,
              borderRadius: 12,
              border: '1px solid #334155',
              background: '#111827',
              color: 'white',
              padding: '0 12px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => setQuery('')}
            style={{
              width: 44,
              height: 40,
              borderRadius: 12,
              border: '1px solid #334155',
              background: '#111827',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
            title="Clear"
          >
            ↺
          </button>
        </div>

        <div style={{ marginTop: 10, maxHeight: isMobile ? '50vh' : 340, overflowY: 'auto' }}>
          {loading && <div style={{ color: '#94a3b8', fontSize: 13, padding: 10 }}>Loading...</div>}

          {/* If query is empty, show all results already loaded in `results` */}
          {!loading && query.trim() && results.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 13, padding: 10 }}>No results</div>
          )}

          {results.map((u) => {
            const isSelected = selected.some((id) => id?.toString?.() === u?._id?.toString?.());
            return (
              <div
                key={u._id}
                onClick={() => toggleUser(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 10px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #10b981' : '1px solid transparent',
                  background: isSelected ? 'rgba(16,185,129,0.12)' : 'transparent'
                }}
                title={u.name}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  {(u.name || 'U')?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name || 'Unknown'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.phone || u.email || ''}
                  </div>
                </div>
                <div style={{ color: isSelected ? '#10b981' : '#64748b', fontWeight: 900 }}>
                  {isSelected ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            disabled={selected.length === 0}
            onClick={() => onForward?.(selected)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 12,
              border: selected.length ? '1px solid #10b981' : '1px solid #334155',
              background: selected.length ? '#10b981' : '#0f172a',
              color: 'white',
              cursor: selected.length ? 'pointer' : 'not-allowed',
              fontWeight: 900
            }}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}

