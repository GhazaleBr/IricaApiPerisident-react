import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ExcelUploader from './Component/ExcelUpload/ExcelUploader';
import Header from './Component/Header/Header';
import ReportViewer from './Component/Report/ReportViewer';
import custlogo from './assets/image/cust-text2.png';
import './App.css';

// صفحه آپلود (مستقل: صرفاً پس از آپلود موفق به گزارش هدایت می‌کند)
function UploadPage() {
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    // بعد از آپلود موفق فایل در سرور، مستقیماً به صفحه گزارش هدایت می‌شود
    navigate('/report');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        سامانه بارگذاری اکسل و دریافت گزارشات
      </h2>
      
      {/* متن راهنما که اضافه شد */}
      <div 
        style={{
          backgroundColor: '#f8f9fa',
          borderRight: '4px solid #0d6efd',
          padding: '12px 16px',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#333',
          lineHeight: '1.6',
          fontFamily: 'IRANSansWeb, Tahoma, sans-serif'
        }}
      >
        لطفا  <strong>قالب اکسل</strong> را دریافت کنید و با توجه به آن، فایل نهایی اکسل را آماده نمایید.
      </div>

      <ExcelUploader onReportReceived={handleUploadSuccess} />
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container">
      {/* هدر ثابت در کل برنامه */}
      <Header 
        title="سامانه گزارشات" 
        logoSrc={custlogo} 
        userTitle="اپراتور سیستم"
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/report" element={<ReportViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
