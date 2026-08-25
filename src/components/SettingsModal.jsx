import React, { useState, useEffect } from 'react';
import { X, User, Shield, Moon, Sun, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [defaultModel, setDefaultModel] = useState(user?.defaultModel || 'gemini-2.0-flash');
  const [usage, setUsage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setDefaultModel(user?.defaultModel || 'gemini-2.0-flash');
      fetchUsage();
    }
  }, [isOpen, user]);

  const fetchUsage = async () => {
    try {
      const res = await api.get('/usage');
      setUsage(res.data);
    } catch (err) {
      console.error('Failed to fetch usage', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { name, defaultModel });
      updateUser(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={22} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="modal-title">Settings & Profile</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default AI Model</label>
            <select
              className="form-input"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="groq-llama3-70b">Groq Llama 3 70B</option>
              <option value="openrouter-claude3.5">OpenRouter Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
            <span className="form-label" style={{ margin: 0 }}>Theme Mode</span>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              style={{ display: 'flex', gap: '8px', width: 'auto', padding: '6px 12px', background: 'var(--bg-tertiary)' }}
            >
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span style={{ fontSize: '0.85rem' }}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {usage && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.88rem', fontWeight: '600' }}>
                <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>Usage Quota</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div>Daily Messages: {usage.dailyMessagesUsed} / {usage.dailyLimit}</div>
                <div>Monthly Messages: {usage.monthlyMessagesUsed} / {usage.monthlyLimit}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="icon-btn" onClick={logout} style={{ color: '#ef4444', border: '1px solid #ef4444', width: 'auto', padding: '0 16px' }}>
              <LogOut size={16} style={{ marginRight: '6px' }} /> Logout
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
