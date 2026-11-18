import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Courses from './components/Courses';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '', student_id: '' });
  const [authError, setAuthError] = useState('');

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [coursesCount, setCoursesCount] = useState(0);

  // Expense State
  const [transactions, setTransactions] = useState([]);
  const [txnForm, setTxnForm] = useState({ type: 'expense', category: 'Food', amount: '', note: '' });
  const [monthlyBudget, setMonthlyBudget] = useState(10000);

  // CGPA Planner State
  const [targetCgpa, setTargetCgpa] = useState('');
  const [nextCredits, setNextCredits] = useState('');
  const [requiredGpa, setRequiredGpa] = useState(null);

  // Learning Hub Active Lesson
  const [activeLesson, setActiveLesson] = useState(null);

  // Fetch Courses Count
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/api/courses')
        .then(res => res.data && setCoursesCount(res.data.courses ? res.data.courses.length : 0))
        .catch(err => console.error(err));
    }
  }, [activeTab, token]);

  // Auth Handlers
  const handleAuthChange = (e) => setAuthFormData({ ...authFormData, [e.target.name]: e.target.value });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, authFormData);
      const data = response.data;
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { name: authFormData.name || 'Student' }));
        setToken(data.token);
        setUser(data.user || { name: authFormData.name || 'Student' });
      }
    } catch (err) {
      // Demo Fallback for Front-End testing without Backend
      const mockUser = { name: authFormData.name || 'Shishir Ahmed', student_id: authFormData.student_id || '2022100000035' };
      localStorage.setItem('token', 'demo-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken('demo-token-123');
      setUser(mockUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  // Expense Handlers
  const handleAddTxn = (e) => {
    e.preventDefault();
    if (!txnForm.amount) return;
    setTransactions([{ ...txnForm, id: Date.now(), amount: parseFloat(txnForm.amount), date: new Date().toLocaleDateString() }, ...transactions]);
    setTxnForm({ type: 'expense', category: 'Food', amount: '', note: '' });
  };

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const budgetUsedPercent = Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100);

  // CGPA Target Calculator
  const handleCalculateTarget = (e) => {
    e.preventDefault();
    const currentCgpa = 3.17;
    const doneCredits = 90;
    const target = parseFloat(targetCgpa);
    const nextCred = parseFloat(nextCredits);

    if (target && nextCred) {
      const req = (target * (doneCredits + nextCred) - (doneCredits * currentCgpa)) / nextCred;
      if (req > 4.0) setRequiredGpa("এক সেমিস্টারে অর্জন সম্ভব নয় (> 4.00)");
      else if (req <= 0) setRequiredGpa("লক্ষ্য ইতিমধ্যে অর্জিত হয়েছে!");
      else setRequiredGpa(req.toFixed(2));
    }
  };

  // Chatbot Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply || 'ধন্যবাদ আপনার প্রশ্ন করার জন্য।' }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: ` StudyLedger Assistant: "${userMsg}" প্রশ্নের উত্তর হিসেবে আপনার আজকের রুটিন ও স্টাডি গোল রিভাইজ করার পরামর্শ দেওয়া হলো।` 
      }]);
    }
  };

  // ----------------------------------------------------
  // LOGIN / REGISTER SCREEN (If NOT Logged In)
  // ----------------------------------------------------
  if (!token) {
    return (
      <div style={{
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .auth-card {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .input-field {
            transition: all 0.3s ease;
          }
          .input-field:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
          .btn-hover {
            transition: all 0.3s ease;
          }
          .btn-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
        `}</style>
        
        <div className="auth-card" style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '48px', display: 'inline-block', marginBottom: '10px' }}>🎓</span>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '26px', fontWeight: '700' }}>StudyLedger Portal</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
              {isRegistering ? 'আপনার অ্যাকাউন্ট তৈরি করুন' : 'আপনার অ্যাকাউন্টে লগইন করুন'}
            </p>
          </div>

          {authError && (
            <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={authFormData.name}
                  onChange={handleAuthChange}
                  className="input-field"
                  required
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
                <input
                  type="text"
                  name="student_id"
                  placeholder="Student ID (e.g., 2022100000035)"
                  value={authFormData.student_id}
                  onChange={handleAuthChange}
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={authFormData.email}
              onChange={handleAuthChange}
              className="input-field"
              required
              style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={authFormData.password}
              onChange={handleAuthChange}
              className="input-field"
              required
              style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />

            <button
              type="submit"
              className="btn-hover"
              style={{ width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
              {isRegistering ? 'আগে থেকেই অ্যাকাউন্ট আছে?' : 'নতুন অ্যাকাউন্ট তৈরি করতে চান?'}
              <span
                onClick={() => setIsRegistering(!isRegistering)}
                style={{ color: '#3b82f6', cursor: 'pointer', marginLeft: '6px', fontWeight: '600' }}
              >
                {isRegistering ? 'Login' : 'Register'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL MAIN DASHBOARD (When Logged In)
  // ----------------------------------------------------
  return (
    <div style={{ fontFamily: "'Segoe UI', Roboto, sans-serif", margin: 0, padding: 0, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Dynamic CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-section {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-btn {
          transition: all 0.25s ease;
        }
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Navbar */}
      <header style={{ background: '#1e293b', color: '#fff', padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px' }}>🎓</span>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>StudyLedger</h1>
        </div>

        <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'expenses', label: '💰 Expenses' },
            { id: 'cgpa', label: '📈 CGPA' },
            { id: 'attendance', label: '📋 Attendance' },
            { id: 'courses', label: '📚 Courses' },
            { id: 'chat', label: '🤖 AI Chatbot' },
            { id: 'hub', label: '💡 Learning Hub' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="nav-btn"
              style={{
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>👤 {user ? user.name : 'Student'}</span>
          <button
            onClick={handleLogout}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="animated-section">
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)', color: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(59,130,246,0.15)', marginBottom: '30px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '26px' }}>স্বাগতম, {user ? user.name : 'Student'}! 👋</h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>আপনার একাডেমিক ক্যারিয়ার, লেসন ট্র্যাকিং ও বাজেট এক পলকে দেখে নিন।</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="card-hover" style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>CURRENT CGPA</span>
                <h3 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#0f172a' }}>3.17 / 4.00</h3>
              </div>
              <div className="card-hover" style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #10b981', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>THIS MONTH BALANCE</span>
                <h3 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#10b981' }}>৳ {totalIncome - totalExpense}</h3>
              </div>
              <div className="card-hover" style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #f59e0b', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>BUDGET USED</span>
                <h3 style={{ fontSize: '28px', margin: '8px 0 0 0', color: '#f59e0b' }}>{budgetUsedPercent}%</h3>
              </div>
              <div className="card-hover" style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ATTENDANCE ALERT</span>
                <h3 style={{ fontSize: '20px', margin: '12px 0 0 0', color: '#ef4444' }}>Algorithms (68%)</h3>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '16px' }}>কুইক অ্যাকশন নেভিগেশন</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { title: '💰 আয়-ব্যয় ট্র্যাকার', desc: 'দৈনন্দিন মেস ও পড়াশোনার বাজেট ট্র্যাকিং', tab: 'expenses' },
                { title: '📈 সিজিপিএ ক্যালকুলেটর', desc: 'টার্গেট জিপিএ এবং সেমিস্টার রেজাল্ট অ্যানালাইসিস', tab: 'cgpa' },
                { title: '📋 উপস্থিতি ও মার্কস', desc: 'ক্লাস অ্যাটেন্ডেন্স ও সেমিস্টার মিড-কুইজ ট্র্যাকার', tab: 'attendance' },
                { title: '💡 লার্নিং হাব (Learning Hub)', desc: 'C++, Java, MySQL প্র্যাকটিস টিপস ও লেসন', tab: 'hub' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab(item.tab)}
                  className="card-hover"
                  style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>{item.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. EXPENSE & BUDGET TRACKER */}
        {activeTab === 'expenses' && (
          <div className="animated-section">
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>💰 Expense & Budget Tracker</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              
              {/* Add Expense Form */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>নতুন ট্রানজেকশন যুক্ত করুন</h3>
                <form onSubmit={handleAddTxn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <select
                    value={txnForm.type}
                    onChange={e => setTxnForm({ ...txnForm, type: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="expense">Expense (ব্যয়)</option>
                    <option value="income">Income (আয়)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Category (e.g. Food, Tuition)"
                    value={txnForm.category}
                    onChange={e => setTxnForm({ ...txnForm, category: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="number"
                    placeholder="Amount (Tk)"
                    value={txnForm.amount}
                    onChange={e => setTxnForm({ ...txnForm, amount: e.target.value })}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <button type="submit" style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    Save Transaction
                  </button>
                </form>
              </div>

              {/* Transactions List */}
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>সাম্প্রতিক ট্রানজেকশন সমূহ</h3>
                {transactions.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '40px' }}>এখনও কোনো লেনদেন যোগ করা হয়নি।</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Type</th>
                        <th style={{ padding: '10px' }}>Category</th>
                        <th style={{ padding: '10px' }}>Amount</th>
                        <th style={{ padding: '10px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', color: t.type === 'income' ? '#10b981' : '#ef4444', fontWeight: '600' }}>{t.type}</td>
                          <td style={{ padding: '10px' }}>{t.category}</td>
                          <td style={{ padding: '10px' }}>৳ {t.amount}</td>
                          <td style={{ padding: '10px', color: '#64748b', fontSize: '13px' }}>{t.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. CGPA CALCULATOR */}
        {activeTab === 'cgpa' && (
          <div className="animated-section">
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>📈 CGPA & Target Planner</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>টার্গেট সিজিপিএ প্ল্যানার</h3>
                <form onSubmit={handleCalculateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>বর্তমান CGPA: <strong>3.17</strong> (Completed Credits: 90)</p>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Desired Target CGPA (e.g. 3.40)"
                    value={targetCgpa}
                    onChange={e => setTargetCgpa(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="number"
                    placeholder="Next Semester Credits (e.g. 15)"
                    value={nextCredits}
                    onChange={e => setNextCredits(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <button type="submit" style={{ padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                    Calculate Required GPA
                  </button>
                </form>

                {requiredGpa && (
                  <div style={{ marginTop: '20px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <h4 style={{ margin: 0, color: '#1e40af' }}>প্রয়োজনীয় পরবর্তী GPA: {requiredGpa}</h4>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>SEU Grading Scale</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Marks</th>
                      <th style={{ padding: '8px' }}>Grade</th>
                      <th style={{ padding: '8px' }}>Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[['80%+', 'A+', '4.00'], ['75%-79%', 'A', '3.75'], ['70%-74%', 'A-', '3.50'], ['65%-69%', 'B+', '3.25'], ['60%-64%', 'B', '3.00']].map(([m, g, p], idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px' }}>{m}</td>
                        <td style={{ padding: '8px', fontWeight: '600' }}>{g}</td>
                        <td style={{ padding: '8px' }}>{p}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. ATTENDANCE & MARKS TRACKER */}
        {activeTab === 'attendance' && (
          <div className="animated-section">
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>📋 Attendance & Marks Tracker</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { code: 'CSE-311', name: 'Compiler Design', total: 20, present: 18, pct: 90 },
                { code: 'CSE-312', name: 'Software Engineering', total: 18, present: 15, pct: 83 },
                { code: 'CSE-472', name: 'Web Programming Lab', total: 15, present: 14, pct: 93 },
                { code: 'CSE-315', name: 'Algorithms', total: 19, present: 13, pct: 68 }
              ].map((c, idx) => (
                <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>{c.code}: {c.name}</h4>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '700',
                      background: c.pct >= 75 ? '#dcfce7' : '#fee2e2',
                      color: c.pct >= 75 ? '#15803d' : '#b91c1c'
                    }}>
                      {c.pct}%
                    </span>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>Attended: {c.present} / {c.total} Classes</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ flex: 1, padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Mark Present</button>
                    <button style={{ flex: 1, padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Mark Absent</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="animated-section">
            <Courses />
          </div>
        )}

        {/* 6. AI STUDY CHATBOT */}
        {activeTab === 'chat' && (
          <div className="animated-section" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginTop: 0, color: '#1e293b', fontSize: '20px' }}>StudyLedger AI Study Assistant</h2>
            <div style={{ border: '1px solid #e2e8f0', height: '360px', overflowY: 'auto', padding: '16px', marginBottom: '16px', borderRadius: '8px', background: '#f8fafc' }}>
              {messages.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '140px' }}>আপনার পড়ার বিষয় বা কোর্স সম্পর্কিত যেকোনো প্রশ্ন করতে পারেন...</p>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      background: m.sender === 'user' ? '#3b82f6' : '#e2e8f0',
                      color: m.sender === 'user' ? '#fff' : '#1e293b',
                      fontSize: '14px',
                      maxWidth: '75%'
                    }}>
                      {m.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="আপনার প্রশ্ন এখানে লিখুন..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <button type="submit" style={{ padding: '12px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Send</button>
            </form>
          </div>
        )}

        {/* 7. LEARNING HUB */}
        {activeTab === 'hub' && (
          <div className="animated-section">
            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>💡 Learning Hub</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { title: 'C++ Programming', icon: '⚡', desc: 'Pointers, Memory, OOP Basics', lessons: ['Hello World & I/O', 'Pointers & References', 'OOP Concepts'] },
                { title: 'Java Core', icon: '☕', desc: 'Classes, Objects, Polymorphism', lessons: ['JVM & Main Method', 'Inheritance & Interfaces', 'Exception Handling'] },
                { title: 'MySQL Relational DB', icon: '🐬', desc: 'Queries, JOINs & Schema Design', lessons: ['Basic CRUD Queries', 'INNER & LEFT JOINs', 'Database Indexing'] }
              ].map((topic, idx) => (
                <div key={idx} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '36px' }}>{topic.icon}</span>
                  <h3 style={{ margin: '12px 0 6px 0', color: '#1e293b' }}>{topic.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>{topic.desc}</p>
                  
                  <h4 style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Lessons List</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#3b82f6', fontSize: '14px', cursor: 'pointer' }}>
                    {topic.lessons.map((les, lIdx) => (
                      <li key={lIdx} onClick={() => setActiveLesson(les)} style={{ marginBottom: '6px' }}>{les}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {activeLesson && (
              <div style={{ marginTop: '30px', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>📖 Active Lesson: {activeLesson}</h3>
                <p style={{ color: '#475569', lineHeight: '1.6' }}>
                  এখানে নির্দিষ্ট লেসনের ডিটেইলস, কোড স্নিপেট এবং প্র্যাকটিস প্রবলেম থাকবে। টিপস: সমস্যা সমাধান করতে বেশি বেশি প্র্যাকটিস করুন।
                </p>
                <button onClick={() => setActiveLesson(null)} style={{ padding: '6px 14px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close Lesson</button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;