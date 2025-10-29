import axios from 'axios';

// Dynamic API URL based on environment
const API_URL = process.env.REACT_APP_API_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'https://your-backend-app.azurewebsites.net' 
                  : 'http://localhost:5000');

console.log('Using API URL:', API_URL);

export async function sendChatMessage(message, chatId) {
  try {
    const response = await axios.post(`${API_URL}/api/chat`, {
      message,
      chatId
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
}

export async function checkHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
}
