import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import Courses from './components/Courses';

function App() {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // User-Specific Storage Keys Implementation
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const userEmailKey = currentUser.email ? currentUser.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
  const STORAGE_KEY_CGPA = `user_cgpa_${userEmailKey}`;
  const STORAGE_KEY_TRANSACTIONS = `user_transactions_${userEmailKey}`;
  const STORAGE_KEY_BUDGET = `user_budget_${userEmailKey}`;

  // App & Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [coursesCount, setCoursesCount] = useState(0);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Expense State & Dynamic User-Specific Storage Integration
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });
  const [txnForm, setTxnForm] = useState({ type: 'expense', category: 'Food', amount: '', note: '' });
  
  // User-specific Monthly Budget & Manual Balance State
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
    return saved ? JSON.parse(saved) : { budget: 10000, initialBalance: 0 };
  });

  const handleUpdateBudget = (newBudgetData) => {
    setMonthlyBudget(newBudgetData);
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(newBudgetData));
  };

  // CGPA Planner State & Dynamic User-Specific Storage Integration
  const [cgpaData, setCgpaData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CGPA);
    return saved ? JSON.parse(saved) : { cgpa: '3.17', totalCredits: '90' };
  });

  const handleUpdateCgpa = (newData) => {
    setCgpaData(newData);
    localStorage.setItem(STORAGE_KEY_CGPA, JSON.stringify(newData));
  };

  const [targetCgpa, setTargetCgpa] = useState('');
  const [nextCredits, setNextCredits] = useState('');
  const [requiredGpa, setRequiredGpa] = useState(null);

  // Learning Hub Active Lesson
  const [activeLesson, setActiveLesson] = useState(null);

  // Todo / Task List State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Prepare for Midterm Examination (Dec 01 - 08)', completed: false },
    { id: 2, text: 'Complete Web Programming Lab assignment', completed: true }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // SEU Official Academic Calendar Notices State
  const [notices, setNotices] = useState([
    { id: 1, title: 'Midterm Examination (8 Days)', date: 'Dec 01 - 08, 2026', type: 'exam' },
    { id: 2, title: 'Victory Day (Holiday)', date: 'Dec 16, 2026', type: 'holiday' },
    { id: 3, title: 'Pre-registration for Spring Semester 2027', date: 'Dec 29 - 31, 2026', type: 'registration' },
    { id: 4, title: 'Last Date of Classes (UG-Regular)', date: 'Jan 14, 2027', type: 'deadline' },
    { id: 5, title: 'Final Examination (8 Days)', date: 'Jan 17 - 24, 2027', type: 'exam' },
    { id: 6, title: 'Classes begin of Spring 2027', date: 'Feb 03, 2027', type: 'start' }
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDate, setNewNoticeDate] = useState('');

  // Sync LocalStorage for Transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle Browser History (Back Button Support)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({ tab: tabId }, '', `#${tabId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    showToast('লগআউট করা হয়েছে।');
  };

  // Expense Handler
  const handleAddTxn = (e) => {
    e.preventDefault();
    if (!txnForm.amount) return;
    setTransactions([{ ...txnForm, id: Date.now(), amount: parseFloat(txnForm.amount), date: new Date().toLocaleDateString() }, ...transactions]);
    setTxnForm({ type: 'expense', category: 'Food', amount: '', note: '' });
    showToast('ট্রানজ্যাকশন সফলভাবে সেভ হয়েছে!');
  };

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = (parseFloat(monthlyBudget.initialBalance) || 0) + totalIncome - totalExpense;
  const budgetLimit = parseFloat(monthlyBudget.budget) || 10000;
  const budgetUsedPercent = Math.min(Math.round((totalExpense / budgetLimit) * 100), 100);

  // CGPA Target Calculator
  const handleCalculateTarget = (e) => {
    e.preventDefault();
    const currentCgpa = parseFloat(cgpaData.cgpa) || 3.17;
    const doneCredits = parseFloat(cgpaData.totalCredits) || 90;
    const target = parseFloat(targetCgpa);
    const nextCred = parseFloat(nextCredits);

    if (target && nextCred) {
      const req = (target * (doneCredits + nextCred) - (doneCredits * currentCgpa)) / nextCred;
      if (req > 4.0) setRequiredGpa("GPA requirement exceeds 4.00");
      else if (req <= 0) setRequiredGpa("Target already achieved!");
      else setRequiredGpa(req.toFixed(2));
      showToast('সিজিপিএ ক্যালকুলেশন সম্পন্ন হয়েছে।');
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
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply || 'Thank you.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: `Control AI Assistant: "${userMsg}" - সিস্টেম স্বাভাবিক রয়েছে।` }]);
    }
  };

  // Theme Object
  const t = {
    bg: theme === 'dark' ? '#09090b' : '#f8fafc',
    cardBg: theme === 'dark' ? '#121216' : '#ffffff',
    text: theme === 'dark' ? '#f4f4f5' : '#0f172a',
    subText: theme === 'dark' ? '#a1a1aa' : '#64748b',
    border: theme === 'dark' ? '#27272a' : '#e2e8f0',
    headerBg: theme === 'dark' ? '#121216' : '#ffffff',
  };

  // If not logged in, show Auth Component
  if (!token) {
    return <Auth setToken={setToken} setUser={setUser} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif", margin: 0, padding: 0, background: t.bg, minHeight: '100vh', color: t.text, transition: 'background 0.3s, color 0.3s' }}>
      
      <style>{`
        .nav-btn { transition: all 0.25s ease; cursor: pointer; }
        .nav-btn:hover { background: rgba(249, 115, 22, 0.15) !important; color: #f97316 !important; }
        .card-hover { transition: all 0.3s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(249, 115, 22, 0.5) !important; box-shadow: 0 10px 30px -10px rgba(249, 115, 22, 0.2); }
        .back-btn { background: #27272a; color: #fff; border: 1px solid #3f3f46; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; transition: 0.2s; }
        .back-btn:hover { background: #3f3f46; }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', right: '25px', zIndex: 99999, background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', padding: '14px 24px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* Header Navbar */}
      <header style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: t.text }}>Control AI Policy</h1>
        </div>

        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
              onClick={() => changeTab(tab.id)}
              className="nav-btn"
              style={{
                background: activeTab === tab.id ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                color: activeTab === tab.id ? '#f97316' : t.subText,
                border: activeTab === tab.id ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                fontSize: '13px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ background: t.border, color: t.text, border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <span style={{ fontSize: '13px', color: t.text }}>👤 {user ? user.name : 'Zim'}</span>
          <button
            onClick={handleLogout}
            style={{ background: t.border, color: '#f87171', border: '1px solid #3f3f46', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ padding: '30px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              
              {/* Orange Gradient Corner Shadow Banner */}
              <div style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' : 'linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)', border: '1px solid rgba(249, 115, 22, 0.4)', color: t.text, padding: '30px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Welcome back, {user ? user.name : 'Zim'}! ⚡</h2>
                <p style={{ margin: 0, color: t.subText, fontSize: '14px' }}>Southeast University • B.Sc. in Computer Science & Engineering (4th Year)</p>
              </div>

              {/* Clickable Summary Cards with Orange Glow */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                <div onClick={() => changeTab('cgpa')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #f97316' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>CURRENT CGPA (Click to View)</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: t.text }}>{cgpaData.cgpa} <span style={{ fontSize: '14px', color: t.subText }}>/ 4.00</span></h3>
                </div>

                <div onClick={() => changeTab('expenses')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #10b981' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>THIS MONTH BALANCE (Click to Track)</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#10b981' }}>৳ {currentBalance}</h3>
                </div>

                <div onClick={() => changeTab('expenses')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #f97316' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>BUDGET USED</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#f97316' }}>{budgetUsedPercent}%</h3>
                </div>

                <div onClick={() => changeTab('courses')} className="card-hover" style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}`, borderLeft: '4px solid #ef4444' }}>
                  <span style={{ color: t.subText, fontSize: '12px', fontWeight: '600' }}>TOTAL COURSES (Click to Manage)</span>
                  <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#ef4444' }}>{coursesCount}</h3>
                </div>

              </div>

              {/* MODULES: Daily Tasks & SEU Official Academic Calendar with Orange Theme & High-Level Animations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Module 1: Daily Study & Coding Task Manager */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ background: t.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${t.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: t.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span> Today's Study & Coding Tasks
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Add new task..." 
                      value={newTaskText} 
                      onChange={e => setNewTaskText(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#f97316'}
                      onBlur={(e) => e.target.style.borderColor = t.border}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if(!newTaskText.trim()) return;
                        setTasks([{ id: Date.now(), text: newTaskText, completed: false }, ...tasks]);
                        setNewTaskText('');
                        showToast('Task added successfully!');
                      }}
                      style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
                    >
                      Add
                    </motion.button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                    <AnimatePresence>
                      {tasks.map(task => (
                        <motion.div 
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 50, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.border}` }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                              type="checkbox" 
                              checked={task.completed} 
                              onChange={() => {
                                setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                              }}
                              style={{ cursor: 'pointer', accentColor: '#f97316', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontSize: '13px', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? t.subText : t.text, transition: 'color 0.2s' }}>
                              {task.text}
                            </span>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                            style={{ background: 'none', border: 'none', color: t.subText, cursor: 'pointer', fontSize: '15px', padding: '4px' }}
                          >
                            ✕
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Module 2: SEU Official Academic Calendar & Deadlines */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  style={{ background: t.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${t.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: t.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📅</span> SEU Academic Calendar (Dec - Feb)
                    </h3>
                  </div>

                  {/* Add Custom Notice Input */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexDirection: 'column' }}>
                    <input 
                      type="text" 
                      placeholder="Event Title (e.g. Extra Class)" 
                      value={newNoticeTitle} 
                      onChange={e => setNewNoticeTitle(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = '#f97316'}
                      onBlur={(e) => e.target.style.borderColor = t.border}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Date (e.g. Dec 10, 2026)" 
                        value={newNoticeDate} 
                        onChange={e => setNewNoticeDate(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '12px', outline: 'none' }}
                        onFocus={(e) => e.target.style.borderColor = '#f97316'}
                        onBlur={(e) => e.target.style.borderColor = t.border}
                      />
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if(!newNoticeTitle.trim() || !newNoticeDate.trim()) return;
                          setNotices([{ id: Date.now(), title: newNoticeTitle, date: newNoticeDate }, ...notices]);
                          setNewNoticeTitle('');
                          setNewNoticeDate('');
                          showToast('Academic event added!');
                        }}
                        style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}
                      >
                        Add Event
                      </motion.button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '190px', overflowY: 'auto', paddingRight: '4px' }}>
                    <AnimatePresence>
                      {notices.map(notice => (
                        <motion.div 
                          key={notice.id}
                          layout
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: t.bg, borderRadius: '10px', borderLeft: '4px solid #f97316', border: `1px solid ${t.border}` }}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: t.text, fontWeight: '600' }}>{notice.title}</h4>
                            <p style={{ margin: 0, fontSize: '11px', color: t.subText }}>{notice.date}</p>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => setNotices(notices.filter(n => n.id !== notice.id))}
                            style={{ background: 'none', border: 'none', color: t.subText, cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                          >
                            ✕
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

              </div>

            </motion.div>
          )}

          {/* 2. EXPENSES */}
          {activeTab === 'expenses' && (
            <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>💰 Expense & Budget Tracker</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Left Column: Manual Budget/Balance & Add Transaction Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Manual Budget & Balance Update Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Manage Budget & Initial Balance</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const bVal = e.target.budgetInput.value;
                      const balVal = e.target.balanceInput.value;
                      handleUpdateBudget({ budget: bVal || 10000, initialBalance: balVal || 0 });
                      showToast('বাজেট এবং ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!');
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ fontSize: '12px', color: t.subText }}>Monthly Budget Limit (Tk)</label>
                      <input type="number" name="budgetInput" defaultValue={monthlyBudget.budget} placeholder="Monthly Budget (e.g. 10000)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} required />
                      
                      <label style={{ fontSize: '12px', color: t.subText }}>Initial / Starting Cash Balance (Tk)</label>
                      <input type="number" name="balanceInput" defaultValue={monthlyBudget.initialBalance} placeholder="Initial Balance (e.g. 5000)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      
                      <button type="submit" style={{ padding: '10px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Settings</button>
                    </form>
                  </div>

                  {/* Add New Transaction Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Add New Transaction</h3>
                    <form onSubmit={handleAddTxn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <select value={txnForm.type} onChange={e => setTxnForm({ ...txnForm, type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                      <input type="text" placeholder="Category (e.g. Food, Tuition)" value={txnForm.category} onChange={e => setTxnForm({ ...txnForm, category: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <input type="number" placeholder="Amount (Tk)" value={txnForm.amount} onChange={e => setTxnForm({ ...txnForm, amount: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <button type="submit" style={{ padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Transaction</button>
                    </form>
                  </div>

                </div>

                {/* Right Column: Recent Transactions Table */}
                <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', color: t.text }}>Recent Transactions</h3>
                    <span style={{ fontSize: '13px', color: t.subText }}>Current Balance: <strong style={{ color: '#10b981' }}>৳ {currentBalance}</strong></span>
                  </div>
                  {transactions.length === 0 ? <p style={{ color: t.subText, textAlign: 'center', marginTop: '100px' }}>No transactions added yet.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: t.text }}>
                      <thead><tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}><th style={{ padding: '10px' }}>Type</th><th style={{ padding: '10px' }}>Category</th><th style={{ padding: '10px' }}>Amount</th><th style={{ padding: '10px' }}>Date</th></tr></thead>
                      <tbody>
                        {transactions.map(tr => (
                          <tr key={tr.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                            <td style={{ padding: '10px', color: tr.type === 'income' ? '#10b981' : '#ef4444', fontWeight: '600' }}>{tr.type}</td>
                            <td style={{ padding: '10px' }}>{tr.category}</td>
                            <td style={{ padding: '10px' }}>৳ {tr.amount}</td>
                            <td style={{ padding: '10px', color: t.subText, fontSize: '13px' }}>{tr.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* 3. CGPA */}
          {activeTab === 'cgpa' && (
            <motion.div key="cgpa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>📈 CGPA & Target Planner</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Manual CGPA Update Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Update Current CGPA</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newCgpaVal = e.target.manualCgpa.value;
                      const newCredVal = e.target.manualCredits.value;
                      if(newCgpaVal) {
                        handleUpdateCgpa({ cgpa: newCgpaVal, totalCredits: newCredVal || cgpaData.totalCredits });
                        showToast('সিজিপিএ সফলভাবে আপডেট করা হয়েছে!');
                      }
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <input type="number" step="0.01" name="manualCgpa" defaultValue={cgpaData.cgpa} placeholder="Current CGPA (e.g. 3.17)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} required />
                      <input type="number" name="manualCredits" defaultValue={cgpaData.totalCredits} placeholder="Completed Credits (e.g. 90)" style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <button type="submit" style={{ padding: '10px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save CGPA</button>
                    </form>
                  </div>

                  {/* Target CGPA Planner Box */}
                  <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>Target CGPA Planner</h3>
                    <form onSubmit={handleCalculateTarget} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: t.subText }}>Current CGPA: <strong style={{ color: t.text }}>{cgpaData.cgpa}</strong> (Completed Credits: {cgpaData.totalCredits})</p>
                      <input type="number" step="0.01" placeholder="Desired Target CGPA (e.g. 3.40)" value={targetCgpa} onChange={e => setTargetCgpa(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <input type="number" placeholder="Next Semester Credits (e.g. 15)" value={nextCredits} onChange={e => setNextCredits(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                      <button type="submit" style={{ padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Calculate Required GPA</button>
                    </form>
                    {requiredGpa && <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.3)' }}><h4 style={{ margin: 0, color: '#f97316' }}>Required Next GPA: {requiredGpa}</h4></div>}
                  </div>

                </div>

                <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: t.text }}>SEU Grading Scale</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: t.text }}>
                    <thead><tr style={{ background: t.bg, textAlign: 'left', color: t.subText }}><th style={{ padding: '8px' }}>Marks</th><th style={{ padding: '8px' }}>Grade</th><th style={{ padding: '8px' }}>Point</th></tr></thead>
                    <tbody>
                      {[['80%+', 'A+', '4.00'], ['75%-79%', 'A', '3.75'], ['70%-74%', 'A-', '3.50'], ['65%-69%', 'B+', '3.25'], ['60%-64%', 'B', '3.00']].map(([m, g, p], idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${t.border}` }}><td style={{ padding: '8px' }}>{m}</td><td style={{ padding: '8px', fontWeight: '600', color: '#f97316' }}>{g}</td><td style={{ padding: '8px' }}>{p}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. ATTENDANCE */}
          {activeTab === 'attendance' && (
            <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>📋 Attendance & Marks Tracker</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[{ code: 'CSE-311', name: 'Compiler Design', total: 20, present: 18, pct: 90 }, { code: 'CSE-312', name: 'Software Engineering', total: 18, present: 15, pct: 83 }, { code: 'CSE-472', name: 'Web Programming Lab', total: 15, present: 14, pct: 93 }, { code: 'CSE-315', name: 'Algorithms', total: 19, present: 13, pct: 68 }].map((c, idx) => (
                  <div key={idx} style={{ background: t.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, color: t.text, fontSize: '15px' }}>{c.code}: {c.name}</h4>
                      <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', background: c.pct >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: c.pct >= 75 ? '#34d399' : '#f87171' }}>{c.pct}%</span>
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: t.subText }}>Attended: {c.present} / {c.total} Classes</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => showToast(`${c.code} - উপস্থিত মার্ক করা হয়েছে`)} style={{ flex: 1, padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Present</button>
                      <button onClick={() => showToast(`${c.code} - অনুপস্থিত মার্ক করা হয়েছে`)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Absent</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 5. COURSES */}
          {activeTab === 'courses' && (
            <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <Courses />
            </motion.div>
          )}

          {/* 6. CHATBOT */}
          {activeTab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <div style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}`, maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ marginTop: 0, color: t.text, fontSize: '18px' }}>Control AI Policy Assistant</h2>
                <div style={{ border: `1px solid ${t.border}`, height: '360px', overflowY: 'auto', padding: '16px', marginBottom: '16px', borderRadius: '10px', background: t.bg }}>
                  {messages.length === 0 ? <p style={{ color: t.subText, textAlign: 'center', marginTop: '140px' }}>Ask any question related to your courses or study topics...</p> : (
                    messages.map((m, idx) => (
                      <div key={idx} style={{ marginBottom: '12px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                        <span style={{ display: 'inline-block', padding: '10px 16px', borderRadius: '12px', background: m.sender === 'user' ? '#f97316' : t.border, color: '#fff', fontSize: '13px', maxWidth: '75%' }}>{m.text}</span>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Type your question here..." value={inputMessage} onChange={e => setInputMessage(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1px solid ${t.border}`, background: t.bg, color: t.text }} />
                  <button type="submit" style={{ padding: '12px 24px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Send</button>
                </form>
              </div>
            </motion.div>
          )}

          {/* 7. LEARNING HUB */}
          {activeTab === 'hub' && (
            <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <button className="back-btn" onClick={() => changeTab('dashboard')}>⬅ Back to Dashboard</button>
              <h2 style={{ color: t.text, marginBottom: '20px', fontSize: '20px' }}>💡 Learning Hub</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[{ title: 'C++ Programming', icon: '⚡', desc: 'Pointers, Memory, OOP Basics', lessons: ['Hello World & I/O', 'Pointers & References', 'OOP Concepts'] }, { title: 'Java Core', icon: '☕', desc: 'Classes, Objects, Polymorphism', lessons: ['JVM & Main Method', 'Inheritance & Interfaces', 'Exception Handling'] }, { title: 'MySQL Relational DB', icon: '🐬', desc: 'Queries, JOINs & Schema Design', lessons: ['Basic CRUD Queries', 'INNER & LEFT JOINs', 'Database Indexing'] }].map((topic, idx) => (
                  <div key={idx} style={{ background: t.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: '32px' }}>{topic.icon}</span>
                    <h3 style={{ margin: '12px 0 6px 0', color: t.text, fontSize: '17px' }}>{topic.title}</h3>
                    <p style={{ color: t.subText, fontSize: '13px', margin: '0 0 16px 0' }}>{topic.desc}</p>
                    <h4 style={{ fontSize: '12px', color: t.subText, textTransform: 'uppercase', marginBottom: '8px' }}>Lessons List</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#f97316', fontSize: '13px', cursor: 'pointer' }}>
                      {topic.lessons.map((les, lIdx) => (
                        <li key={lIdx} onClick={() => setActiveLesson(les)} style={{ marginBottom: '6px' }}>{les}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {activeLesson && (
                <div style={{ marginTop: '30px', background: t.cardBg, padding: '24px', borderRadius: '14px', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#f97316', fontSize: '16px' }}>📖 Active Lesson: {activeLesson}</h3>
                  <p style={{ color: t.subText, lineHeight: '1.6', fontSize: '14px' }}>এখানে লেসনের বিস্তারিত বিবরণ এবং কোড স্নিপেট রয়েছে।</p>
                  <button onClick={() => setActiveLesson(null)} style={{ padding: '6px 14px', background: t.border, color: t.text, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Close Lesson</button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;