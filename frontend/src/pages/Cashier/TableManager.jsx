import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaQrcode, FaPrint, FaTrashAlt, FaPlus, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import BackofficeLayout from '../../layouts/BackofficeLayout';
import './TableManager.css';
import { apiFetch, API_BASE } from '../../utils/api';

export default function TableManager() {
  const [sessions, setSessions] = useState([]);
  const [qrType, setQrType] = useState('dine-in');
  const [tableNo, setTableNo] = useState('');
  const [duration, setDuration] = useState('2');
  const [customDuration, setCustomDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [viewSession, setViewSession] = useState(null); // For modal
  const [confirmModal, setConfirmModal] = useState({ show: false, sessionId: null, tableNo: null });

  const fetchSessions = async () => {
    try {
      const res = await apiFetch('/api/qr/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    let actualTableNo = tableNo;
    if (qrType === 'takeaway') {
      const takeawaySessions = sessions.filter(s => s.table_no.startsWith('หน้าร้าน'));
      let nextNum = 1;
      if (takeawaySessions.length > 0) {
        const nums = takeawaySessions.map(s => {
          const match = s.table_no.match(/หน้าร้าน\s*(\d+)?/);
          return match && match[1] ? parseInt(match[1]) : 1;
        });
        nextNum = Math.max(...nums) + 1;
      }
      actualTableNo = `หน้าร้าน ${nextNum}`;
    }
    
    if (qrType === 'dine-in' && !actualTableNo.trim()) {
      setError('กรุณาระบุหมายเลขโต๊ะ');
      return;
    }
    
    let finalDuration = duration;
    if (duration === 'custom') {
      if (!customDuration || isNaN(customDuration) || Number(customDuration) <= 0) {
        setError('กรุณาระบุระยะเวลาให้ถูกต้อง (ชั่วโมง)');
        return;
      }
      finalDuration = customDuration;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_no: actualTableNo, duration_hours: finalDuration })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`สร้าง QR Code สำหรับ ${actualTableNo} สำเร็จ!`);
        setTableNo('');
        fetchSessions();
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการสร้าง');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = (sessionId, table) => {
    setConfirmModal({ show: true, sessionId, tableNo: table });
  };

  const confirmEndSession = async () => {
    if (!confirmModal.sessionId) return;
    try {
      const res = await apiFetch(`/api/qr/end/${confirmModal.sessionId}`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error('Error ending session:', err);
    } finally {
      setConfirmModal({ show: false, sessionId: null, tableNo: null });
    }
  };

  const handlePrint = (sessionId, tableNo, expiresAt) => {
    // Open a new window for printing the QR
    const printWindow = window.open('', '_blank');
    const qrUrl = `http://localhost:5173/?session=${sessionId}`;
    const formattedTime = formatTime(expiresAt);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap');
            body { 
              font-family: 'Kanit', sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: flex-start; 
              height: 100vh; 
              margin: 0; 
              padding-top: 20px;
              background-color: #f0f0f0;
            }
            .ticket { 
              background: #fff;
              text-align: center; 
              border: 1px solid #ddd;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              padding: 40px 30px; 
              border-radius: 16px; 
              width: 300px;
            }
            .logo {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 5px;
              color: #c8102e;
            }
            .shop-name {
              font-size: 14px;
              color: #555;
              margin-bottom: 25px;
            }
            h2 { 
              margin: 0 0 5px 0; 
              font-size: 28px;
              color: #111;
            }
            .divider {
              border-top: 2px dashed #ccc;
              margin: 15px 0;
            }
            p { 
              color: #444; 
              margin: 0 0 10px 0; 
              font-size: 16px;
            }
            .qr-container { 
              margin: 10px auto; 
              padding: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .expiry {
              background: #fff3cd;
              color: #856404;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              margin: 10px auto 15px auto;
            }
            .url { 
              font-size: 11px; 
              color: #777; 
              word-break: break-all;
              margin-top: 5px;
            }
            @media print {
              body { 
                background-color: #fff; 
                padding: 0;
                justify-content: center;
              }
              .ticket { 
                border: none;
                box-shadow: none;
                width: 100%;
                padding: 0;
              }
              .qr-container {
                border: none;
                padding: 0;
              }
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="logo">ตี๋อบ วาฟเฟิล</div>
            <div class="shop-name">HongKong Waffle</div>
            
            <div class="divider"></div>
            
            <h2>${tableNo.startsWith('หน้าร้าน') ? `สั่งกลับบ้าน (${tableNo})` : `โต๊ะ ${tableNo}`}</h2>
            <p>สแกน QR Code เพื่อสั่งอาหาร</p>
            
            <div class="qr-container" id="qr-code"></div>
            
            <div style="text-align: center; width: 100%;">
              <div class="expiry">หมดเวลา: ${formattedTime}</div>
            </div>
            
            <p class="url">${qrUrl}</p>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("qr-code"), {
              text: "${qrUrl}",
              width: 220,
              height: 220,
              colorDark : "#000000",
              colorLight : "#ffffff",
              correctLevel : QRCode.CorrectLevel.H
            });
            setTimeout(() => { window.print(); window.close(); }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <BackofficeLayout role="cashier">
      <div className="table-manager-container">
        <div className="tm-header">
        <h1><FaQrcode /> จัดการโต๊ะและ QR Code</h1>
        <p>สร้าง QR Code สำหรับให้ลูกค้าสั่งอาหารที่โต๊ะ</p>
      </div>

      <div className="tm-content">
        <div className="tm-left-panel">
          <div className="tm-card generate-card">
            <h2>สร้าง QR Code ใหม่</h2>
            
            {error && <div className="tm-alert error"><FaTimesCircle /> {error}</div>}
            {success && <div className="tm-alert success"><FaCheckCircle /> {success}</div>}
            
            <form onSubmit={handleGenerate} className="tm-form">
              <div className="form-group qr-type-group">
                <label>ประเภท QR Code</label>
                <div className="radio-group" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      value="dine-in" 
                      checked={qrType === 'dine-in'} 
                      onChange={(e) => setQrType(e.target.value)} 
                    />
                    ทานที่ร้าน (Dine-in)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      value="takeaway" 
                      checked={qrType === 'takeaway'} 
                      onChange={(e) => setQrType(e.target.value)} 
                    />
                    หน้าร้าน (Takeaway)
                  </label>
                </div>
              </div>

              {qrType === 'dine-in' && (
                <div className="form-group">
                  <label>หมายเลขโต๊ะ</label>
                  <input 
                    type="number" 
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    placeholder="ใส่เฉพาะตัวเลข เช่น 1, 2, 3"
                    autoFocus
                    min="1"
                  />
                </div>
              )}
              <div className="form-group">
                <label>ระยะเวลา (ชั่วโมง)</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="1">1 ชั่วโมง</option>
                  <option value="2">2 ชั่วโมง</option>
                  <option value="3">3 ชั่วโมง</option>
                  <option value="4">4 ชั่วโมง</option>
                  <option value="custom">กำหนดเอง...</option>
                </select>
                {duration === 'custom' && (
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1" 
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="เช่น 1.5 หรือ 0.5"
                    style={{ marginTop: '10px' }}
                  />
                )}
              </div>
              <button type="submit" className="tm-btn-primary" disabled={loading}>
                {loading ? 'กำลังสร้าง...' : <><FaPlus /> สร้าง QR Code</>}
              </button>
            </form>
          </div>
        </div>

        <div className="tm-right-panel">
          <div className="tm-card active-sessions-card">
            <h2>โต๊ะที่เปิดอยู่ตอนนี้ ({sessions.filter(s => !s.table_no.startsWith('หน้าร้าน')).length})</h2>
            
            {sessions.filter(s => !s.table_no.startsWith('หน้าร้าน')).length === 0 ? (
              <div className="tm-empty-state">
                <p>ยังไม่มีโต๊ะที่เปิดใช้งานในขณะนี้</p>
              </div>
            ) : (
              <div className="tm-sessions-grid">
                {sessions.filter(s => !s.table_no.startsWith('หน้าร้าน')).map(session => {
                  const isExpiringSoon = (new Date(session.expires_at) - new Date()) < 30 * 60 * 1000;
                  return (
                    <div key={session.session_id} className={`tm-session-item ${isExpiringSoon ? 'expiring' : ''}`}>
                      <div className="session-header">
                        <h3>โต๊ะ {session.table_no}</h3>
                        <span className="time-badge">หมดเวลา {formatTime(session.expires_at)}</span>
                      </div>
                      <div className="qr-preview">
                        <QRCodeSVG value={`http://localhost:5173/?session=${session.session_id}`} size={120} />
                      </div>
                      <div className="session-actions" style={{ flexWrap: 'wrap' }}>
                        <button className="tm-btn-print" onClick={() => setViewSession(session)}>
                          <FaEye /> ดู QR
                        </button>
                        <button className="tm-btn-print" onClick={() => handlePrint(session.session_id, session.table_no, session.expires_at)}>
                          <FaPrint /> พิมพ์
                        </button>
                        <button className="tm-btn-danger" onClick={() => handleEndSession(session.session_id, session.table_no)} style={{ flexBasis: '100%' }}>
                          <FaTrashAlt /> ปิดโต๊ะ
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h2 style={{marginTop: '32px'}}>คิวหน้าร้านที่รอสั่ง ({sessions.filter(s => s.table_no.startsWith('หน้าร้าน')).length})</h2>
            {sessions.filter(s => s.table_no.startsWith('หน้าร้าน')).length === 0 ? (
              <div className="tm-empty-state">
                <p>ยังไม่มีคิวหน้าร้านในขณะนี้</p>
              </div>
            ) : (
              <div className="tm-sessions-grid">
                {sessions.filter(s => s.table_no.startsWith('หน้าร้าน')).map(session => {
                  const isExpiringSoon = (new Date(session.expires_at) - new Date()) < 30 * 60 * 1000;
                  return (
                    <div key={session.session_id} className={`tm-session-item ${isExpiringSoon ? 'expiring' : ''}`}>
                      <div className="session-header">
                        <h3>{session.table_no}</h3>
                        <span className="time-badge">หมดเวลา {formatTime(session.expires_at)}</span>
                      </div>
                      <div className="qr-preview">
                        <QRCodeSVG value={`http://localhost:5173/?session=${session.session_id}`} size={120} />
                      </div>
                      <div className="session-actions" style={{ flexWrap: 'wrap' }}>
                        <button className="tm-btn-print" onClick={() => setViewSession(session)}>
                          <FaEye /> ดู QR
                        </button>
                        <button className="tm-btn-print" onClick={() => handlePrint(session.session_id, session.table_no, session.expires_at)}>
                          <FaPrint /> พิมพ์
                        </button>
                        <button className="tm-btn-danger" onClick={() => handleEndSession(session.session_id, session.table_no)} style={{ flexBasis: '100%' }}>
                          <FaTrashAlt /> ยกเลิกคิว
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewSession && (
        <div className="tm-modal-overlay" onClick={() => setViewSession(null)}>
          <div className="tm-modal" onClick={e => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2>สแกนสั่งอาหาร โต๊ะ {viewSession.table_no}</h2>
              <button className="tm-close-btn" onClick={() => setViewSession(null)}><FaTimesCircle /></button>
            </div>
            <div className="tm-modal-body">
              <QRCodeSVG value={`http://localhost:5173/?session=${viewSession.session_id}`} size={300} level="H" />
              <p className="tm-modal-url">หมดเวลา: {formatTime(viewSession.expires_at)}</p>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn-primary" onClick={() => {
                handlePrint(viewSession.session_id, viewSession.table_no, viewSession.expires_at);
                setViewSession(null);
              }}>
                <FaPrint /> พิมพ์คิวอาร์โค้ด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm End Session Modal */}
      {confirmModal.show && (
        <div className="tm-modal-overlay" onClick={() => setConfirmModal({ show: false, sessionId: null, tableNo: null })}>
          <div className="tm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
            <div className="tm-modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <h2 style={{ fontSize: '18px', color: '#1f2937' }}>ยืนยันการปิดโต๊ะ</h2>
              <button className="tm-close-btn" onClick={() => setConfirmModal({ show: false, sessionId: null, tableNo: null })}><FaTimesCircle /></button>
            </div>
            <div className="tm-modal-body" style={{ textAlign: 'center', paddingTop: '20px', paddingBottom: '30px' }}>
              <p style={{ color: '#4b5563', fontSize: '16px', margin: 0 }}>
                คุณแน่ใจหรือไม่ที่จะปิด <strong>โต๊ะ {confirmModal.tableNo}</strong> ?
              </p>
            </div>
            <div className="tm-modal-footer" style={{ borderTop: 'none', display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: 0 }}>
              <button 
                onClick={() => setConfirmModal({ show: false, sessionId: null, tableNo: null })}
                style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#374151', flex: 1 }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmEndSession}
                style={{ padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}
              >
                ยืนยันปิดโต๊ะ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </BackofficeLayout>
  );
}
