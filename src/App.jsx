import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import ProfileModal from './components/ProfileModal';

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', avatar: '' });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const socketRef = useRef(null);
  const chatsRef = useRef([]);
  const selectedChatRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return {
        url: res.data.url,
        type: res.data.type || (file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'voice' : 'file')
      };
    } catch (err) {
      console.log('UPLOAD ERROR:', err.response?.data || err.message || err);
      alert('Upload failed');
      return null;
    }
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



  const markChatMessagesRead = (chatId) => {
    if (!socketRef.current || !chatId) return;
    socketRef.current.emit('markAsRead', { chatId });

    setChatMessages((prev) => {
      const updated = { ...prev };
      const existing = updated[chatId] || [];
      updated[chatId] = existing.map((msg) => {
        const isFromChatPartner = (msg.sender?.toString?.() || msg.sender) === (chatId?.toString?.() || chatId);
        return isFromChatPartner ? { ...msg, status: 'read', read: true } : msg;
      });
      return updated;
    });

    setChats((prev) =>
      prev.map((chat) =>
        (chat._id?.toString?.() || chat._id) === (chatId?.toString?.() || chatId)
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  };

  const loginSuccess = (userData, newToken) => {
    const fixedUser = {
      ...userData,
      _id: userData.id
    };

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

  const openProfile = () => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    });
    setProfileModalOpen(true);
  };

  const closeProfile = () => setProfileModalOpen(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalForm = { ...profileForm };

      // If avatar is a local data URL, upload it first
      if (profileForm.avatar && profileForm.avatar.startsWith('data:')) {
        const blob = await (await fetch(profileForm.avatar)).blob();
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        const result = await uploadFile(file);
        if (result?.url) {
          finalForm.avatar = result.url;
        } else {
          alert('Avatar upload failed');
          setLoading(false);
          return;
        }
      }

      const res = await axios.put(`${API_URL}/api/auth/me`, finalForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser({
        ...user,
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        avatar: res.data.avatar
      });
      setProfileModalOpen(false);
      alert('Profile saved');
    } catch (err) {
      alert(err.response?.data?.msg || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';

      const payload = { password };
      if (!isLogin) payload.name = name;
      if (email.includes('@')) payload.email = email;
      else payload.phone = email;

      const res = await axios.post(`${API_URL}/api/auth${endpoint}`, payload);
      loginSuccess(res.data.user, res.data.token);
    } catch (err) {
      alert(err.response?.data?.msg || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (res) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, { token: res.credential });
      loginSuccess(response.data.user, response.data.token);
    } catch (err) {
      console.error(err);
      alert('Google login failed');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!token || !user?._id) return;

    const socket = io(API_URL, {
      auth: { token },
      // prefer long-polling first so environments that block websockets still work
      transports: ['polling', 'websocket'],
      reconnection: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
      socket.emit('join', user._id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect_error', err);
    });

    socket.on('error', (err) => {
      console.error('Socket error', err);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Socket disconnected', reason);
    });

    socket.on('receiveMessage', (message) => {
      const senderId = message.sender;
      const receiverId = message.receiver;
      const chatId = senderId === user._id ? receiverId : senderId;
      chatsRef.current.find(
        (chat) => (chat._id?.toString?.() || chat._id) === (senderId?.toString?.() || senderId)
      );


      const enrichedMessage = {
        ...message,
        createdAt: message.createdAt || new Date().toISOString(),
        status: message.status || 'sent',
        read: message.read || false
      };

      setChatMessages((prev) => {
        const existing = prev[chatId] || [];
        const exists = existing.some((m) => m._id === message._id);
        if (exists) return prev;

        return {
          ...prev,
          [chatId]: [...existing, enrichedMessage]
        };
      });

      setChats((prev) =>
        prev.map((chat) => {
          if ((chat._id?.toString?.() || chat._id) !== (chatId?.toString?.() || chatId)) return chat;
          const unreadCount =
            (chat.unreadCount || 0) +
            ((selectedChatRef.current?._id?.toString?.() || selectedChatRef.current?._id) === (chatId?.toString?.() || chatId) ? 0 : 1);
          return {
            ...chat,
            lastMessage: enrichedMessage.text || `[${enrichedMessage.mediaType}]`,
            unreadCount
          };
        })
      );

      if ((selectedChatRef.current?._id?.toString?.() || selectedChatRef.current?._id) === (chatId?.toString?.() || chatId)) {
        markChatMessagesRead(chatId);
      }

      setSelectedChat((prev) =>
        prev && ((prev._id?.toString?.() || prev._id) === (chatId?.toString?.() || chatId))
          ? { ...prev, lastMessage: enrichedMessage.text || `[${enrichedMessage.mediaType}]` }
          : prev
      );


    });

    socket.on('messageStatusUpdate', ({ messageId, messageIds, status }) => {
      setChatMessages((prev) => {
        const updated = {};
        Object.keys(prev).forEach((chatId) => {
          updated[chatId] = prev[chatId].map((msg) => {
            const matches = messageId ? msg._id === messageId : messageIds?.includes?.(msg._id);
            return matches ? { ...msg, status } : msg;
          });
        });
        return updated;
      });
    });

    socket.on('userStatusChanged', ({ userId, isOnline, lastSeen }) => {
      setChats((prev) =>
        prev.map((chat) => {
          const isCurrent =
            (chat._id?.toString?.() || chat._id) === (userId?.toString?.() || userId);
          if (!isCurrent) return chat;

          return { ...chat, isOnline, lastSeen };
        })
      );

      setSelectedChat((prev) =>
        prev && ((prev._id?.toString?.() || prev._id) === (userId?.toString?.() || userId))
          ? { ...prev, isOnline, lastSeen }
          : prev
      );
    });

    return () => socket.disconnect();
  }, [token, user?._id]);

  useEffect(() => {
    if (!token) return;

    axios.get(`${API_URL}/api/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => setChats(res.data))
    .catch((err) => {
      if (err.response?.status === 401) logout();
    });
  }, [token]);

  // Fetch missing chat.lastMessage once after initial chat load.
  // Previously this effect ran whenever `chats` changed, which caused flickering
  // (chat.lastMessage being overwritten back and forth while socket updates).
  useEffect(() => {
    if (!token || chats.length === 0) return;

    const chatsMissingLastMessage = chats.filter((chat) => !chat.lastMessage);
    if (chatsMissingLastMessage.length === 0) return;

    let cancelled = false;

    const fetchLastMessages = async () => {
      const updatedChats = await Promise.all(
        chats.map(async (chat) => {
          if (chat.lastMessage) return chat;

          try {
            const res = await axios.get(`${API_URL}/api/messages/${chat._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            const messages = res.data;
            const lastMsg = Array.isArray(messages) && messages.length ? messages[messages.length - 1] : null;

            return lastMsg
              ? { ...chat, lastMessage: lastMsg.text || `[${lastMsg.mediaType}]` }
              : chat;
          } catch {
            return chat;
          }
        })
      );

      if (!cancelled) setChats(updatedChats);
    };

    fetchLastMessages();

    return () => {
      cancelled = true;
    };
    // Depend only on `token` and initial list load changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, token ? chats.length : 0]);

  useEffect(() => {
    if (!selectedChat?._id || !token) return;

    axios.get(`${API_URL}/api/messages/${selectedChat._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      // Enrich messages with default fields
      const enrichedMessages = res.data.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt || new Date().toISOString(),
        status: msg.status || 'sent'
      }));

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat._id]: enrichedMessages
      }));

      // Update chat's last message
      if (enrichedMessages.length > 0) {
        const lastMsg = enrichedMessages[enrichedMessages.length - 1];
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, lastMessage: lastMsg.text || `[${lastMsg.mediaType}]` }
              : chat
          )
        );
      }
    })
    .catch(console.error);
  }, [selectedChat, token]);

  useEffect(() => {
    if (token && !user) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
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
  }, [token, user]);

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

        const result = await uploadFile(file);
        if (!result?.url) return;

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
          mediaUrl: result.url,
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

  const sendMessage = () => {
    if (!socketRef.current || !messageText.trim() || !selectedChat || !user) return;

    socketRef.current.emit('sendMessage', {
      receiver: selectedChat._id,
      text: messageText.trim(),
      sender: user._id
    });

    setMessageText('');
  };

  const currentMessages = selectedChat ? chatMessages[selectedChat._id] || [] : [];

  if (!token) {

    return (
      <AuthForm
        apiUrl={API_URL}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleAuth={handleAuth}
        loading={loading}
        onGoogleLoginSuccess={handleGoogleLoginSuccess}
      />
    );
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#0f172a', color: 'white', overflow: 'hidden' }}>
      <ChatSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        isMobile={isMobile}
        onLogout={logout}
        onLogoClick={() => setSelectedChat(null)}
        onProfileClick={openProfile}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedChat ? (
          <ChatWindow
            selectedChat={selectedChat}
            currentMessages={currentMessages}
            user={user}
            isMobile={isMobile}
            onBack={() => setSelectedChat(null)}
            messageText={messageText}
            setMessageText={setMessageText}
            sendMessage={sendMessage}
            sendMediaMessage={sendMediaMessage}
            startRecording={startRecording}
            stopRecording={stopRecording}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a user to start chatting
          </div>
        )}
      </div>
      <ProfileModal
        open={profileModalOpen}
        user={user}
        form={profileForm}
        setForm={setProfileForm}
        onClose={closeProfile}
        onSave={handleProfileSave}
        loading={loading}
      />


    </div>
  );
}

export default App;
