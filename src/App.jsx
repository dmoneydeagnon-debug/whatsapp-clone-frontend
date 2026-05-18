import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const API_URL = "https://whatsapp-clone-backend-4cpt.onrender.com";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chatMessages, setChatMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const endpoints = [`${API_URL}/api/upload`, `${API_URL}/api/upload/image`];

    for (const endpoint of endpoints) {
      try {
        const res = await axios.post(endpoint, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        return {
          url: res.data.url,
          type: res.data.type || (file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'voice' : 'file')
        };
      } catch (err) {
        if (err.response?.status === 404) continue;
        console.log('UPLOAD ERROR:', err.response?.data || err.message || err);
        alert('Upload failed');
        return null;
      }
    }

    console.log('UPLOAD ERROR: no upload endpoint available');
    alert('Upload failed');
    return null;
  };

  const sendMediaMessage = async (file) => {
    if (!file || !selectedChat?._id || !socketRef.current) return;

    const result = await uploadFile(file);
    if (!result?.url) return;

    socketRef.current.emit('sendMessage', {
      receiver: selectedChat._id,
      text: '',
      mediaUrl: result.url,
      mediaType: result.type
    });
  };

  const loginSuccess = (userData, newToken) => {
    const fixedUser = {
      ...userData,
      _id: userData.id
    };

    console.log("LOGIN USER:", fixedUser);
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(fixedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setChats([]);
    setSelectedChat(null);
    setChatMessages({});

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // ================= AUTH =================
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';

      const payload = { password };
      if (!isLogin) payload.name = name;
      if (email.includes('@')) payload.email = email;
      else payload.phone = email;

      // ✅ FIXED API URL BUG
      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);

      loginSuccess(res.data.user, res.data.token);
    } catch (err) {
      alert(err.response?.data?.msg || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================= SOCKET =================
  useEffect(() => {
  if (!token || !user?._id) return;

  const socket = io(API_URL, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true
  });

  socketRef.current = socket;

  socket.on('connect', () => {
    socket.emit('join', user._id);
  });

  socket.on('receiveMessage', (message) => {
    const senderId = message.sender;
    const receiverId = message.receiver;

    const chatId =
      senderId === user._id ? receiverId : senderId;

    setChatMessages(prev => {
      const existing = prev[chatId] || [];

      const exists = existing.some(m => m._id === message._id);
      if (exists) return prev;

      return {
        ...prev,
        [chatId]: [...existing, message]
      };
    });
  });

  socket.on('userStatusChanged', ({ userId, isOnline, lastSeen }) => {
    setChats(prev =>
      prev.map(chat =>
        chat._id === userId
          ? { ...chat, isOnline, lastSeen }
          : chat
      )
    );

    setSelectedChat(prev =>
      prev && prev._id === userId
        ? { ...prev, isOnline, lastSeen }
        : prev
    );
  });

  return () => socket.disconnect();
}, [token, user?._id]);

  // ================= FETCH CHATS =================
  useEffect(() => {
    if (!token) return;

    axios.get(`${API_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setChats(res.data))
    .catch(err => {
      if (err.response?.status === 401) logout();
    });
  }, [token]);

  // ================= FETCH MESSAGES =================
  useEffect(() => {
    if (!selectedChat?._id || !token) return;

    // ✅ FIXED URL BUG HERE TOO
    axios.get(`${API_URL}/api/messages/${selectedChat._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setChatMessages(prev => ({
        ...prev,
        [selectedChat._id]: res.data
      }));
    })
    .catch(console.error);
  }, [selectedChat, token]);

  useEffect(() => {
    if (token && !user) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {

  if (!res.data) {
    logout();
    return;
  }

  setUser({
    ...res.data,
    _id: res.data.id
  });
})
      .catch(() => logout());
    }
  }, [token]);

  const mediaRecorderRef = useRef(null);
const audioChunks = useRef([]);

const startRecording = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Audio recording is not supported in this browser');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunks.current = [];

    recorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const file = new File([blob], 'voice.webm', { type: 'audio/webm' });

      const url = await uploadFile(file);
      if (!url) return;

      if (!selectedChat?._id) {
        alert('Please select a chat before sending a voice message');
        return;
      }

      if (!socketRef.current) {
        console.error('Socket not connected');
        return;
      }

      socketRef.current.emit('sendMessage', {
        receiver: selectedChat._id,
        text: '',
        mediaUrl: url,
        mediaType: 'voice'
      });
    };

    recorder.start();
  } catch (err) {
    console.error('Failed to start audio recording', err);
    alert('Could not access microphone');
  }
};

const stopRecording = () => {
  mediaRecorderRef.current?.stop();
};

  // ================= SEND MESSAGE =================
  // ================= AUTO SCROLL =================
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: 'smooth'
  });
}, [chatMessages, selectedChat]);

// ================= SEND MESSAGE =================
const sendMessage = () => {
  if (!socketRef.current || !messageText.trim() || !selectedChat || !user) return;

  const messageData = {
    receiver: selectedChat._id,
    text: messageText.trim(),
    sender: user._id
  };

  socketRef.current.emit('sendMessage', messageData);

  setMessageText('');
};

const menuItem = {
  padding: '14px 18px',
  cursor: 'pointer',
  borderBottom: '1px solid #475569'
};

  const currentMessages = selectedChat
  ? chatMessages[selectedChat._id] || []
  : [];


  if (!token) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#1e2937', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ textAlign: 'center', fontSize: '36px', color: 'white' }}>FunChat</h1>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Simple & Clean</p>

          <form onSubmit={handleAuth}>
            {!isLogin && <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '8px', background: '#334155', color: 'white' }} required />}
            <input type="text" placeholder="Email or Phone Number" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '8px', background: '#334155', color: 'white' }} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '8px', background: '#334155', color: 'white' }} required />

            <button type="submit" style={{ width: '100%', padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '17px' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#10b981', cursor: 'pointer' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>

          <GoogleLogin
            onSuccess={async (res) => {
              try {
                const response = await axios.post(`${API_URL}/api/auth/google`, { token: res.credential });
                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);
                setUser({
                  ...response.data.user,
                  _id: response.data.user.id
                });
                if (socketRef.current) {
                  socketRef.current.emit("join", response.data.user.id);;
                }
              } catch (err) {
                console.error(err);
                alert("Google login failed");
              }
            }}
            onError={() => console.log("Google Login Failed")}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#0f172a', color: 'white', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ 
        width: (isMobile && selectedChat) ? '0px' : '380px', 
        borderRight: (isMobile && selectedChat) ? 'none' : '1px solid #334155', 
        background: '#1e2937',
        display: (isMobile && selectedChat) ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div
  style={{
    padding: '20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}
>
  <h1 style={{ fontSize: '24px' }}>
    Messages
  </h1>

  <div style={{ position: 'relative' }}>

    <button
      onClick={() => setShowMenu(!showMenu)}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '28px',
        cursor: 'pointer'
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

        <div
          style={menuItem}
          onClick={() => alert('Profile')}
        >
          Profile
        </div>

        <div
          style={menuItem}
          onClick={() => alert('Settings')}
        >
          Settings
        </div>

        <div
          style={{
            ...menuItem,
            color: '#ef4444'
          }}
          onClick={logout}
        >
          Logout
        </div>

      </div>
    )}
  </div>
</div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {chats.map(chat => (
            <div 
              key={chat._id} 
              onClick={() => {
                setSelectedChat(chat);
                if (isMobile) window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
    <img
      src={chat.avatar}
      alt={chat.name}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  ) : (
    <span style={{ fontSize: '22px' }}>
      {chat.name?.[0]}
    </span>
  )}
</div>
                <div>
  <div style={{ fontWeight: '500' }}>
    {chat.name}
  </div>

  <div
    style={{
      fontSize: '13px',
      color: chat.isOnline
        ? '#10b981'
        : '#94a3b8'
    }}
  >
    {chat.isOnline
      ? 'Online'
      : `Last seen ${new Date(chat.lastSeen).toLocaleTimeString()}`
    }
  </div>
</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedChat ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid #334155', background: '#1e2937', display: 'flex', alignItems: 'center' }}>
              {isMobile && <button onClick={() => setSelectedChat(null)} style={{ marginRight: '15px', fontSize: '28px' }}>←</button>}
              <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}}>

  <div
    style={{
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      overflow: 'hidden',
      background: '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {selectedChat.avatar ? (
      <img
        src={selectedChat.avatar}
        alt={selectedChat.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    ) : (
      <span>
        {selectedChat.name?.[0]}
      </span>
    )}
  </div>

  <div>
    <h2 style={{ margin: 0 }}>
      {selectedChat.name}
    </h2>

    <div
      style={{
        fontSize: '13px',
        color: selectedChat.isOnline
          ? '#10b981'
          : '#94a3b8'
      }}
    >
      {selectedChat.isOnline
        ? 'Online'
        : 'Offline'}
    </div>
  </div>

</div>
            </div>

            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#0f172a' }}>
              {currentMessages.length === 0 && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No messages yet. Say hello!
                </div>
              )}
              {currentMessages.map(msg => (
                <div key={msg._id} style={{ marginBottom: '15px', textAlign: msg.sender?.toString() === user._id?.toString()
  ? 'right'
  : 'left' }}>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '12px 18px', 
                    borderRadius: '18px', 
                    background:
  msg.sender?.toString() === user._id?.toString()
    ? '#10b981'
    : '#334155', 
                    maxWidth: '70%' 
                  }}>
                    {msg.mediaType === 'image' && (
  <img
    src={msg.mediaUrl}
    style={{ maxWidth: '200px', borderRadius: '10px' }}
  />
)}

{msg.mediaType === 'voice' && (
  <audio controls src={msg.mediaUrl} />
)}

{msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', background: '#1e2937' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '12px 18px',
                  borderRadius: '9999px',
                  border: '1px solid #475569',
                  background: '#1f2937',
                  color: 'white',
                  cursor: 'pointer',
                  minWidth: '140px'
                }}
              >
                📎 Add image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  sendMediaMessage(file);
                  e.target.value = null;
                }}
              />

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '9999px',
                  background: '#334155',
                  border: 'none',
                  color: 'white'
                }}
              />

              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                style={{
                  padding: '12px 18px',
                  borderRadius: '9999px',
                  border: '1px solid #475569',
                  background: '#1f2937',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                🎤 Hold
              </button>

              <button
                onClick={sendMessage}
                style={{
                  padding: '12px 24px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '9999px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default App;