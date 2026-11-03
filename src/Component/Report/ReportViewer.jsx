import React, { useState, useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isValid } from 'date-fns-jalali';
import { 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  Filter, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import './ReportViewer.css';

export default function ReportViewer({ reports = [] }) {
  // فیلترهای تاریخ شمسی بر اساس شیء Date استاندارد
  const [requestDateFrom, setRequestDateFrom] = useState(null);
  const [requestDateTo, setRequestDateTo] = useState(null);
  const [entryDateFrom, setEntryDateFrom] = useState(null);
  const [entryDateTo, setEntryDateTo] = useState(null);

  // جستجوی آزاد متنی
  const [searchQuery, setSearchQuery] = useState('');

  // صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // تبدیل تاریخ به فرمت رشته‌ای یکدست برای مقایسه (YYYY/MM/DD)
  const toFormattedJalali = (dateVal) => {
    if (!dateVal) return '';
    if (dateVal instanceof Date) {
      return isValid(dateVal) ? format(dateVal, 'yyyy/MM/dd') : '';
    }
    // اگر از قبل رشته بود (مثلا 1403/1/5)، بخش‌ها را دو رقمی و نرمال می‌کنیم
    return String(dateVal)
      .trim()
      .replace(/-/g, '/')
      .split('/')
      .map((part) => part.padStart(2, '0'))
      .join('/');
  };

  // فیلتر داده‌ها با useMemo
  const filteredData = useMemo(() => {
    const normReqFrom = toFormattedJalali(requestDateFrom);
    const normReqTo = toFormattedJalali(requestDateTo);
    const normEntFrom = toFormattedJalali(entryDateFrom);
    const normEntTo = toFormattedJalali(entryDateTo);

    return reports.filter((item) => {
      const reqDate = toFormattedJalali(item.requestDate || item.RequestDate);
      const entDate = toFormattedJalali(item.entryDate || item.EntryDate);

      // فیلتر تاریخ درخواست (از - تا)
      if (normReqFrom && reqDate < normReqFrom) return false;
      if (normReqTo && reqDate > normReqTo) return false;

      // فیلتر تاریخ ورودی (از - تا)
      if (normEntFrom && entDate < normEntFrom) return false;
      if (normEntTo && entDate > normEntTo) return false;

      // جستجوی متنی
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matches = Object.values(item).some((val) =>
          String(val || '').toLowerCase().includes(query)
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [reports, requestDateFrom, requestDateTo, entryDateFrom, entryDateTo, searchQuery]);

  // پاک کردن تمام فیلترها
  const handleResetFilters = () => {
    setRequestDateFrom(null);
    setRequestDateTo(null);
    setEntryDateFrom(null);
    setEntryDateTo(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // دانلود خروجی فیلتر شده به صورت CSV
  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = ['ردیف', 'تاریخ درخواست', 'تاریخ ورودی', 'تاریخ پاسخگویی', 'IP', 'خروجی'];
    const csvRows = [
      headers.join(','),
      ...filteredData.map((row, idx) => [
        idx + 1,
        `"${row.requestDate || row.RequestDate || ''}"`,
        `"${row.entryDate || row.EntryDate || ''}"`,
        `"${row.responseDate || row.ResponseDate || ''}"`,
        `"${row.ip || row.clientIp || ''}"`,
        `"${(row.output || row.result || '').toString().replace(/"/g, '""')}"`
      ].join(','))
    ];

    const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // صفحه‌بندی
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
      <div className="report-panel">
        
        {/* نوار عنوان بالا */}
        <div className="report-topbar">
          <div className="report-title-area">
            <Filter size={20} className="report-icon" />
            <h2>گزارش جامع داده‌های سامانه</h2>
          </div>
          <button 
            className="btn-export" 
            onClick={handleExportCSV} 
            disabled={!filteredData.length}
          >
            <FileSpreadsheet size={16} />
            <span>دریافت خروجی CSV</span>
          </button>
        </div>

        {/* بخش فیلترها همراه با DatePicker شمسی */}
        <div className="filter-card">
          <div className="filters-grid">
            
            {/* فیلتر تاریخ درخواست */}
            <div className="filter-group">
              <span className="filter-group-label">تاریخ درخواست:</span>
              <div className="date-inputs-pair">
                <DatePicker
                  label="از تاریخ"
                  value={requestDateFrom}
                  onChange={(val) => { setRequestDateFrom(val); setCurrentPage(1); }}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true, className: 'mui-date-field' }
                  }}
                />
                <span className="date-separator">تا</span>
                <DatePicker
                  label="تا تاریخ"
                  value={requestDateTo}
                  onChange={(val) => { setRequestDateTo(val); setCurrentPage(1); }}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true, className: 'mui-date-field' }
                  }}
                />
              </div>
            </div>

            {/* فیلتر تاریخ ورودی */}
            <div className="filter-group">
              <span className="filter-group-label">تاریخ ورودی:</span>
              <div className="date-inputs-pair">
                <DatePicker
                  label="از تاریخ"
                  value={entryDateFrom}
                  onChange={(val) => { setEntryDateFrom(val); setCurrentPage(1); }}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true, className: 'mui-date-field' }
                  }}
                />
                <span className="date-separator">تا</span>
                <DatePicker
                  label="تا تاریخ"
                  value={entryDateTo}
                  onChange={(val) => { setEntryDateTo(val); setCurrentPage(1); }}
                  slotProps={{
                    textField: { size: 'small', fullWidth: true, className: 'mui-date-field' }
                  }}
                />
              </div>
            </div>

            {/* جستجوی متنی آزاد */}
            <div className="filter-group search-group">
              <span className="filter-group-label">جستجو در تمام فیلدها:</span>
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="جستجو (IP، خروجی و ...)..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="filter-input search-input"
                />
              </div>
            </div>

          </div>

          {/* فوتر فیلترها و دکمه ریست */}
          <div className="filter-footer">
            <div className="badge-count">
              تعداد رکوردهای یافت شده: <strong>{filteredData.length.toLocaleString('fa-IR')}</strong> از {reports.length.toLocaleString('fa-IR')}
            </div>
            <button className="btn-reset" onClick={handleResetFilters}>
              <RotateCcw size={14} />
              <span>پاک کردن فیلترها</span>
            </button>
          </div>
        </div>

        {/* جدول نمایش رکوردها */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>تاریخ درخواست</th>
                <th>تاریخ ورودی</th>
                <th>تاریخ پاسخگویی</th>
                <th>IP</th>
                <th>خروجی</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td>
                      <span className="date-tag">
                        {row.requestDate || row.RequestDate || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="date-tag secondary">
                        {row.entryDate || row.EntryDate || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="date-tag tertiary">
                        {row.responseDate || row.ResponseDate || '-'}
                      </span>
                    </td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>
                      <code>{row.ip || row.clientIp || '-'}</code>
                    </td>
                    <td>
                      <span className="output-cell">
                        {row.output || row.result || row.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    هیچ داده‌ای با فیلترهای مشخص شده یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronRight size={18} />
              <span>قبلی</span>
            </button>

            <span className="page-indicator">
              صفحه {currentPage} از {totalPages}
            </span>

            <button 
              className="pagination-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <span>بعدی</span>
              <ChevronLeft size={18} />
            </button>
          </div>
        )}

      </div>
    </LocalizationProvider>
  );
}
