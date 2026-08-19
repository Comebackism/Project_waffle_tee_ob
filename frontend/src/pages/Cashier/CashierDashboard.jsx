import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { FaMoneyBillWave, FaShoppingBag, FaChartBar, FaBell, FaExclamationTriangle, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';
import { Thai } from 'flatpickr/dist/l10n/th.js';
import './CashierDashboard.css';
import { apiFetch, API_BASE } from '../../utils/api';

const resolveImage = (pic) => {
  if (!pic) return 'https://via.placeholder.com/60';
  if (pic.startsWith('http')) return pic;
  return `${API_BASE}${pic}`;
};

export default function CashierDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateSales, setDateSales] = useState(null);

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

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesByDateRange(startDate, endDate);
    } else {
      setDateSales(null);
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
            <div className="cd-summary-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon red"><FaMoneyBillWave /></span>
                <span className="cd-summary-label">ยอดขายวันนี้ ⌄</span>
              </div>
              <div className="cd-summary-value highlight">
                {stats.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="cd-summary-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon gray"><FaShoppingBag /></span>
                <span className="cd-summary-label">ออเดอร์วันนี้</span>
              </div>
              <div className="cd-summary-value">
                {stats.todayOrders}
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
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    title="ดูยอดขายทั้งหมด"
                    style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                  >
                    ดูทั้งหมด
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section: Chart & Alerts */}
          <div className="cd-middle-grid">
            
            {/* Chart */}
            <div className="cd-chart-card">
              <div className="cd-card-header">
                <h3>Sales Trend</h3>
                <span className="cd-subtitle">แนวโน้มยอดขาย</span>
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
              </div>
              <div className="cd-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklySales} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                    <Tooltip 
                      cursor={{ stroke: '#fef2f2', strokeWidth: 2 }} 
                      labelFormatter={(value, payload) => {
                        if (payload && payload.length > 0) {
                          const prefix = timeRange === 'day' ? 'เวลา:' : (timeRange === 'year' ? 'เดือน:' : 'วันที่:');
                          return `${prefix} ${payload[0].payload.fullDate}`;
                        }
                        return value;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#dc2626" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#dc2626', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#b91c1c' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
