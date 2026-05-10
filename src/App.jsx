import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const API_URL = "https://whatsapp-clone-backend-4cpt.onrender.com";

function App() {
  const [socket, setSocket] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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
  const messagesEndRef = useRef(null);

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // ✅ Send Message
  const sendMessage = () => {
    if (!socket || !messageText.trim() || !selectedChat || !user?._id) return;

    const messageData = {
      sender: user._id,
      receiver: selectedChat._id,
      text: messageText.trim(),
    };

    socket.emit('sendMessage', messageData);

    setChatMessages(prev => ({
      ...prev,
      [selectedChat._id]: [
        ...(prev[selectedChat._id] || []),
        { ...messageData, _id: Date.now() }
      ]
    }));

    setMessageText('');
  };

  // ✅ Init Socket
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // ✅ Screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  // ✅ Auth
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, {
        name,
        email: email.includes('@') ? email : null,
        phone: !email.includes('@') ? email : null,
        password
      });

      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      if (socket) socket.emit('join', res.data.user._id);
    } catch (err) {
      alert(err.response?.data?.msg || 'Auth failed');
    }
  };

  // ✅ Fetch users
  useEffect(() => {
    if (!token) return;

    axios.get(`${API_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setChats(res.data))
    .catch(err => {
      console.error(err);
      if (err.response?.status === 401) logout();
    });
  }, [token]);

  // ✅ Restore user from token
  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ _id: payload.id });

      if (socket) socket.emit('join', payload.id);
    } catch {
      logout();
    }
  }, [token, socket]);

  // ✅ Fetch messages when chat selected
  useEffect(() => {
    if (!selectedChat || !token) return;

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

  // ✅ Real-time messages
  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleMessage = (message) => {
      const chatId =
        message.sender === user._id
          ? message.receiver
          : message.sender;

      setChatMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), message]
      }));
    };

    socket.on('receiveMessage', handleMessage);
    return () => socket.off('receiveMessage', handleMessage);
  }, [socket, user]);

  const currentMessages = selectedChat ? chatMessages[selectedChat._id] || [] : [];

  // ================= AUTH UI =================
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <form onSubmit={handleAuth} style={{ background: '#1e2937', padding: '30px', borderRadius: '12px' }}>
          <h2 style={{ color: 'white' }}>FunChat</h2>

          {!isLogin && (
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          )}

          <input placeholder="Email or Phone" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>

          <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'lightgreen' }}>
            {isLogin ? 'Create account' : 'Login instead'}
          </p>

          <GoogleLogin
            onSuccess={async (res) => {
              const response = await axios.post(`${API_URL}/api/auth/google`, { token: res.credential });
              localStorage.setItem("token", response.data.token);
              setToken(response.data.token);
              setUser(response.data.user);
            }}
          />
        </form>
      </div>
    );
  }

  // ================= MAIN CHAT UI =================
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      {/* Sidebar */}
      <div style={{ width: 300, background: '#1e2937', color: 'white' }}>
        <button onClick={logout}>Logout</button>

        {chats.map(chat => (
          <div key={chat._id} onClick={() => setSelectedChat(chat)}>
            {chat.name}
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {currentMessages.map(msg => (
            <div key={msg._id} style={{ textAlign: msg.sender === user._id ? 'right' : 'left' }}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex' }}>
          <input
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>

      </div>
    </div>
  );
}

export default App;