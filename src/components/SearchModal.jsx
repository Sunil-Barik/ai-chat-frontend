import React, { useState, useEffect } from 'react';
import { Search, X, MessageSquare } from 'lucide-react';
import api from '../services/api';

export default function SearchModal({ isOpen, onClose, onSelectConversation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <Search size={20} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search past conversations & messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="form-input"
              style={{ border: 'none', background: 'transparent', fontSize: '1.05rem', padding: 0 }}
            />
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '16px' }}>
          {loading && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Searching...</div>}
          {!loading && query && results.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No matching conversations found.</div>
          )}
          {results.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                onClose();
              }}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                marginBottom: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <MessageSquare size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{conv.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Model: {conv.model}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
