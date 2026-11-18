import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'হ্যালো! StudyLedger বটে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // লোকালস্টোরেজ থেকে ইউজারের টোকেন চেক করা
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // নতুন চ্যাট হ্যান্ডলার ফাংশন (ব্যাকএন্ড API কানেক্টেড)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = inputMsg;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputMsg('');

    try {
      const response = await axios.post('http://localhost:5000/api/chat/message', {
        message: userMsg,
      });

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: response.data.reply }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'সার্ভারে সংযোগ স্থাপন করা সম্ভব হচ্ছে না।' }
      ]);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f6f9', fontFamily: 'Arial, sans-serif' }}>
      
      {/* সাইডবার */}
      <div style={{ width: '250px', background: '#343a40', color: '#fff', padding: '20px' }}>
        <h2>StudyLedger</h2>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
          <li style={{ padding: '10px 0', cursor: 'pointer' }}>📊 ড্যাশবোর্ড</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }}>📚 কোর্স ও লেসন</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }}>💰 বাজেট ও খরচ</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }}>📝 ফলাফল (Marks)</li>
        </ul>
      </div>

      {/* মেইন কন্টেন্ট এরিয়া */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto', position: 'relative' }}>
        <h1>ড্যাশবোর্ড ওভারভিউ</h1>
        <p>স্বাগতম! আপনার পড়াশোনা এবং অ্যাকাডেমিক কার্যক্রমের একটি এক নজর সারসংক্ষেপ এখানে দেখতে পাবেন।</p>

        {/* স্ট্যাট কার্ড */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>চলমান কোর্স</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>৪টি</p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>উপস্থিতি (Attendance)</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>৭৮%</p>
          </div>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>মাসিক বাজেট</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>৳ ৫,০০০</p>
          </div>
        </div>

        {/* --- এক কোণায় চ্যাটবট উইজেট (Floating Chat Widget) --- */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          {!chatOpen ? (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              💬 Study Bot
            </button>
          ) : (
            <div style={{
              width: '320px',
              height: '400px',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* চ্যাট হেডার */}
              <div style={{ background: '#007bff', color: '#fff', padding: '10px 15px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Study Bot</span>
                <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>✖</button>
              </div>

              {/* চ্যাট মেসেজ এরিয়া */}
              <div style={{ flex: 1, padding: '10px', overflowY: 'auto', fontSize: '14px', background: '#f9f9f9' }}>
                {messages.map((msg, index) => (
                  <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: msg.sender === 'user' ? '#007bff' : '#e2e3e5',
                      color: msg.sender === 'user' ? '#fff' : '#000'
                    }}>
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* চ্যাট ইনপুট ফর্ম */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="আপনার প্রশ্ন এখানে লিখুন..."
                  style={{ flex: 1, padding: '10px', border: 'none', outline: 'none' }}
                />
                <button type="submit" style={{ background: '#007bff', color: '#fff', border: 'none', padding: '0 15px', cursor: 'pointer' }}>পাঠান</button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;