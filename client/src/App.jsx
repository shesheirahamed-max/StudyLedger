import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import Courses from './components/Courses';

const API_BASE = 'http://localhost:5000/api';

const HMI_STYLES = `
.hmi-root {
  --bg: #05070f;
  --glass: rgba(255, 255, 255, 0.055);
  --glass-strong: rgba(255, 255, 255, 0.09);
  --stroke: rgba(255, 255, 255, 0.12);
  --text: #e8ecf8;
  --muted: #8b93ad;
  --cyan: #22d3ee;
  --indigo: #6366f1;
  --pink: #f472b6;
  --warn: #fb923c;

  position: relative;
  min-height: 640px;
  padding: 24px;
  margin-bottom: 28px;
  overflow: hidden;
  border-radius: 24px;
  background: radial-gradient(1200px 700px at 50% 0%, #0d1224 0%, var(--bg) 70%);
  color: var(--text);
  font-family: Inter, "SF Pro Display", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.hmi-root *,
.hmi-root *::before,
.hmi-root *::after {
  box-sizing: border-box;
}
.hmi-root button {
  font-family: inherit;
  color: inherit;
}

.hmi-bg-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
  pointer-events: none;
}
.hmi-bg-glow {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.35;
  pointer-events: none;
  animation: hmi-float 12s ease-in-out infinite alternate;
}
.hmi-bg-glow.a { background: var(--indigo); top: -140px; left: -80px; }
.hmi-bg-glow.b { background: var(--cyan); bottom: -180px; right: -100px; animation-delay: -6s; }
@keyframes hmi-float {
  to { transform: translate3d(40px, 30px, 0) scale(1.12); }
}

.hmi-scene {
  position: relative;
  perspective: 1400px;
  perspective-origin: 50% 40%;
}
.hmi-console {
  --sx: 12deg;
  --sy: 0deg;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transform-style: preserve-3d;
  transform: rotateX(var(--sx)) rotateY(var(--sy));
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  will-change: transform;
}

.hmi-glass {
  background: linear-gradient(145deg, var(--glass-strong), var(--glass));
  border: 1px solid var(--stroke);
  border-radius: 22px;
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.hmi-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 14px;
  transform: translateZ(40px);
  gap: 10px;
  flex-wrap: wrap;
}
.hmi-time { font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }
.hmi-top-center { display: inline-flex; gap: 6px; align-items: center; color: var(--cyan); font-size: 13px; font-weight: 600; }
.hmi-top-right { display: inline-flex; gap: 10px; align-items: center; color: var(--muted); font-size: 13px; }

.hmi-main {
  display: grid;
  grid-template-columns: minmax(210px, 1fr) minmax(320px, 1.45fr) minmax(210px, 1fr);
  gap: 18px;
  align-items: stretch;
  transform-style: preserve-3d;
}
.hmi-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hmi-panel-left { transform: translateZ(20px) rotateY(8deg); transform-origin: right center; }
.hmi-panel-right { transform: translateZ(20px) rotateY(-8deg); transform-origin: left center; }
.hmi-panel-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.hmi-bar-head { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
.hmi-bar-head b { color: var(--text); font-weight: 600; font-variant-numeric: tabular-nums; }
.hmi-bar-head i { font-style: normal; color: var(--muted); font-weight: 400; }
.hmi-bar-track { height: 6px; border-radius: 99px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.hmi-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--cyan), var(--indigo));
  transition: width 0.25s linear;
}
.hmi-bar-fill.warn { background: linear-gradient(90deg, var(--warn), var(--pink)); }

.hmi-tires { margin-top: auto; }
.hmi-tires-title { display: block; font-size: 11px; color: var(--muted); margin-bottom: 8px; letter-spacing: 0.06em; }
.hmi-car-top { position: relative; height: 112px; width: 100%; }
.hmi-car-body {
  position: absolute; left: 50%; top: 6px; bottom: 6px; width: 46px; transform: translateX(-50%);
  border-radius: 22px; border: 1px solid var(--stroke);
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.18), rgba(99, 102, 241, 0.08));
}
.hmi-tire {
  position: absolute; z-index: 1; padding: 3px 9px; font-size: 11px; font-weight: 700;
  border-radius: 8px; background: rgba(34, 211, 238, 0.12); border: 1px solid rgba(34, 211, 238, 0.35); color: var(--cyan);
}
.hmi-tire.fl { left: 4%; top: 4px; }
.hmi-tire.fr { right: 4%; top: 4px; }
.hmi-tire.rl { left: 4%; bottom: 4px; }
.hmi-tire.rr { right: 4%; bottom: 4px; }

.hmi-status-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.hmi-status-list li { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); padding-bottom: 10px; border-bottom: 1px dashed rgba(255, 255, 255, 0.08); }
.hmi-status-list b { color: var(--text); font-weight: 600; }
.hmi-next-turn {
  display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 16px;
  background: rgba(99, 102, 241, 0.14); border: 1px solid rgba(99, 102, 241, 0.35); cursor: pointer;
}
.hmi-turn-arrow { font-size: 26px; line-height: 1; color: var(--cyan); }
.hmi-next-turn strong { display: block; font-size: 16px; }
.hmi-next-turn span { font-size: 12px; color: var(--muted); }
.hmi-now-playing {
  margin-top: auto; display: flex; gap: 8px; align-items: center; font-size: 12px; color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.hmi-cluster {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transform: translateZ(65px);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.55), 0 0 60px rgba(99, 102, 241, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.14);
}
.hmi-gauge { position: relative; width: min(100%, 320px); aspect-ratio: 1; }
.hmi-gauge-svg { width: 100%; height: 100%; overflow: visible; }
.hmi-arc-track { fill: none; stroke: rgba(255, 255, 255, 0.08); stroke-width: 10; stroke-linecap: round; }
.hmi-arc-value { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 0.25s ease; }
.hmi-needle { transform-origin: 150px 150px; transition: transform 0.25s ease; }
.hmi-needle line { stroke: var(--pink); stroke-width: 2.5; stroke-linecap: round; filter: drop-shadow(0 0 6px var(--pink)); }
.hmi-needle circle { fill: #0b0f1c; stroke: var(--pink); stroke-width: 2; }

.hmi-gauge-readout {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding-top: 36px; pointer-events: none; text-align: center;
}
.hmi-speed { font-size: 46px; font-weight: 700; line-height: 1.05; font-variant-numeric: tabular-nums; text-shadow: 0 0 30px rgba(99, 102, 241, 0.7); }
.hmi-unit { color: var(--muted); font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 6px; }
.hmi-gear-row { display: flex; gap: 10px; margin-top: 12px; pointer-events: auto; }
.hmi-gear { font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.35); cursor: pointer; background: transparent; border: 0; padding: 2px 4px; transition: color 0.2s, text-shadow 0.2s; }
.hmi-gear.active { color: var(--cyan); text-shadow: 0 0 12px var(--cyan); }
.hmi-mode-chip {
  margin-top: 10px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  border-radius: 99px; border: 1px solid var(--stroke); color: var(--muted); background: rgba(255, 255, 255, 0.04);
}

.hmi-battery { position: absolute; right: 16px; bottom: 16px; width: 78px; height: 78px; }
.hmi-battery svg { width: 100%; height: 100%; }
.hmi-ring-track { fill: none; stroke: rgba(255, 255, 255, 0.09); stroke-width: 8; }
.hmi-ring-value { fill: none; stroke: var(--cyan); stroke-width: 8; stroke-linecap: round; filter: drop-shadow(0 0 6px var(--cyan)); transition: stroke-dasharray 0.4s ease; }
.hmi-battery-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.15; }
.hmi-battery-text strong { font-size: 14px; }
.hmi-battery-text span { font-size: 10px; color: var(--muted); }

.hmi-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
  transform: translateZ(48px);
  transform-style: preserve-3d;
}
.hmi-card {
  --rx: 0deg;
  --ry: 0deg;
  --gx: 50%;
  --gy: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  min-height: 106px;
  text-align: left;
  cursor: pointer;
  border-radius: 18px;
  border: 1px solid var(--stroke);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025));
  overflow: hidden;
  transform: perspective(700px) rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0);
  transition: transform 0.18s ease-out, border-color 0.25s, box-shadow 0.25s;
}
.hmi-card:hover,
.hmi-card:focus-visible {
  border-color: rgba(34, 211, 238, 0.55);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(34, 211, 238, 0.2);
  outline: none;
}
.hmi-card.is-active { border-color: var(--cyan); box-shadow: 0 0 28px rgba(34, 211, 238, 0.35); }
.hmi-card-shine {
  position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 0.25s;
  background: radial-gradient(180px circle at var(--gx) var(--gy), rgba(255, 255, 255, 0.18), transparent 60%);
}
.hmi-card:hover .hmi-card-shine { opacity: 1; }
.hmi-card-icon { font-size: 18px; margin-bottom: 4px; filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.45)); }
.hmi-card-label { font-size: 14px; font-weight: 600; }
.hmi-card-summary { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

.hmi-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(3, 5, 12, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  perspective: 1200px;
}
.hmi-modal {
  width: min(460px, 100%);
  max-height: 100%;
  overflow: auto;
  padding: 22px;
  background: linear-gradient(145deg, rgba(24, 30, 54, 0.95), rgba(12, 16, 32, 0.95));
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7), 0 0 50px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.hmi-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.hmi-modal-title { display: flex; align-items: center; gap: 10px; color: var(--cyan); }
.hmi-modal-title h2 { margin: 0; font-size: 18px; color: var(--text); }
.hmi-close {
  width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer;
  border-radius: 50%; border: 1px solid var(--stroke); background: rgba(255, 255, 255, 0.05);
}
.hmi-modal-body { display: grid; gap: 14px; }
.hmi-hint { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
.hmi-action-btn {
  padding: 11px 16px;
  border-radius: 12px;
  border: 1px solid rgba(34, 211, 238, 0.45);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(34, 211, 238, 0.25));
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

@media (max-width: 960px) {
  .hmi-main { grid-template-columns: 1fr; }
  .hmi-panel-left, .hmi-panel-right { transform: none; }
  .hmi-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .hmi-root { padding: 14px; }
  .hmi-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;

function App() {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // User-Specific Storage Keys Implementation (synced with user state)
  const userEmailKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
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

  // CGPA Planner State & Dynamic User-Specific Storage Integration
  const [cgpaData, setCgpaData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CGPA);
    return saved ? JSON.parse(saved) : { cgpa: '3.17', totalCredits: '90' };
  });

  const [targetCgpa, setTargetCgpa] = useState('');
  const [nextCredits, setNextCredits] = useState('');
  const [requiredGpa, setRequiredGpa] = useState(null);

  // Learning Hub Active Lesson
  const [activeLesson, setActiveLesson] = useState(null);

  // UMS Quick Access & 3D Smart Card State (Link text hidden in UI)
  const umsUrl = 'https://ums.seu.edu.bd/sign-in?redirectURL=%2Fdashboard';
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  const [isCardLaunching, setIsCardLaunching] = useState(false);

  // 3D HMI Console Interactive State
  const [hmiTilt, setHmiTilt] = useState({ sx: 10, sy: 0 });
  const [hmiClusterMode, setHmiClusterMode] = useState('CGPA');
  const [hmiActiveModal, setHmiActiveModal] = useState(null);
  const [hmiClock, setHmiClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setHmiClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleHmiConsoleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setHmiTilt({
      sx: Number((10 - py * 12).toFixed(1)),
      sy: Number((px * 16).toFixed(1))
    });
  };

  const handleHmiConsoleLeave = () => {
    setHmiTilt({ sx: 10, sy: 0 });
  };

  const handleHmiCardMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((0.5 - y / rect.height) * 18).toFixed(1);
    const ry = ((x / rect.width - 0.5) * 18).toFixed(1);
    const gx = `${Math.round((x / rect.width) * 100)}%`;
    const gy = `${Math.round((y / rect.height) * 100)}%`;
    e.currentTarget.style.setProperty('--rx', `${rx}deg`);
    e.currentTarget.style.setProperty('--ry', `${ry}deg`);
    e.currentTarget.style.setProperty('--gx', gx);
    e.currentTarget.style.setProperty('--gy', gy);
  };

  const handleHmiCardLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    setCardTilt({
      rotateX: (0.5 - py) * 28,
      rotateY: (px - 0.5) * 28,
      glowX: Math.round(px * 100),
      glowY: Math.round(py * 100)
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  };

  const handleOpenUms = () => {
    setIsCardLaunching(true);
    setTimeout(() => {
      window.open(umsUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setIsCardLaunching(false);
      }, 450);
    }, 360);
  };

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

  const getAuthHeaders = useCallback(() => {
    const activeToken = token || localStorage.getItem('token');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  const fetchUserCoursesCount = useCallback((activeToken) => {
    const useToken = activeToken || token || localStorage.getItem('token');
    if (!useToken) {
      setCoursesCount(0);
      return;
    }

    axios
      .get(`${API_BASE}/courses`, { headers: { Authorization: `Bearer ${useToken}` } })
      .then((res) => {
        if (Array.isArray(res.data?.courses)) {
          setCoursesCount(res.data.courses.length);
        } else {
          setCoursesCount(0);
        }
      })
      .catch(() => {
        setCoursesCount(0);
      });
  }, [token]);

  // Load user-specific data from MySQL (with localStorage fallback)
  useEffect(() => {
    const savedTxn = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    const localTxns = savedTxn ? JSON.parse(savedTxn) : [];

    const savedBudget = localStorage.getItem(STORAGE_KEY_BUDGET);
    const localBudget = savedBudget ? JSON.parse(savedBudget) : { budget: 10000, initialBalance: 0 };

    const savedCgpa = localStorage.getItem(STORAGE_KEY_CGPA);
    const localCgpa = savedCgpa ? JSON.parse(savedCgpa) : { cgpa: '3.17', totalCredits: '90' };

    setTransactions(localTxns);
    setMonthlyBudget(localBudget);
    setCgpaData(localCgpa);

    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) {
      setCoursesCount(0);
      return;
    }

    axios
      .get(`${API_BASE}/finance/state`, { headers: { Authorization: `Bearer ${activeToken}` } })
      .then((res) => {
        const data = res.data || {};

        const dbBudget = Number(data.monthly_budget);
        const dbBalance = Number(data.initial_balance);
        if (!Number.isNaN(dbBudget) && !Number.isNaN(dbBalance) && (dbBudget > 0 || dbBalance > 0)) {
          const formattedBudget = {
            budget: dbBudget > 0 ? dbBudget : localBudget.budget,
            initialBalance: dbBalance
          };
          setMonthlyBudget(formattedBudget);
          localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(formattedBudget));
        }

        if (Array.isArray(data.transactions) && data.transactions.length > 0) {
          const formattedTxns = data.transactions.map((tr) => ({
            id: tr.id,
            type: tr.type,
            category: tr.category,
            amount: parseFloat(tr.amount),
            note: tr.note || '',
            date: tr.created_at ? new Date(tr.created_at).toLocaleDateString() : new Date().toLocaleDateString()
          }));
          setTransactions(formattedTxns);
          localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(formattedTxns));
        }

        const dbCgpa = Number(data.current_cgpa);
        const dbCredits = Number(data.completed_credits);
        if (!Number.isNaN(dbCgpa) && !Number.isNaN(dbCredits) && (dbCgpa > 0 || dbCredits > 0)) {
          const formattedCgpa = {
            cgpa: dbCgpa > 0 ? String(dbCgpa) : localCgpa.cgpa,
            totalCredits: dbCredits > 0 ? String(dbCredits) : localCgpa.totalCredits
          };
          setCgpaData(formattedCgpa);
          localStorage.setItem(STORAGE_KEY_CGPA, JSON.stringify(formattedCgpa));
        }
      })
      .catch(() => {});

    fetchUserCoursesCount(activeToken);
  }, [token, STORAGE_KEY_TRANSACTIONS, STORAGE_KEY_BUDGET, STORAGE_KEY_CGPA, fetchUserCoursesCount]);

  // Save Budget & Initial Balance to MySQL + localStorage
  const handleUpdateBudget = async (newBudgetData) => {
    setMonthlyBudget(newBudgetData);
    localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(newBudgetData));

    try {
      await axios.put(
        `${API_BASE}/finance/budget`,
        {
          monthly_budget: parseFloat(newBudgetData.budget) || 10000,
          initial_balance: parseFloat(newBudgetData.initialBalance) || 0
        },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error('Budget MySQL save error:', err);
    }
  };

  // Save CGPA & Completed Credits to MySQL + localStorage
  const handleUpdateCgpa = async (newData) => {
    setCgpaData(newData);
    localStorage.setItem(STORAGE_KEY_CGPA, JSON.stringify(newData));

    try {
      await axios.put(
        `${API_BASE}/finance/cgpa`,
        {
          current_cgpa: parseFloat(newData.cgpa) || 0,
          completed_credits: parseFloat(newData.totalCredits) || 0
        },
        { headers: getAuthHeaders() }
      );
    } catch (err) {
      console.error('CGPA MySQL save error:', err);
    }
  };

  // Sync LocalStorage for Transactions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions, STORAGE_KEY_TRANSACTIONS]);

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
    if (tabId === 'dashboard' || tabId === 'courses') {
      fetchUserCoursesCount();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setCoursesCount(0);
    setActiveTab('dashboard');
    setMessages([]);
    showToast('লগআউট করা হয়েছে।');
  };

  // Expense Handler (MySQL + UI State)
  const handleAddTxn = async (e) => {
    e.preventDefault();
    if (!txnForm.amount) return;

    const amountNum = parseFloat(txnForm.amount);
    const newTxn = {
      ...txnForm,
      id: Date.now(),
      amount: amountNum,
      date: new Date().toLocaleDateString()
    };

    setTransactions([newTxn, ...transactions]);
    setTxnForm({ type: 'expense', category: 'Food', amount: '', note: '' });

    try {
      const res = await axios.post(
        `${API_BASE}/finance/transactions`,
        {
          type: txnForm.type,
          category: txnForm.category || 'General',
          amount: amountNum,
          note: txnForm.note || ''
        },
        { headers: getAuthHeaders() }
      );
      if (res.data?.transaction?.id) {
        setTransactions((prev) =>
          prev.map((item) => (item.id === newTxn.id ? { ...item, id: res.data.transaction.id } : item))
        );
      }
    } catch (err) {
      console.error('Transaction MySQL save error:', err);
    }

    showToast('ট্রানজ্যাকশন সফলভাবে সেভ হয়েছে!');
  };

  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = (parseFloat(monthlyBudget.initialBalance) || 0) + totalIncome - totalExpense;
  const budgetLimit = parseFloat(monthlyBudget.budget) || 10000;
  const budgetUsedPercent = Math.min(Math.round((totalExpense / budgetLimit) * 100), 100);
  const cgpaPercent = Math.min(Math.round(((parseFloat(cgpaData.cgpa) || 0) / 4.0) * 100), 100);
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const taskCompletionPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Gauge / Cluster Computed Values
  const clusterValueMap = {
    CGPA: { main: cgpaData.cgpa, unit: '/ 4.00 CGPA', pct: cgpaPercent },
    BUDGET: { main: `${budgetUsedPercent}%`, unit: 'BUDGET USED', pct: budgetUsedPercent },
    TASKS: { main: `${taskCompletionPercent}%`, unit: 'TASKS DONE', pct: taskCompletionPercent },
    UMS: { main: String(coursesCount), unit: 'ACTIVE COURSES', pct: Math.min(coursesCount * 20, 100) }
  };
  const activeCluster = clusterValueMap[hmiClusterMode] || clusterValueMap.CGPA;
  const gaugeArcLength = 251;
  const gaugeDash = `${Math.round((activeCluster.pct / 100) * gaugeArcLength)} ${gaugeArcLength}`;
  const needleAngle = -110 + (activeCluster.pct / 100) * 220;
  const ringCircumference = 201;
  const ringDash = `${Math.round((taskCompletionPercent / 100) * ringCircumference)} ${ringCircumference}`;

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
      const res = await axios.post(`${API_BASE}/chat/message`, {
        message: userMsg,
        userId: user?.id
      });
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
        ${HMI_STYLES}
        .nav-btn { transition: all 0.25s ease; cursor: pointer; }
        .nav-btn:hover { background: rgba(249, 115, 22, 0.15) !important; color: #f97316 !important; }
        .card-hover { transition: all 0.3s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(249, 115, 22, 0.5) !important; box-shadow: 0 10px 30px -10px rgba(249, 115, 22, 0.2); }
        .back-btn { background: #27272a; color: #fff; border: 1px solid #3f3f46; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; transition: 0.2s; }
        .back-btn:hover { background: #3f3f46; }
        .ums-floating-stage { perspective: 1200px; }
        .ums-3d-marquee-box {
          position: relative;
          overflow: hidden;
          transform-style: preserve-3d;
          box-shadow: 0 16px 32px -10px rgba(0, 0, 0, 0.78), 0 0 22px rgba(249, 115, 22, 0.16);
        }
        @keyframes ums3dSlideTriColor {
          0% {
            transform: translateX(-28%) rotateY(-8deg);
            color: #ef4444;
            text-shadow: 0 2px 0 #7f1d1d, 0 5px 0 #450a0a, 0 0 18px rgba(239, 68, 68, 0.75);
          }
          33% {
            transform: translateX(0%) rotateY(0deg);
            color: #facc15;
            text-shadow: 0 2px 0 #854d0e, 0 5px 0 #422006, 0 0 18px rgba(250, 204, 21, 0.75);
          }
          66% {
            transform: translateX(28%) rotateY(8deg);
            color: #fb923c;
            text-shadow: 0 2px 0 #9a3412, 0 5px 0 #431407, 0 0 18px rgba(251, 146, 60, 0.75);
          }
          100% {
            transform: translateX(-28%) rotateY(-8deg);
            color: #ef4444;
            text-shadow: 0 2px 0 #7f1d1d, 0 5px 0 #450a0a, 0 0 18px rgba(239, 68, 68, 0.75);
          }
        }
        .ums-3d-tri-text {
          display: inline-block;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.04em;
          white-space: nowrap;
          animation: ums3dSlideTriColor 5.2s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .ums-3d-key {
          box-shadow: 0 5px 0 #9a3412, 0 12px 24px rgba(249, 115, 22, 0.42);
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .ums-3d-key:active {
          transform: translateY(3px);
          box-shadow: 0 2px 0 #9a3412, 0 6px 14px rgba(249, 115, 22, 0.3);
        }
        .ums-3d-card {
          transform-style: preserve-3d;
          transition: transform 0.18s ease-out, box-shadow 0.25s ease;
        }
        .ums-3d-card.launching {
          transform: rotateY(180deg) scale(1.05) !important;
          transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.42s ease !important;
          box-shadow: 0 0 35px rgba(249, 115, 22, 0.75), 0 0 70px rgba(234, 88, 12, 0.45) !important;
        }
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
              <div style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' : 'linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)', border: '1px solid rgba(249, 115, 22, 0.4)', color: t.text, padding: '30px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Welcome back, {user ? user.name : 'Zim'}! ⚡</h2>
                <p style={{ margin: 0, color: t.subText, fontSize: '14px' }}>Personal Workspace • Smart Study, Finance & Productivity Suite</p>
              </div>

              {/* Floating 3D Tri-Color Moving Text + UMS Button + 3D Smart Card */}
              <div
                className="ums-floating-stage"
                style={{
                  marginBottom: '24px',
                  padding: '6px 2px 10px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                  <div
                    onClick={handleOpenUms}
                    title="Click to launch UMS Portal"
                    className="ums-3d-marquee-box"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      height: '46px',
                      padding: '0 18px',
                      borderRadius: '12px',
                      background: theme === 'dark' ? 'rgba(18, 18, 23, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="ums-3d-tri-text">
                      ⚡ UMS PORTAL LIVE • CLICK TO ACCESS ⚡
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96, y: 2 }}
                    type="button"
                    onClick={handleOpenUms}
                    className="ums-3d-key"
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    UMS
                  </motion.button>
                </div>

                {/* Interactive 3D Smart Card (Parallax Tilt + Flip/Glow) */}
                <div className="ums-3d-stage" style={{ width: '210px', height: '64px' }}>
                  <div
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    onClick={handleOpenUms}
                    className={`ums-3d-card ${isCardLaunching ? 'launching' : ''}`}
                    title="Move cursor for 3D tilt • Click to open UMS"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      border: isCardLaunching ? '1px solid #fb923c' : '1px solid rgba(249, 115, 22, 0.45)',
                      background: `radial-gradient(circle at ${cardTilt.glowX}% ${cardTilt.glowY}%, rgba(249, 115, 22, 0.28), rgba(18, 18, 22, 0.96) 68%)`,
                      boxShadow: isCardLaunching
                        ? '0 0 36px rgba(249, 115, 22, 0.8)'
                        : '0 14px 28px rgba(0, 0, 0, 0.55), 0 0 16px rgba(249, 115, 22, 0.16)',
                      transform: isCardLaunching
                        ? 'rotateY(180deg) scale(1.05)'
                        : `rotateX(${cardTilt.rotateX.toFixed(1)}deg) rotateY(${cardTilt.rotateY.toFixed(1)}deg)`,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ transform: isCardLaunching ? 'scaleX(-1)' : 'none' }}>
                      <div style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#fb923c', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isCardLaunching ? 'Opening UMS...' : '3D Smart Pass'}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#f4f4f5', marginTop: '2px' }}>
                        {user?.student_id || 'Personal • UMS Portal'}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '700',
                        boxShadow: '0 0 14px rgba(249, 115, 22, 0.55)',
                        transform: isCardLaunching ? 'scaleX(-1)' : 'none'
                      }}
                    >
                      ↗
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D-TILTED GLASSY HMI CONSOLE (.hmi-*) */}
              <div
                className="hmi-root"
                onMouseMove={handleHmiConsoleMove}
                onMouseLeave={handleHmiConsoleLeave}
              >
                <div className="hmi-bg-grid" />
                <div className="hmi-bg-glow a" />
                <div className="hmi-bg-glow b" />

                <div className="hmi-scene">
                  <div
                    className="hmi-console"
                    style={{ '--sx': `${hmiTilt.sx}deg`, '--sy': `${hmiTilt.sy}deg` }}
                  >
                    {/* Top Bar */}
                    <div className="hmi-topbar hmi-glass">
                      <span className="hmi-time">{hmiClock}</span>
                      <span className="hmi-top-center">◈ 3D HMI COMMAND CONSOLE • {user?.name || 'ZIM'}</span>
                      <span className="hmi-top-right">
                        <span>{cgpaData.totalCredits} CR</span>
                        <span>•</span>
                        <span>৳ {currentBalance}</span>
                      </span>
                    </div>

                    {/* Main 3-Column Row */}
                    <div className="hmi-main">
                      {/* Left Glass Panel */}
                      <div className="hmi-panel hmi-panel-left hmi-glass">
                        <h4 className="hmi-panel-title">Telemetry & Bars</h4>

                        <div>
                          <div className="hmi-bar-head">
                            <span>CGPA Index</span>
                            <b>{cgpaData.cgpa} <i>/ 4.00</i></b>
                          </div>
                          <div className="hmi-bar-track">
                            <div className="hmi-bar-fill" style={{ width: `${cgpaPercent}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="hmi-bar-head">
                            <span>Budget Used</span>
                            <b>{budgetUsedPercent}% <i>(৳{totalExpense})</i></b>
                          </div>
                          <div className="hmi-bar-track">
                            <div className={`hmi-bar-fill ${budgetUsedPercent >= 80 ? 'warn' : ''}`} style={{ width: `${budgetUsedPercent}%` }} />
                          </div>
                        </div>

                        <div className="hmi-tires">
                          <span className="hmi-tires-title">SYSTEM NODES</span>
                          <div className="hmi-car-top">
                            <span className="hmi-tire fl">CGPA {cgpaData.cgpa}</span>
                            <span className="hmi-tire fr">CRS {coursesCount}</span>
                            <div className="hmi-car-body" />
                            <span className="hmi-tire rl">TSK {taskCompletionPercent}%</span>
                            <span className="hmi-tire rr">BDG {budgetUsedPercent}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Center 3D Cluster */}
                      <div className="hmi-cluster hmi-glass">
                        <div className="hmi-gauge">
                          <svg className="hmi-gauge-svg" viewBox="0 0 300 300">
                            <defs>
                              <linearGradient id="hmiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="60%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#f472b6" />
                              </linearGradient>
                            </defs>
                            <path
                              className="hmi-arc-track"
                              d="M 52 218 A 115 115 0 1 1 248 218"
                              strokeDasharray={`${gaugeArcLength} ${gaugeArcLength}`}
                            />
                            <path
                              className="hmi-arc-value"
                              d="M 52 218 A 115 115 0 1 1 248 218"
                              stroke="url(#hmiGaugeGrad)"
                              strokeDasharray={gaugeDash}
                            />
                            <g className="hmi-needle" style={{ transform: `rotate(${needleAngle}deg)` }}>
                              <line x1="150" y1="150" x2="150" y2="56" />
                              <circle cx="150" cy="150" r="8" />
                            </g>
                          </svg>

                          <div className="hmi-gauge-readout">
                            <div className="hmi-speed">{activeCluster.main}</div>
                            <div className="hmi-unit">{activeCluster.unit}</div>
                            <div className="hmi-gear-row">
                              {['CGPA', 'BUDGET', 'TASKS', 'UMS'].map((mode) => (
                                <button
                                  key={mode}
                                  type="button"
                                  className={`hmi-gear ${hmiClusterMode === mode ? 'active' : ''}`}
                                  onClick={() => setHmiClusterMode(mode)}
                                >
                                  {mode}
                                </button>
                              ))}
                            </div>
                            <div className="hmi-mode-chip">MODE • {hmiClusterMode}</div>
                          </div>
                        </div>

                        <div className="hmi-battery" title="Task Completion">
                          <svg viewBox="0 0 80 80">
                            <circle className="hmi-ring-track" cx="40" cy="40" r="32" />
                            <circle
                              className="hmi-ring-value"
                              cx="40"
                              cy="40"
                              r="32"
                              transform="rotate(-90 40 40)"
                              strokeDasharray={ringDash}
                            />
                          </svg>
                          <div className="hmi-battery-text">
                            <strong>{taskCompletionPercent}%</strong>
                            <span>TASKS</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Glass Panel */}
                      <div className="hmi-panel hmi-panel-right hmi-glass">
                        <h4 className="hmi-panel-title">Live Status</h4>

                        <ul className="hmi-status-list">
                          <li><span>Balance</span><b>৳ {currentBalance}</b></li>
                          <li><span>Budget Cap</span><b>৳ {budgetLimit}</b></li>
                          <li><span>Courses</span><b>{coursesCount} Active</b></li>
                          <li><span>Tasks Done</span><b>{completedTasksCount}/{tasks.length}</b></li>
                        </ul>

                        <div className="hmi-next-turn" onClick={handleOpenUms} title="Launch UMS Portal">
                          <span className="hmi-turn-arrow">↗</span>
                          <div>
                            <strong>UMS PORTAL</strong>
                            <span>{user?.student_id || 'Student Account'}</span>
                          </div>
                        </div>

                        <div className="hmi-now-playing">
                          <span>◉</span>
                          <span>{notices[0]?.title || 'Academic Sync Ready'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom 6-Card Control Strip */}
                    <div className="hmi-strip hmi-glass">
                      {[
                        { id: 'cgpa', icon: '📈', label: 'CGPA', summary: `${cgpaData.cgpa} / 4.00` },
                        { id: 'budget', icon: '💰', label: 'Budget', summary: `৳ ${currentBalance}` },
                        { id: 'ums', icon: '⚡', label: 'UMS Pass', summary: 'Open Portal' },
                        { id: 'courses', icon: '📚', label: 'Courses', summary: `${coursesCount} Enrolled` },
                        { id: 'tasks', icon: '📝', label: 'Tasks', summary: `${completedTasksCount}/${tasks.length} Done` },
                        { id: 'status', icon: '◈', label: 'Inspector', summary: `${hmiClusterMode} View` }
                      ].map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          style={{ '--i': idx }}
                          className={`hmi-card ${hmiActiveModal === item.id ? 'is-active' : ''}`}
                          onMouseMove={handleHmiCardMove}
                          onMouseLeave={handleHmiCardLeave}
                          onClick={() => setHmiActiveModal(item.id)}
                        >
                          <span className="hmi-card-shine" />
                          <span className="hmi-card-icon">{item.icon}</span>
                          <span className="hmi-card-label">{item.label}</span>
                          <span className="hmi-card-summary">{item.summary}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interactive Modal Overlay inside 3D HMI Root */}
                {hmiActiveModal && (
                  <div className="hmi-overlay" onClick={() => setHmiActiveModal(null)}>
                    <div className="hmi-modal hmi-glass" onClick={(e) => e.stopPropagation()}>
                      <div className="hmi-modal-head">
                        <div className="hmi-modal-title">
                          <span>◈</span>
                          <h2>HMI Control • {hmiActiveModal.toUpperCase()}</h2>
                        </div>
                        <button type="button" className="hmi-close" onClick={() => setHmiActiveModal(null)}>
                          ✕
                        </button>
                      </div>

                      <div className="hmi-modal-body">
                        <p className="hmi-hint">
                          Current CGPA: <b>{cgpaData.cgpa}</b> ({cgpaData.totalCredits} Credits) • Balance: <b>৳ {currentBalance}</b> • Budget Used: <b>{budgetUsedPercent}%</b>
                        </p>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="hmi-action-btn"
                            onClick={() => {
                              const nextVal = ((parseFloat(monthlyBudget.budget) || 10000) + 1000);
                              handleUpdateBudget({ ...monthlyBudget, budget: nextVal });
                              showToast(`বাজেট বাড়িয়ে ৳ ${nextVal} করা হয়েছে!`);
                            }}
                          >
                            + ৳1,000 Budget
                          </button>

                          <button
                            type="button"
                            className="hmi-action-btn"
                            onClick={() => {
                              const targetTab =
                                hmiActiveModal === 'cgpa' ? 'cgpa'
                                : hmiActiveModal === 'budget' ? 'expenses'
                                : hmiActiveModal === 'courses' ? 'courses'
                                : 'dashboard';
                              setHmiActiveModal(null);
                              if (targetTab !== 'dashboard') changeTab(targetTab);
                            }}
                          >
                            Open Full Module →
                          </button>

                          {hmiActiveModal === 'ums' && (
                            <button
                              type="button"
                              className="hmi-action-btn"
                              onClick={() => {
                                setHmiActiveModal(null);
                                handleOpenUms();
                              }}
                            >
                              Launch UMS Now ↗
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
              <Courses
                token={token}
                user={user}
                onCoursesChange={() => fetchUserCoursesCount(token)}
              />
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