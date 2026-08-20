import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

import { API_BASE } from '../../utils/api';

const MACHINES = [
  { id: 1, label: 'เครื่องที่ 1' },
  { id: 2, label: 'เครื่องที่ 2' },
  { id: 3, label: 'เครื่องที่ 3' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('login'); // 'login' | 'machine'
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอก username และ password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'เข้าสู่ระบบล้มเหลว');
        return;
      }

      setLoggedInUser(data.user);
      // Save JWT token for future API calls
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      setStep('machine');
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMachine = (machineId) => {
    setSelectedMachine(machineId);
  };

  const handleConfirmMachine = () => {
    if (!selectedMachine) {
      setError('กรุณาเลือกเครื่องที่จะใช้งาน');
      return;
    }

    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    localStorage.setItem('posMachineId', selectedMachine.toString());

    // Redirect based on role
    if (loggedInUser.Role_id === 'R01') navigate('/admin');
    else if (loggedInUser.Role_id === 'R02') navigate('/cashier/orders');
    else if (loggedInUser.Role_id === 'R03') navigate('/kitchen');
    else navigate('/cashier/orders');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Brand Header */}
        <div className="login-brand">
          <h1 className="login-brand-title">ตี๋อบ วาฟเฟิล HongKong</h1>
        </div>

        {step === 'login' ? (
          /* Login Form */
          <form className="login-form" onSubmit={handleLogin}>
            <h2 className="login-form-title">เข้าสู่ระบบพนักงาน</h2>

            {error && (
              <div className="login-error">
                <span>{error}</span>
              </div>
            )}

            <div className="login-input-group">
              <input
                id="login-username"
                type="text"
                placeholder="ชื่อผู้ใช้ (Username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="login-input-group password-group">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="รหัสผ่าน (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        ) : (
          /* Machine Selection */
          <div className="login-machine-section">
            <h2 className="login-form-title">เลือกเครื่อง POS</h2>
            <p className="login-machine-subtitle">
              สวัสดี, <strong>{loggedInUser?.firstname}</strong>
            </p>

            {error && (
              <div className="login-error">
                <span>{error}</span>
              </div>
            )}

            <div className="login-machine-grid">
              {MACHINES.map((machine) => (
                <button
                  key={machine.id}
                  className={`login-machine-card ${selectedMachine === machine.id ? 'selected' : ''}`}
                  onClick={() => handleSelectMachine(machine.id)}
                  type="button"
                >
                  <span className="login-machine-label">{machine.label}</span>
                </button>
              ))}
            </div>

            <div className="login-machine-actions">
              <button
                type="button"
                className="login-btn-secondary"
                onClick={() => {
                  setStep('login');
                  setError('');
                  setSelectedMachine(null);
                }}
              >
                ย้อนกลับ
              </button>
              <button
                id="login-confirm-machine-btn"
                type="button"
                className="login-btn"
                onClick={handleConfirmMachine}
              >
                เริ่มใช้งาน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
