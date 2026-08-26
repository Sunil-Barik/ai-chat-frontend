import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const streamChatMessage = async (
  conversationId,
  messageData,
  onChunk,
  onComplete,
  onError
) => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(
      `${API_URL}/api/conversations/${conversationId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const content = line.slice(5).trimStart();

          if (content) {
            onChunk(content);
          }
        } else if (line.trim() && !line.startsWith('event:')) {
          onChunk(line);
        }
      }
    }

    if (onComplete) {
      onComplete();
    }
  } catch (error) {
    console.error('Streaming error:', error);

    if (onError) {
      onError(error);
    }
  }
};

export default api;