import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

export default function GroupCreateModal({
  open,
  onClose,
  token,
  onCreated
}) {
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedLabel = useMemo(() => {
    if (!selectedUserIds.length) return 'No recipients selected';
    return `${selectedUserIds.length} selected`;
  }, [selectedUserIds.length]);

  useEffect(() => {
    if (!open) return;
    // reset
    queueMicrotask(() => {
      setGroupName('');
    });
    queueMicrotask(() => {
      setQuery('');
      setResults([]);
      setSelectedUserIds([]);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!token) return;

    const q = query.trim();

    let cancelled = false;
    queueMicrotask(() => setLoading(true));


    const run = async () => {
      try {
        const res = q
          ? await axios.get(`${API_URL}/api/auth/users/search`, {
              params: { q },
              headers: { Authorization: `Bearer ${token}` }
            })
          : await axios.get(`${API_URL}/api/auth/users`, {
              headers: { Authorization: `Bearer ${token}` }
            });

        if (cancelled) return;

        const users = Array.isArray(res.data) ? res.data : [];
        // backend forward modal excluded currently logged-in user using excludeUserId.
        // here we just show everything; user can still create with backend validation.
        setResults(users);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const t = window.setTimeout(run, q ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, query, token]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggleUser = (u) => {
    const id = u?._id || u?.id;
    if (!id) return;
    setSelectedUserIds((prev) => {
      const exists = prev.some((x) => x.toString() === id.toString());
      if (exists) return prev.filter((x) => x.toString() !== id.toString());
      return [...prev, id];
    });
  };

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
          top: isMobile ? 0 : 60,
          width: isMobile ? '100%' : 560,
          height: isMobile ? '100%' : 'auto',
          borderRadius: isMobile ? 0 : 14,
          background: '#0b1220',
          border: '1px solid #1f2937',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          padding: 14,
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 900 }}>Create group</div>
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

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800 }}>Group name</label>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Friends"
            style={{
              width: '100%',
              height: 44,
              borderRadius: 12,
              border: '1px solid #334155',
              background: '#111827',
              color: 'white',
              padding: '0 12px',
              outline: 'none',
              fontWeight: 700
            }}
          />

          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 800 }}>Select users</div>

          <div style={{ marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
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

          <div style={{ color: '#94a3b8', fontSize: 12 }}>{selectedLabel}</div>

          <div style={{ marginTop: 4, maxHeight: isMobile ? '50vh' : 320, overflowY: 'auto', borderRadius: 12, border: '1px solid #334155' }}>
            {loading ? (
              <div style={{ padding: 12, color: '#94a3b8' }}>Loading...</div>
            ) : results.length === 0 ? (
              <div style={{ padding: 12, color: '#94a3b8' }}>No users found</div>
            ) : (
              results.map((u) => {
                const id = u?._id || u?.id;
                const isSelected = selectedUserIds.some((x) => x.toString() === id?.toString());
                return (
                  <div
                    key={id}
                    onClick={() => toggleUser(u)}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(16,185,129,0.12)' : 'transparent',
                      borderBottom: '1px solid rgba(51,65,85,0.5)'
                    }}
                    title={u?.name}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#334155',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        flexShrink: 0
                      }}
                    >
                      {(u?.name || 'U')?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u?.name || 'Unknown'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u?.phone || u?.email || ''}
                      </div>
                    </div>
                    <div style={{ color: isSelected ? '#10b981' : '#64748b', fontWeight: 900 }}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                );
              })
            )}
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
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const name = groupName.trim();
                if (!name) {
                  alert('Enter group name');
                  return;
                }
                if (!selectedUserIds.length) {
                  alert('Select at least 1 user');
                  return;
                }

                try {
                  const res = await axios.post(
                    `${API_URL}/api/groups`,
                    { groupName: name, memberIds: selectedUserIds },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  onCreated?.(res.data?.group);
                  onClose?.();
                } catch (e) {
                  alert(e?.response?.data?.msg || e?.message || 'Create group failed');
                }
              }}
              disabled={!groupName.trim() || selectedUserIds.length === 0}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 12,
                border: selectedUserIds.length ? '1px solid #10b981' : '1px solid #334155',
                background: selectedUserIds.length ? '#10b981' : '#0f172a',
                color: 'white',
                cursor: selectedUserIds.length ? 'pointer' : 'not-allowed',
                fontWeight: 900
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

