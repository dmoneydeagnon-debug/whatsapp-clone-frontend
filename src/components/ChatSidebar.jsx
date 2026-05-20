import { useState } from 'react';
import logo from '../../funchat_logo.png';

const menuItem = {
  padding: '14px 18px',
  cursor: 'pointer',
  borderBottom: '1px solid #475569'
};

const ChatSidebar = ({ chats, selectedChat, onSelectChat, isMobile, onLogout, onProfileClick, onLogoClick }) => {
  const [showMenu, setShowMenu] = useState(false);

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
              <div style={{ ...menuItem, color: '#ef4444' }} onClick={onLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
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
