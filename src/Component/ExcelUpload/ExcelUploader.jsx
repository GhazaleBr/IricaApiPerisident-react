import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadExcelReport } from '../../services/api';

import './ExcelUploader.css';

export default function ExcelUploader({ onReportReceived }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // بررسی پسوند مجاز اکسل
    const validExtensions = ['xlsx', 'xls', 'csv'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMessage('فرمت فایل نامعتبر است. فقط فایلهای xlsx, xls یا csv مجاز هستند.');
      setSelectedFile(null);
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setErrorMessage('');
    setUploadProgress(0);

    try {
      // ارسال به بک‌اند و دریافت نتیجه گزارش
      const reportData = await uploadExcelReport(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      // تحویل خروجی به کامپوننت والد برای نمایش گزارش
      if (onReportReceived) {
        onReportReceived(reportData);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'خطا در آپلود فایل و ارتباط با سرور.';
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="uploader-card">
      <form onSubmit={handleSubmit} className="uploader-form">
        <input
          ref={fileInputRef}
          type="file"
          id="excelFileInput"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          hidden
          disabled={isUploading}
        />

        {!selectedFile ? (
          <label htmlFor="excelFileInput" className="dropzone-area">
            <UploadCloud size={46} className="upload-icon" />
            <span className="dropzone-text">برای انتخاب فایل اکسل کلیک کنید</span>
            <span className="dropzone-hint">فرمت‌های مجاز: .xlsx, .xls, .csv</span>
          </label>
        ) : (
          <div className="file-preview-card">
            <div className="file-details">
              <FileSpreadsheet size={32} className="file-icon" />
              <div className="file-meta">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / 1024).toFixed(1)} کیلوبایت
                </span>
              </div>
            </div>
            {!isUploading && (
              <button type="button" onClick={handleClearFile} className="btn-remove" title="حذف فایل">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-label">{uploadProgress}% در حال ارسال به سرور...</span>
          </div>
        )}

        {errorMessage && <div className="alert-error">{errorMessage}</div>}

        <button
          type="submit"
          className="btn-submit"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="spinner" />
              <span>در حال ارسال...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>ارسال فایل</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
