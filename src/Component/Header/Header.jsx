import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { UploadCloud, FileText, Download } from 'lucide-react';
import { downloadImportTemplate } from '../../services/api';
import { toast } from 'react-toastify';
import './Header.css';

export default function Header({ 
  title = 'سامانه بارگذاری و گزارشات', 
  logoSrc = '/logo.png',
  userTitle = 'کاربر سامانه'
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadTemplate = async (e) => {
    e.preventDefault();
    try {
      setDownloading(true);
      const blob = await downloadImportTemplate();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('قالب اکسل با موفقیت دانلود شد.');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('خطا در دانلود قالب اکسل.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="site-header">
      {/* سمت راست: عنوان سامانه و منوی ناوبری */}
      <div className="header-col header-col-right">
        <h1 className="header-title">{title}</h1>
        <nav className="header-nav">
          {/* دکمه دانلود قالب با کلاس nav-link برای داشتن ظاهر کاملاً مشابه آپلود فایل */}
          <button 
            type="button" 
            onClick={handleDownloadTemplate} 
            disabled={downloading}
            className="nav-link"
            style={{ background: 'none', cursor: 'pointer' }}
          >
            <Download size={16} />
            <span>{downloading ? 'در حال دانلود...' : 'دانلود قالب'}</span>
          </button>

          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <UploadCloud size={16} />
            <span>آپلود فایل</span>
          </NavLink>
          
          <NavLink to="/report" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FileText size={16} />
            <span>گزارش</span>
          </NavLink>
        </nav>
      </div>

      {/* وسط: محل قرارگیری تصویر / لوگو */}
      <div className="header-col header-col-center">
        <div className="logo-container">
          <img
            src={logoSrc}
            alt="لوگو سامانه"
            className="center-logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement.querySelector('.logo-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="logo-fallback" style={{ display: 'none' }}>
            <span>لوگو</span>
          </div>
        </div>
      </div>

      {/* سمت چپ: مشخصات کاربر */}
      <div className="header-col header-col-left">
        <div className="user-badge">
          <span className="user-status-dot"></span>
          <span>{userTitle}</span>
        </div>
      </div>
    </header>
  );
}
