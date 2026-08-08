import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { FaMoneyBillWave, FaShoppingBag, FaChartBar, FaBell, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './CashierDashboard.css';

const API_BASE = 'http://localhost:5000';

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

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/stats?range=${timeRange}`);
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <BackofficeLayout role="cashier">
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
                <span className="cd-summary-label">จำนวนออเดอร์</span>
              </div>
              <div className="cd-summary-value">
                {stats.totalOrders}
              </div>
            </div>

            <div className="cd-summary-card">
              <div className="cd-summary-header">
                <span className="cd-summary-icon gray"><FaChartBar /></span>
                <span className="cd-summary-label">ยอดขายทั้งหมด</span>
              </div>
              <div className="cd-summary-value">
                {stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <option value="week">สัปดาห์นี้</option>
                  <option value="month">เดือนนี้ (30 วัน)</option>
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
                          return `วันที่: ${payload[0].payload.fullDate}`;
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
                  <div className="cd-alert-empty">สต็อกสินค้าทุกรายการอยู่ในระดับปกติ ✅</div>
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
