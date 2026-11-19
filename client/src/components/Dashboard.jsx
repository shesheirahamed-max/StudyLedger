import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = ({ user, coursesCount, totalExpense, totalIncome, monthlyBudget, setActiveTab }) => {
  // Budget used calculation
  const budgetUsedPercent = Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100);
  const currentBalance = totalIncome - totalExpense;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* Welcome Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', 
        border: '1px solid #374151', 
        color: '#f9fafb', 
        padding: '30px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
          Welcome back, {user ? user.name : 'Student'}! ⚡
        </h2>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
          Southeast University • B.Sc. in Computer Science & Engineering (4th Year) | Student ID: {user?.student_id || '2022100000035'}
        </p>
      </div>

      {/* Top Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* CGPA Card */}
        <div style={{ background: '#1f2937', padding: '20px', borderRadius: '14px', border: '1px solid #374151', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>CURRENT CGPA</span>
          <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#f9fafb' }}>
            3.17 <span style={{ fontSize: '14px', color: '#9ca3af' }}>/ 4.00</span>
          </h3>
        </div>

        {/* Balance Card */}
        <div style={{ background: '#1f2937', padding: '20px', borderRadius: '14px', border: '1px solid #374151', borderLeft: '4px solid #10b981' }}>
          <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>THIS MONTH BALANCE</span>
          <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: currentBalance >= 0 ? '#10b981' : '#ef4444' }}>
            ৳ {currentBalance}
          </h3>
        </div>

        {/* Budget Used Card */}
        <div style={{ background: '#1f2937', padding: '20px', borderRadius: '14px', border: '1px solid #374151', borderLeft: '4px solid #f97316' }}>
          <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>BUDGET USED</span>
          <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#f97316' }}>
            {budgetUsedPercent}%
          </h3>
        </div>

        {/* Courses Card */}
        <div style={{ background: '#1f2937', padding: '20px', borderRadius: '14px', border: '1px solid #374151', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>TOTAL COURSES</span>
          <h3 style={{ fontSize: '26px', margin: '8px 0 0 0', color: '#8b5cf6' }}>
            {coursesCount}
          </h3>
        </div>

      </div>

      {/* Academic & Development Hub Shortcuts */}
      <h3 style={{ fontSize: '16px', color: '#f9fafb', marginBottom: '16px', fontWeight: '600' }}>
        Academic & Development Quick Hub
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {[
          { title: '💻 Competitive Programming', desc: 'Algorithm practice and problem solving logs', tab: 'hub' },
          { title: '📈 CGPA & Target Planner', desc: 'Target GPA calculator and SEU grading scale', tab: 'cgpa' },
          { title: '📋 Attendance & Marks', desc: 'Class attendance and quiz score tracker', tab: 'attendance' },
          { title: '💰 Mess & Study Expenses', desc: 'Track daily grocery and study budget costs', tab: 'expenses' }
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(item.tab)}
            style={{ 
              background: '#1f2937', 
              padding: '22px', 
              borderRadius: '14px', 
              border: '1px solid #374151', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.borderColor = '#374151';
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#f9fafb' }}>{item.title}</h4>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;