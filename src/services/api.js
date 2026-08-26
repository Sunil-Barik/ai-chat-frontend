import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://ai-chat-backend-u5ud.onrender.com';

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
      const errorText = await response.text();

      throw new Error(
        errorText || `HTTP error! status: ${response.status}`
      );
    }

    if (!response.body) {
      throw new Error('Streaming response body is empty.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');

      // Keep incomplete last line for the next chunk
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          continue;
        }

        if (trimmedLine.startsWith('data:')) {
          const content = trimmedLine.slice(5).trimStart();

          if (content && onChunk) {
            onChunk(content);
          }
        } else if (!trimmedLine.startsWith('event:')) {
          if (onChunk) {
            onChunk(trimmedLine);
          }
        }
      }
    }

    // Process anything remaining in the buffer
    if (buffer.trim()) {
      const remaining = buffer.trim();

      if (remaining.startsWith('data:')) {
        const content = remaining.slice(5).trimStart();

        if (content && onChunk) {
          onChunk(content);
        }
      } else if (!remaining.startsWith('event:')) {
        if (onChunk) {
          onChunk(remaining);
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