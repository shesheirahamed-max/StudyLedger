import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const QUICK_PROMPTS = [
  {
    label: '📊 CGPA ও বাজেট সামারি',
    text: 'আমার বর্তমান CGPA, ক্রেডিট, ব্যালেন্স ও বাজেটের সারসংক্ষেপ দাও।'
  },
  {
    label: '💻 C++ OOP ও Pointers',
    text: 'C++ এ Pointer এবং OOP-এর মূল পার্থক্য সহজ উদাহরণসহ বুঝিয়ে বলো।'
  },
  {
    label: '🗄️ SQL JOIN vs Indexing',
    text: 'MySQL এ INNER JOIN, LEFT JOIN এবং Indexing কখন ও কীভাবে ব্যবহার করা হয়?'
  },
  {
    label: '🎯 স্টাডি ও রিভিশন প্ল্যান',
    text: 'মিডটার্ম ও ফাইনাল পরীক্ষার ভালো প্রস্তুতির জন্য কার্যকরী স্টাডি রুটিন দাও।'
  }
];

function AiChatbot({
  apiBase = 'http://localhost:5000/api',
  token,
  user,
  theme = 'dark',
  contextStats,
  onShowToast
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [aiMode, setAiMode] = useState('Academic & Coding');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);

  const t = {
    bg: theme === 'dark' ? '#09090b' : '#f8fafc',
    cardBg: theme === 'dark' ? '#121216' : '#ffffff',
    text: theme === 'dark' ? '#f4f4f5' : '#0f172a',
    subText: theme === 'dark' ? '#a1a1aa' : '#64748b',
    border: theme === 'dark' ? '#27272a' : '#e2e8f0'
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const getAuthHeaders = useCallback(() => {
    const activeToken = token || localStorage.getItem('token');
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  }, [token]);

  const sendPrompt = async (rawText) => {
    const textToSend = (typeof rawText === 'string' ? rawText : inputMessage).trim();
    if (!textToSend || isSending) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend, time: now }]);
    if (typeof rawText !== 'string') {
      setInputMessage('');
    }
    setIsSending(true);

    const enrichedMessage =
      contextStats && textToSend.toLowerCase().includes('cgpa')
        ? `${textToSend}\n\n[User Context: CGPA=${contextStats.cgpa}, Credits=${contextStats.totalCredits}, Balance=৳${contextStats.currentBalance}, Budget=৳${contextStats.budgetLimit}, Used=${contextStats.budgetUsedPercent}%, Courses=${contextStats.coursesCount}]`
        : textToSend;

    try {
      const res = await axios.post(
        `${apiBase}/chat/message`,
        {
          userId: user?.id,
          message: enrichedMessage,
          mode: aiMode
        },
        { headers: getAuthHeaders() }
      );

      const replyText = res.data?.reply || 'কোনো রেসপন্স পাওয়া যায়নি।';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.data?.model
        }
      ]);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'সার্ভার বা Gemini API-এর সাথে সংযোগ করা যায়নি। ব্যাকএন্ড চালু আছে কি না এবং API Key ঠিক আছে কি না যাচাই করুন।';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'error',
          text: errMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendPrompt(inputMessage);
  };

  const handleCopy = (text, idx) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedIdx(idx);
    onShowToast?.('রেসপন্স কপি করা হয়েছে।');
    setTimeout(() => setCopiedIdx((prev) => (prev === idx ? null : prev)), 1800);
  };

  const handleResetChat = () => {
    setMessages([]);
    setCopiedIdx(null);
    onShowToast?.('চ্যাট ক্লিয়ার করা হয়েছে।');
  };

  return (
    <div
      style={{
        background: t.cardBg,
        border: `1px solid ${t.border}`,
        borderRadius: '18px',
        maxWidth: '920px',
        margin: '0 auto',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 22px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700'
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: t.text }}>
                Control AI Policy Assistant
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}
              >
                ● Live AI
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: t.subText }}>
              Official AI Workspace • {aiMode}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={aiMode}
            onChange={(e) => setAiMode(e.target.value)}
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              border: `1px solid ${t.border}`,
              background: t.bg,
              color: t.text,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="Academic & Coding">🎓 Academic & Coding</option>
            <option value="Study & Exam Prep">📚 Study & Exam Prep</option>
            <option value="General Assistant">⚡ General Assistant</option>
          </select>

          <button
            type="button"
            onClick={handleResetChat}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: `1px solid ${t.border}`,
              background: t.bg,
              color: t.text,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Message List */}
      <div
        style={{
          height: '420px',
          overflowY: 'auto',
          padding: '20px',
          background: t.bg,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', maxWidth: '560px', textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>✨</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700', color: t.text }}>
              আসসালামু আলাইকুম, {user?.name || 'Zim'}!
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: t.subText, lineHeight: '1.6' }}>
              কোর্স, প্রোগ্রামিং, ডাটাবেজ বা আপনার স্টাডি টপিক নিয়ে সরাসরি প্রশ্ন করুন।
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => sendPrompt(item.text)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '999px',
                    border: `1px solid ${t.border}`,
                    background: t.cardBg,
                    color: t.text,
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user';
              const isError = m.sender === 'error';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      background: isUser
                        ? 'linear-gradient(135deg, #f97316, #ea580c)'
                        : isError
                        ? 'rgba(239, 68, 68, 0.15)'
                        : t.cardBg,
                      color: isUser ? '#fff' : isError ? '#ef4444' : '#f97316',
                      border: isUser ? 'none' : `1px solid ${isError ? '#ef4444' : t.border}`
                    }}
                  >
                    {isUser ? (user?.name?.[0]?.toUpperCase() || 'U') : isError ? '!' : '🤖'}
                  </div>

                  <div style={{ maxWidth: '78%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: isUser ? 'flex-end' : 'space-between',
                        gap: '8px',
                        marginBottom: '4px',
                        fontSize: '11px',
                        color: t.subText
                      }}
                    >
                      <span>{isUser ? (user?.name || 'You') : isError ? 'System Error' : 'AI Assistant'}</span>
                      <span>{m.time}</span>
                    </div>

                    <div
                      style={{
                        padding: '12px 15px',
                        borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                        background: isUser
                          ? 'linear-gradient(135deg, #f97316, #ea580c)'
                          : isError
                          ? 'rgba(239, 68, 68, 0.1)'
                          : t.cardBg,
                        color: isUser ? '#fff' : isError ? '#f87171' : t.text,
                        border: isUser ? 'none' : `1px solid ${isError ? 'rgba(239, 68, 68, 0.4)' : t.border}`,
                        fontSize: '13.5px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {m.text}
                    </div>

                    {!isUser && !isError && (
                      <div style={{ marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleCopy(m.text, idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedIdx === idx ? '#10b981' : t.subText,
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '2px 4px'
                          }}
                        >
                          {copiedIdx === idx ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div style={{ fontSize: '12.5px', color: t.subText, paddingLeft: '42px' }}>
                🤖 AI উত্তর তৈরি করছে...
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '14px 18px',
          borderTop: `1px solid ${t.border}`,
          background: t.cardBg,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}
      >
        <textarea
          rows={2}
          placeholder="Type your question here... (Enter to send, Shift+Enter for new line)"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendPrompt(inputMessage);
            }
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${t.border}`,
            background: t.bg,
            color: t.text,
            fontSize: '13.5px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isSending || !inputMessage.trim()}
          style={{
            padding: '11px 22px',
            height: '44px',
            background: isSending || !inputMessage.trim() ? t.border : '#f97316',
            color: isSending || !inputMessage.trim() ? t.subText : '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: isSending || !inputMessage.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default AiChatbot;