import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Trash2, Edit2, Sparkles, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onOpenSearch,
  onOpenSettings,
  onRenameConversation,
  onDeleteConversation,
  collapsed,
  onToggleCollapse
}) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (convId, e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <a href="#" className="brand-logo">
            <div className="brand-icon"><Sparkles size={20} /></div>
            <span>AI Chat</span>
          </a>
        )}
        <button className="icon-btn" onClick={onToggleCollapse} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat} title="Start new conversation">
        <Plus size={18} />
        {!collapsed && <span>New Chat</span>}
      </button>

      {!collapsed && (
        <button className="search-trigger-btn" onClick={onOpenSearch}>
          <Search size={16} />
          <span>Search chats...</span>
        </button>
      )}

      <div className="conversation-list">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId;
          return (
            <div
              key={conv.id}
              className={`conversation-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.id)}
              title={conv.title}
            >
              <MessageSquare size={16} style={{ flexShrink: 0, color: isActive ? 'var(--accent-primary)' : 'inherit' }} />

              {!collapsed && (
                <>
                  {editingId === conv.id ? (
                    <form onSubmit={(e) => handleSaveRename(conv.id, e)} onClick={(e) => e.stopPropagation()} style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={(e) => handleSaveRename(conv.id, e)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--accent-primary)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </form>
                  ) : (
                    <span className="conv-title">{conv.title}</span>
                  )}

                  <div className="conv-actions">
                    <button className="icon-btn" style={{ width: '24px', height: '24px' }} onClick={(e) => handleStartRename(conv, e)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="icon-btn" style={{ width: '24px', height: '24px', color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-badge" onClick={onOpenSettings}>
          <div className="avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Settings & Usage</div>
            </div>
          )}
          {!collapsed && <Settings size={16} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>
    </aside>
  );
}
