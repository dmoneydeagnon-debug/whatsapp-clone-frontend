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

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loginSuccess = (userData, newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
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

      const payload = {
        name: !isLogin ? name : undefined,
        email: email.includes('@') ? email : undefined,
        phone: !email.includes('@') ? email : undefined,
        password,
      };

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
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('receiveMessage', (message) => {
      const chatId =
        message.sender === user._id ? message.receiver : message.sender;

      setChatMessages(prev => {
        const existing = prev[chatId] || [];

        if (existing.some(m => m._id === message._id)) return prev;

        return {
          ...prev,
          [chatId]: [...existing, message]
        };
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user?._id]); // ✅ safer dependency

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

  // ================= SEND MESSAGE =================
  const sendMessage = () => {
    if (!socketRef.current || !messageText.trim() || !selectedChat || !user) return;

    const messageData = {
      sender: user._id,
      receiver: selectedChat._id,
      text: messageText.trim(),
    };

    const tempMessage = {
      ...messageData,
      _id: Date.now().toString()
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat._id]: [
        ...(prev[selectedChat._id] || []),
        tempMessage
      ]
    }));

    socketRef.current.emit('sendMessage', messageData);
    setMessageText('');
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
                setUser(response.data.user);
                if (socket) socket.emit("join", response.data.user._id);
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
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '24px' }}>Messages</h1>
          <button onClick={logout} style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: '6px' }}>Logout</button>
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
                <div style={{ width: '50px', height: '50px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  {chat.name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{chat.name}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>{chat.email}</div>
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
              <h2>{selectedChat.name}</h2>
            </div>

            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: '#0f172a' }}>
              {currentMessages.length === 0 && (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No messages yet. Say hello!
                </div>
              )}
              {currentMessages.map(msg => (
                <div key={msg._id} style={{ marginBottom: '15px', textAlign: msg.sender === user._id ? 'right' : 'left' }}>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '12px 18px', 
                    borderRadius: '18px', 
                    background: msg.sender === user._id ? '#10b981' : '#334155', 
                    maxWidth: '70%' 
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', background: '#1e2937' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: '16px', borderRadius: '9999px', background: '#334155', border: 'none', color: 'white' }}
                />
                <button onClick={sendMessage} style={{ padding: '0 30px', background: '#10b981', border: 'none', borderRadius: '9999px' }}>
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