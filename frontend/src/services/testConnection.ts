import api from './apiService';

export const testConnection = async () => {
  try {
    const response = await api.get('/');
    console.log('✅ الاتصال ناجح:', response.data);
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال:', error);
    return false;
  }
};