import { useState } from 'react';
import logo from '../../funchat_logo.png';

const menuItem = {
  padding: '14px 18px',
  cursor: 'pointer',
  borderBottom: '1px solid #475569'
};

const ChatSidebar = ({ chats, selectedChat, onSelectChat, isMobile, onLogout, onProfileClick, onLogoClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const openCreateGroup = () => {
    setShowMenu(false);
    setCreateGroupOpen(true);
  };

  const closeCreateGroup = () => {
    setCreateGroupOpen(false);
    setGroupName('');
    setSelectedUserIds([]);
  };

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) => {
      const idStr = userId?.toString?.() ?? userId;
      const exists = prev.some((x) => (x?.toString?.() ?? x) === idStr);
      if (exists) return prev.filter((x) => (x?.toString?.() ?? x) !== idStr);
      return [...prev, userId];
    });
  };

  const submitCreateGroup = (e) => {
    e.preventDefault();

    const trimmed = groupName.trim();
    if (!trimmed) {
      alert('Please enter a group name');
      return;
    }
    if (!selectedUserIds.length) {
      alert('Please select at least one user');
      return;
    }

    console.log('Create Group:', {
      groupName: trimmed,
      selectedUserIds
    });

    closeCreateGroup();
  };

  return (
    <div
      style={{
        width: isMobile && selectedChat ? '0px' : '380px',
        borderRight: isMobile && selectedChat ? 'none' : '1px solid #334155',
        background: '#1e2937',
        display: isMobile && selectedChat ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          onClick={onLogoClick}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          title="Home"
        >
          <img src={logo} alt="FunChat logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '24px', margin: 0 }}>Messages</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer',
              // increase tappable area and add spacing on mobile
              padding: isMobile ? '8px' : '4px',
              marginRight: isMobile ? '8px' : '0',
              borderRadius: '8px'
            }}
          >
            ⋮
          </button>
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                background: '#334155',
                borderRadius: '10px',
                width: '180px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                zIndex: 1000
              }}
            >
              <div style={menuItem} onClick={onProfileClick}>
                Edit profile
              </div>
              <div style={menuItem} onClick={() => alert('Settings')}>
                Settings
              </div>
              <div style={menuItem} onClick={openCreateGroup}>
                Create Group
              </div>
              <div style={{ ...menuItem, color: '#ef4444' }} onClick={onLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
      {createGroupOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreateGroup();
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              background: '#0f172a',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
              color: 'white',
              maxHeight: '85dvh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px' }}>Create Group</h2>
                <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>Enter a group name and choose users.</p>
              </div>
              <button
                onClick={closeCreateGroup}
                style={{
                  background: 'transparent',
                  border: '1px solid #475569',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitCreateGroup}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <label>
                  <span style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px' }}>Group name</span>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. School Friends"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      background: '#1e2937',
                      border: '1px solid #334155',
                      color: 'white'
                    }}
                    required
                  />
                </label>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#cbd5e1' }}>Select users</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{selectedUserIds.length} selected</span>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {chats.map((chat) => {
                      const idStr = chat._id?.toString?.() ?? chat._id;
                      const checked = selectedUserIds.some((x) => (x?.toString?.() ?? x) === idStr);

                      return (
                        <div
                          key={chat._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '14px',
                            border: checked ? '1px solid #60a5fa' : '1px solid #334155',
                            background: checked ? '#0b2543' : '#0b1220'
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleUser(chat._id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') toggleUser(chat._id);
                          }}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              background: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {chat.avatar ? (
                              <img src={chat.avatar} alt={chat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '18px' }}>{chat.name?.[0]}</span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600 }}>{chat.name}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {chat.lastMessage ? chat.lastMessage : 'No messages yet'}
                            </div>
                          </div>

                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              border: checked ? '2px solid #60a5fa' : '2px solid #475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: checked ? '#93c5fd' : '#94a3b8',
                              fontWeight: 800
                            }}
                            aria-label={checked ? 'Selected' : 'Not selected'}
                          >
                            {checked ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '22px' }}>
                <button
                  type="button"
                  onClick={closeCreateGroup}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '9999px',
                    border: '1px solid #475569',
                    background: '#0f172a',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {chats.map((chat) => (

          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            style={{
              padding: '16px',
              marginBottom: '8px',
              borderRadius: '12px',
              cursor: 'pointer',
              background: selectedChat?._id === chat._id ? '#334155' : '#1e2937'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {chat.avatar ? (
                  <img src={chat.avatar} alt={chat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '22px' }}>{chat.name?.[0]}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ fontWeight: '500' }}>{chat.name}</div>
                  {chat.unreadCount > 0 && (
                    <div
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        minWidth: '24px',
                        textAlign: 'center'
                      }}
                    >
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: chat.unreadCount > 0 ? 700 : 400
                  }}
                >
                  {chat.lastMessage ? chat.lastMessage : 'No messages yet'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;

