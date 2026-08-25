import React from 'react';
import { Cpu, Sparkles, Zap, Globe } from 'lucide-react';

const MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google AI', icon: Sparkles, badge: 'Fast & Free' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google AI', icon: Sparkles, badge: 'Smart' },
  { id: 'groq-llama3-70b', name: 'Llama 3 70B', provider: 'Groq', icon: Zap, badge: 'Ultra Fast' },
  { id: 'openrouter-claude3.5', name: 'Claude 3.5 Sonnet', provider: 'OpenRouter', icon: Globe, badge: 'Pro' }
];

export default function ModelSelector({ currentModel, onSelectModel }) {
  const selectedModel = MODELS.find(m => m.id === currentModel) || MODELS[0];
  const Icon = selectedModel.icon;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={selectedModel.id}
        onChange={(e) => onSelectModel(e.target.value)}
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px 6px 34px',
          fontSize: '0.86rem',
          fontWeight: '600',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none'
        }}
      >
        {MODELS.map(m => (
          <option key={m.id} value={m.id} style={{ background: '#131b29', color: '#f1f5f9' }}>
            {m.name} ({m.provider})
          </option>
        ))}
      </select>
      <Icon size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--accent-primary)' }} />
    </div>
  );
}
