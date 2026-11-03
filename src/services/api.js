import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.yourdomain.com',
  timeout: 60000,
});

/**
 * ارسال فایل اکسل به بک‌اند
 * @param {File} file - فایل انتخاب شده توسط کاربر
 * @param {Function} onUploadProgress - کال‌بک درصد پیشرفت آپلود
 * @returns {Promise} نتیجه پاسخ سرور (داده‌های گزارش)
 */
export const uploadExcelReport = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/imports/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * دریافت فایل قالب اکسل (Template) از سرور
 * @returns {Promise<Blob>} فایل قالب برای دانلود
 */
export const downloadImportTemplate = async () => {
  const response = await apiClient.get('/imports/template', {
    responseType: 'blob', // برای دریافت فایل به صورت باینری (Blob)
  });
  return response.data;
};
