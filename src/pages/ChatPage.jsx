import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SearchModal from '../components/SearchModal';
import SettingsModal from '../components/SettingsModal';
import api, { streamChatMessage } from '../services/api';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
      if (res.data.length > 0 && !activeId) {
        setActiveId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  useEffect(() => {
    if (activeId) {
      fetchMessages(activeId);
    } else {
      setMessages([]);
    }
  }, [activeId]);

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await api.post('/conversations', { title: 'New Conversation' });
      setConversations([res.data, ...conversations]);
      setActiveId(res.data.id);
    } catch (err) {
      console.error('Failed to create new conversation', err);
    }
  };

  const handleSendMessage = async (content) => {
    let targetConvId = activeId;
    if (!targetConvId) {
      try {
        const res = await api.post('/conversations', { title: 'New Conversation' });
        const newConv = res.data;
        targetConvId = newConv.id;
        setConversations([newConv, ...conversations]);
        setActiveId(targetConvId);
      } catch (err) {
        console.error('Failed to create conversation', err);
        return;
      }
    }

    const activeConv = conversations.find(c => c.id === targetConvId);
    const model = activeConv?.model || 'gemini-3.6-flash';

    // Add user message locally
    const userMsg = {
      id: 'temp-user-' + Date.now(),
      sender: 'USER',
      content: content,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingMessage('');

    // Stream AI reply using SSE
    streamChatMessage(
      targetConvId,
      { content, model },
      (chunk) => {
        setStreamingMessage(prev => prev + chunk);
      },
      async () => {
        setIsStreaming(false);
        setStreamingMessage('');
        await fetchMessages(targetConvId);
        await fetchConversations();
      },
      async (err) => {
        console.error('Streaming failed, falling back to standard POST', err);
        try {
          const res = await api.post(`/conversations/${targetConvId}/messages`, { content, model });
          setIsStreaming(false);
          setStreamingMessage('');
          fetchMessages(targetConvId);
          fetchConversations();
        } catch (postErr) {
          setIsStreaming(false);
          setStreamingMessage('');
        }
      }
    );
  };

  const handleModelChange = async (convId, newModel) => {
    try {
      const res = await api.patch(`/conversations/${convId}`, { model: newModel });
      setConversations(conversations.map(c => c.id === convId ? res.data : c));
    } catch (err) {
      console.error('Failed to change model', err);
    }
  };

  const handleRenameConversation = async (convId, newTitle) => {
    try {
      const res = await api.patch(`/conversations/${convId}`, { title: newTitle });
      setConversations(conversations.map(c => c.id === convId ? res.data : c));
    } catch (err) {
      console.error('Failed to rename conversation', err);
    }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await api.delete(`/conversations/${convId}`);
      const filtered = conversations.filter(c => c.id !== convId);
      setConversations(filtered);
      if (activeId === convId) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeId);

  return (
    <div className="app-container">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewChat={handleNewChat}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <ChatWindow
        activeConversation={activeConversation}
        messages={messages}
        streamingMessage={streamingMessage}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessage}
        onModelChange={handleModelChange}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectConversation={(id) => setActiveId(id)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}