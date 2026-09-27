import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { FaMoneyBillWave, FaShoppingBag, FaChartBar, FaBell, FaExclamationTriangle, FaChartLine, FaCheckCircle, FaCalendarAlt, FaCaretDown, FaUsers } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import './CashierDashboard.css';
import { apiFetch, API_BASE, resolveImage } from '../../utils/api';


const ROLE_COLORS = {
  'Admin': '#8b5cf6',
  'Cashier': '#3b82f6',
  'Kitchen': '#f97316',
  'ผู้ดูแลระบบ': '#8b5cf6',
  'แคชเชียร์': '#3b82f6',
  'พนักงานครัว': '#f97316'
};
const DEFAULT_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function CashierDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateSales, setDateSales] = useState(null);

  // Sales period dropdown
  const [salesPeriod, setSalesPeriod] = useState('today');
  const [salesPeriodCustomDate, setSalesPeriodCustomDate] = useState('');
  const [salesPeriodData, setSalesPeriodData] = useState(null);
  const [salesPeriodLoading, setSalesPeriodLoading] = useState(false);

  // Chart custom data (synced with startDate/endDate)
  const [chartCustomData, setChartCustomData] = useState(null);
  const [chartCustomLoading, setChartCustomLoading] = useState(false);
  const [chartType, setChartType] = useState('sales'); // 'sales' | 'orders'

  const fetchStats = async () => {
    try {
      const res = await apiFetch(`/api/dashboard/stats?range=${timeRange}`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  const fetchSalesByDateRange = async (start, end) => {
    if (!start || !end) {
      setDateSales(null);
      return;
    }
    try {
      const res = await apiFetch(`/api/dashboard/sales-by-date?startDate=${start}&endDate=${end}`);
      const data = await res.json();
      setDateSales(data);
    } catch (err) {
      console.error('Error fetching sales by date range:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Fetch sales for selected period
  useEffect(() => {
    const fetchSalesPeriod = async () => {
      if (salesPeriod === 'today') {
        setSalesPeriodData(null); // use stats.todaySales
        return;
      }
      setSalesPeriodLoading(true);
      try {
        const now = new Date();
        let start, end;
        if (salesPeriod === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          start = end = yesterday.toISOString().split('T')[0];
        } else if (salesPeriod === 'this_month') {
          start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
          end = now.toISOString().split('T')[0];
        } else if (salesPeriod === 'this_year') {
          start = `${now.getFullYear()}-01-01`;
          end = now.toISOString().split('T')[0];
        } else if (salesPeriod === 'custom_date' && salesPeriodCustomDate) {
          start = end = salesPeriodCustomDate;
        } else if (salesPeriod === 'custom_month' && salesPeriodCustomDate) {
          // salesPeriodCustomDate = 'YYYY-MM'
          const [y, m] = salesPeriodCustomDate.split('-');
          start = `${y}-${m}-01`;
          const lastDay = new Date(Number(y), Number(m), 0).getDate();
          end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
        } else if (salesPeriod === 'custom_year' && salesPeriodCustomDate) {
          start = `${salesPeriodCustomDate}-01-01`;
          end = `${salesPeriodCustomDate}-12-31`;
        } else {
          setSalesPeriodLoading(false);
          return;
        }
        const res = await apiFetch(`/api/dashboard/sales-by-date?startDate=${start}&endDate=${end}`);
        const data = await res.json();
        setSalesPeriodData(data);
      } catch (err) {
        console.error('Error fetching period sales:', err);
      } finally {
        setSalesPeriodLoading(false);
      }
    };
    fetchSalesPeriod();
  }, [salesPeriod, salesPeriodCustomDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesByDateRange(startDate, endDate);
      // Fetch chart trend for the same date range
      const fetchChartData = async () => {
        setChartCustomLoading(true);
        try {
          const res = await apiFetch(`/api/dashboard/sales-trend?startDate=${startDate}&endDate=${endDate}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) setChartCustomData(data);
        } catch (err) {
          console.error('Error fetching chart trend:', err);
          setChartCustomData(null);
        } finally {
          setChartCustomLoading(false);
        }
      };
      fetchChartData();
    } else {
      setDateSales(null);
      setChartCustomData(null);
    }
  }, [startDate, endDate]);

  return (
    <BackofficeLayout role="admin">
      {loading || !stats ? (
        <div className="cd-loading">กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="cd-dashboard">
          
          {/* Top Summary Cards */}
          <div className="cd-summary-grid">
            <div className="cd-summary-card cd-sales-period-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon red"><FaMoneyBillWave /></span>
                <div className="cd-sales-period-selector">
                  <select
                    className="cd-sales-period-select"
                    value={salesPeriod}
                    onChange={(e) => {
                      setSalesPeriod(e.target.value);
                      setSalesPeriodCustomDate('');
                      setSalesPeriodData(null);
                    }}
                  >
                    <option value="today">ยอดขายวันนี้</option>
                    <option value="yesterday">ยอดขายเมื่อวาน</option>
                    <option value="custom_date">เลือกวัน...</option>
                    <option value="this_month">ยอดขายเดือนนี้</option>
                    <option value="custom_month">เลือกเดือน...</option>
                    <option value="this_year">ยอดขายปีนี้</option>
                    <option value="custom_year">เลือกปี...</option>
                  </select>
                </div>
              </div>

              {/* Custom date inputs */}
              {salesPeriod === 'custom_date' && (
                <div className="cd-sales-period-input-row">
                  <FaCalendarAlt style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <input
                    type="date"
                    className="cd-sales-period-input"
                    value={salesPeriodCustomDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSalesPeriodCustomDate(e.target.value)}
                  />
                </div>
              )}
              {salesPeriod === 'custom_month' && (
                <div className="cd-sales-period-input-row">
                  <FaCalendarAlt style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <input
                    type="month"
                    className="cd-sales-period-input"
                    value={salesPeriodCustomDate}
                    max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                    onChange={(e) => setSalesPeriodCustomDate(e.target.value)}
                  />
                </div>
              )}
              {salesPeriod === 'custom_year' && (
                <div className="cd-sales-period-input-row">
                  <FaCalendarAlt style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <select
                    className="cd-sales-period-input"
                    value={salesPeriodCustomDate}
                    onChange={(e) => setSalesPeriodCustomDate(e.target.value)}
                  >
                    <option value="">เลือกปี</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y + 543} ({y})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="cd-summary-value highlight">
                {salesPeriodLoading ? (
                  <span style={{ fontSize: '16px', color: '#9ca3af' }}>กำลังโหลด...</span>
                ) : (['custom_date', 'custom_month', 'custom_year'].includes(salesPeriod) && !salesPeriodCustomDate) ? (
                  <span style={{ fontSize: '20px', color: '#9ca3af' }}>-</span>
                ) : salesPeriod === 'today' || !salesPeriodData ? (
                  stats.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                ) : (
                  salesPeriodData.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                )}
              </div>
            </div>
            
            <div className="cd-summary-card cd-sales-period-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon gray"><FaShoppingBag /></span>
                <div className="cd-sales-period-selector">
                  <select
                    className="cd-sales-period-select"
                    value={salesPeriod}
                    onChange={(e) => {
                      setSalesPeriod(e.target.value);
                      setSalesPeriodCustomDate('');
                      setSalesPeriodData(null);
                    }}
                  >
                    <option value="today">ออเดอร์วันนี้</option>
                    <option value="yesterday">ออเดอร์เมื่อวาน</option>
                    <option value="custom_date">เลือกวัน...</option>
                    <option value="this_month">ออเดอร์เดือนนี้</option>
                    <option value="custom_month">เลือกเดือน...</option>
                    <option value="this_year">ออเดอร์ปีนี้</option>
                    <option value="custom_year">เลือกปี...</option>
                  </select>
                </div>
              </div>

              {/* Custom date inputs - synced with sales */}
              {salesPeriod === 'custom_date' && (
                <div className="cd-sales-period-input-row">
                  <FaCalendarAlt style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <input
                    type="date"
                    className="cd-sales-period-input"
                    value={salesPeriodCustomDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSalesPeriodCustomDate(e.target.value)}
                  />
                </div>
              )}
              {salesPeriod === 'custom_month' && (
                <div className="cd-sales-period-input-row">
                  <FaCalendarAlt style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <input
                    type="month"
                    className="cd-sales-period-input"
                    value={salesPeriodCustomDate}
                    max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                    onChange={(e) => setSalesPeriodCustomDate(e.target.value)}
                  />
                </div>
              )}
              {salesPeriod === 'custom_year' && (
                <div className="cd-sales-period-input-row">
                  <FaCalendarAlt style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <select
                    className="cd-sales-period-input"
                    value={salesPeriodCustomDate}
                    onChange={(e) => setSalesPeriodCustomDate(e.target.value)}
                  >
                    <option value="">เลือกปี</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y + 543} ({y})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="cd-summary-value">
                {salesPeriodLoading ? (
                  <span style={{ fontSize: '16px', color: '#9ca3af' }}>กำลังโหลด...</span>
                ) : (['custom_date', 'custom_month', 'custom_year'].includes(salesPeriod) && !salesPeriodCustomDate) ? (
                  <span style={{ fontSize: '20px', color: '#9ca3af' }}>-</span>
                ) : salesPeriod === 'today' || !salesPeriodData ? (
                  stats.todayOrders
                ) : (
                  salesPeriodData.orders
                )}
              </div>
            </div>

            <div className="cd-summary-card cd-sales-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon gray"><FaChartBar /></span>
                <span className="cd-summary-label">
                  {startDate && endDate && dateSales 
                    ? `ยอดขาย (${new Date(startDate + 'T00:00:00').toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${new Date(endDate + 'T00:00:00').toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })})` 
                    : 'ยอดขายทั้งหมด'}
                </span>
              </div>
              <div className="cd-summary-value">
                {startDate && endDate && dateSales 
                  ? dateSales.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="cd-date-picker-row" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                <Flatpickr
                  className="cd-date-picker"
                  options={{
                    mode: 'range',
                    dateFormat: 'Y-m-d',
                    maxDate: 'today',
                    locale: Thai
                  }}
                  placeholder="คลิกเพื่อเลือกช่วงวันที่..."
                  onChange={(dates) => {
                    if (dates.length === 2) {
                      const start = new Date(dates[0].getTime() - (dates[0].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      const end = new Date(dates[1].getTime() - (dates[1].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    } else if (dates.length === 0) {
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                  value={startDate && endDate ? [startDate, endDate] : []}
                  style={{ flex: 1, minWidth: '220px', fontSize: '0.85rem', padding: '6px' }}
                />
                {(startDate || endDate) && (
                  <button 
                    className="cd-date-clear-btn" 
                    onClick={() => { setStartDate(''); setEndDate(''); setChartCustomData(null); }}
                    title="ดูยอดขายทั้งหมด"
                    style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                  >
                    ดูทั้งหมด
                  </button>
                )}
              </div>
            </div>

            {/* Employee Stats Card */}
            <div className="cd-summary-card cd-sales-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><FaUsers /></span>
                <span className="cd-summary-label">พนักงานทั้งหมด</span>
              </div>
              <div className="cd-summary-value" style={{ marginBottom: '12px' }}>
                {stats.totalEmployees || 0} <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>คน</span>
              </div>
              <div style={{ height: '120px', width: '100%', marginTop: 'auto' }}>
                {stats.employeeStats && stats.employeeStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.employeeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="role" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        formatter={(value) => [`${value} คน`, 'จำนวน']}
                        labelStyle={{ color: '#374151', fontSize: '12px', fontWeight: 'bold' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                        {stats.employeeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#9ca3af', fontSize: '13px' }}>ไม่มีข้อมูลพนักงาน</div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section: Chart & Alerts */}
          <div className="cd-middle-grid">
            
            {/* Chart */}
            <div className="cd-chart-card">
              <div className="cd-card-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ margin: 0 }}>Trend</h3>
                    <div style={{ display: 'flex', background: '#f3f4f6', padding: '2px', borderRadius: '6px' }}>
                      <button 
                        onClick={() => setChartType('sales')}
                        style={{
                          padding: '4px 12px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                          background: chartType === 'sales' ? 'white' : 'transparent',
                          color: chartType === 'sales' ? '#dc2626' : '#6b7280',
                          fontWeight: chartType === 'sales' ? 'bold' : 'normal',
                          boxShadow: chartType === 'sales' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >ยอดขาย</button>
                      <button 
                        onClick={() => setChartType('orders')}
                        style={{
                          padding: '4px 12px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                          background: chartType === 'orders' ? 'white' : 'transparent',
                          color: chartType === 'orders' ? '#3b82f6' : '#6b7280',
                          fontWeight: chartType === 'orders' ? 'bold' : 'normal',
                          boxShadow: chartType === 'orders' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >จำนวนออเดอร์</button>
                    </div>
                  </div>
                  <span className="cd-subtitle">
                    {chartCustomData && startDate && endDate
                      ? `${new Date(startDate + 'T00:00:00').toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${new Date(endDate + 'T00:00:00').toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                      : (chartType === 'sales' ? 'แนวโน้มยอดขาย' : 'แนวโน้มจำนวนออเดอร์')}
                  </span>
                </div>
                {!chartCustomData && (
                  <select 
                    className="cd-filter-btn" 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{outline: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px'}}
                  >
                    <option value="day">วันนี้ (รายชั่วโมง)</option>
                    <option value="week">สัปดาห์นี้</option>
                    <option value="month">เดือนนี้ (30 วัน)</option>
                    <option value="year">ปีนี้ (12 เดือน)</option>
                  </select>
                )}
              </div>
              <div className="cd-chart-container">
                {chartCustomLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>กำลังโหลดกราฟ...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartCustomData || stats.weeklySales} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                      <Tooltip 
                        cursor={{ stroke: '#fef2f2', strokeWidth: 2 }} 
                        labelFormatter={(value, payload) => {
                          if (payload && payload.length > 0) {
                            const prefix = chartCustomData ? 'วันที่:' : (timeRange === 'day' ? 'เวลา:' : (timeRange === 'year' ? 'เดือน:' : 'วันที่:'));
                            return `${prefix} ${payload[0].payload.fullDate || value}`;
                          }
                          return value;
                        }}
                      />
                      <Line 
                        name={chartType === 'sales' ? 'ยอดขาย (บาท)' : 'จำนวนออเดอร์ (บิล)'}
                        type="monotone" 
                        dataKey={chartType}
                        stroke={chartType === 'sales' ? '#dc2626' : '#3b82f6'}
                        strokeWidth={3}
                        dot={{ r: 4, fill: chartType === 'sales' ? '#dc2626' : '#3b82f6', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: chartType === 'sales' ? '#b91c1c' : '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Alerts */}
            <div className="cd-alerts-card">
              <div className="cd-card-header">
                <h3><FaBell style={{color:'#f59e0b', marginRight:'8px'}}/> แจ้งเตือนสต็อก</h3>
              </div>
              <div className="cd-alerts-list">
                {stats.stockAlerts && stats.stockAlerts.length > 0 ? (
                  stats.stockAlerts.map(alert => (
                    <div key={alert.id} className={`cd-alert-item ${alert.quantity <= 0 ? 'critical' : ''}`}>
                      <div className="cd-alert-icon"><FaExclamationTriangle style={{color: alert.quantity <= 0 ? '#ef4444' : '#f59e0b'}}/></div>
                      <div className="cd-alert-info">
                        <span className="cd-alert-name">{alert.name}</span>
                        <span className="cd-alert-status">{alert.status}</span>
                      </div>
                      <button className="cd-alert-action" onClick={() => navigate('/inventory')}>สั่งซื้อ</button>
                    </div>
                  ))
                ) : (
                  <div className="cd-alert-empty">สต็อกสินค้าทุกรายการอยู่ในระดับปกติ <FaCheckCircle style={{ color: '#10b981', marginLeft: '6px', fontSize: '1.1em' }} /></div>
                )}
              </div>
              <button className="cd-alerts-view-all" onClick={() => navigate('/inventory')}>ดูคลังสินค้าทั้งหมด</button>
            </div>
          </div>

          {/* Bottom Section: Best Selling */}
          <div className="cd-best-selling-section">
            <div className="cd-bs-header">
              <div>
                <h3>สินค้าขายดี</h3>
                <span className="cd-subtitle">ยอดจำหน่ายสะสมประจำเดือนนี้</span>
              </div>
            </div>

            <div className="cd-bs-grid">
              {stats.bestSelling && stats.bestSelling.map((product, index) => (
                <div key={index} className="cd-bs-card">
                  <div className="cd-bs-rank">อันดับ {index + 1}</div>
                  <img src={resolveImage(product.image)} alt={product.name} className="cd-bs-img" />
                  <div className="cd-bs-info">
                    <span className="cd-bs-name">{product.name}</span>
                    <span className="cd-bs-sold"><FaChartLine style={{marginRight:'4px', color:'#10b981'}}/> ขายแล้ว {product.sold} ชิ้น</span>
                    <div className="cd-bs-bar-container">
                      <div className="cd-bs-bar-fill" style={{ width: index === 0 ? '80%' : index === 1 ? '50%' : '30%', backgroundColor: index === 0 ? '#dc2626' : '#4b5563' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </BackofficeLayout>
  );
}
