/**
 * Chat API Service for communicating with backend LLM REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Send user message and conversation context to backend
 * @param {string} message - Current user message
 * @param {Array<{role: string, text: string}>} history - Context history
 * @returns {Promise<{answer: string}>}
 */
export async function sendChatMessage(message, history = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.instruction
        ? `${data.error}\n\n👉 ${data.instruction}`
        : data.error || `Server returned error (${response.status})`;
      const errorObj = new Error(errorMessage);
      errorObj.status = response.status;
      errorObj.code = data.code;
      throw errorObj;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to the backend server. Please make sure the backend is running on http://localhost:5000.'
      );
    }
    throw error;
  }
}

/**
 * Check backend health status
 */
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return { status: 'down' };
    return await response.json();
  } catch {
    return { status: 'offline' };
  }
}
