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
  const [showMenu, setShowMenu] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ================= UPLOAD =================
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data.url;
    } catch (err) {
      console.log("Upload error", err);
      return null;
    }
  };

  // ================= AUTH =================
  const loginSuccess = (userData, newToken) => {
    const fixedUser = { ...userData, _id: userData.id };

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
    socketRef.current?.disconnect();
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? '/login' : '/register';

      const payload = {
        name: !isLogin ? name : undefined,
        email,
        password
      };

      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);
      loginSuccess(res.data.user, res.data.token);
    } catch (err) {
      alert(err.response?.data?.msg || "Auth failed");
    }
  };

  // ================= SOCKET =================
  useEffect(() => {
    if (!token || !user?._id) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('receiveMessage', (msg) => {
      const chatId =
        msg.sender === user._id ? msg.receiver : msg.sender;

      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), msg]
      }));
    });

    return () => socket.disconnect();
  }, [token, user]);

  // ================= FETCH USERS =================
  useEffect(() => {
    if (!token) return;

    axios.get(`${API_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setChats(res.data))
    .catch(() => logout());
  }, [token]);

  // ================= FETCH MESSAGES =================
  useEffect(() => {
    if (!selectedChat || !token) return;

    axios.get(`${API_URL}/api/messages/${selectedChat._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat._id]: res.data
      }));
    });
  }, [selectedChat]);

  // ================= SCROLL =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedChat]);

  // ================= SEND MESSAGE =================
  const sendMessage = () => {
    if (!messageText.trim()) return;

    socketRef.current.emit('sendMessage', {
      receiver: selectedChat._id,
      sender: user._id,
      text: messageText
    });

    setMessageText('');
  };

  const currentMessages = chatMessages[selectedChat?._id] || [];

  // ================= LOGIN UI =================
  if (!token) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f172a' }}>
        <form onSubmit={handleAuth} style={{ padding:30, background:'#1e293b', borderRadius:10, width:300 }}>
          {!isLogin && (
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          )}

          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />

          <button type="submit" style={{ width:'100%', marginTop:10 }}>
            {isLogin ? "Login" : "Register"}
          </button>

          <p onClick={() => setIsLogin(!isLogin)} style={{ color:'white', cursor:'pointer' }}>
            Switch
          </p>

          <GoogleLogin
            onSuccess={async (res) => {
              const response = await axios.post(`${API_URL}/api/auth/google`, {
                token: res.credential
              });

              loginSuccess(response.data.user, response.data.token);
            }}
          />
        </form>
      </div>
    );
  }

  // ================= CHAT UI =================
  return (
    <div style={{ display:'flex', height:'100vh', background:'#0f172a', color:'white' }}>

      {/* USERS */}
      <div style={{ width:300, background:'#1e293b', overflowY:'auto' }}>
        {chats.map(c => (
          <div
            key={c._id}
            onClick={() => setSelectedChat(c)}
            style={{
              padding:15,
              cursor:'pointer',
              background: selectedChat?._id === c._id ? '#334155' : 'transparent'
            }}
          >
            {c.name}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>

        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          {currentMessages.map(m => {
            const mine = m.sender === user._id;

            return (
              <div key={m._id} style={{ textAlign: mine ? 'right' : 'left' }}>
                <div style={{
                  display:'inline-block',
                  padding:10,
                  margin:5,
                  borderRadius:10,
                  background: mine ? '#10b981' : '#334155'
                }}>
                  {m.text}

                  {m.mediaUrl && (
                    <div>
                      {m.mediaType === 'image' && <img src={m.mediaUrl} width="150" />}
                      {m.mediaType === 'voice' && <audio controls src={m.mediaUrl} />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{ display:'flex', padding:10 }}>
          <input
            value={messageText}
            onChange={e=>setMessageText(e.target.value)}
            style={{ flex:1 }}
          />

          <input
            type="file"
            onChange={async (e) => {
              const file = e.target.files[0];
              const url = await uploadFile(file);

              socketRef.current.emit('sendMessage', {
                receiver: selectedChat._id,
                sender: user._id,
                text: '',
                mediaUrl: url,
                mediaType: 'image'
              });
            }}
          />

          <button onClick={sendMessage}>Send</button>
        </div>

      </div>
    </div>
  );
}

export default App;