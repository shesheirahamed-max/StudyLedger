import React, { useState } from 'react';
import { LEARNING_HUB_DATA } from '../data/learningHubData';

const API_BASE = 'http://localhost:5000';

export default function LearningHub({ user }) {
  const [selectedCourse, setSelectedCourse] = useState(LEARNING_HUB_DATA[0]);
  const [activeLesson, setActiveLesson] = useState(LEARNING_HUB_DATA[0].lessons[0]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [seenQuestions, setSeenQuestions] = useState([]);

  const handleSelectLesson = (course, lesson) => {
    setSelectedCourse(course);
    setActiveLesson(lesson);
    setQuizQuestions([]);
    setSelectedAnswers({});
    setSubmitted(false);
    setQuizError('');
  };

  const handleGenerateQuiz = async (count = 10) => {
    if (!activeLesson) return;
    setLoadingQuiz(true);
    setQuizError('');
    setSubmitted(false);
    setSelectedAnswers({});

    try {
      const res = await fetch(`${API_BASE}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          courseTitle: selectedCourse.title,
          lessonTitle: activeLesson.title,
          count,
          avoidQuestions: seenQuestions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'কুইজ লোড করা যায়নি।');
      }

      const freshQuestions = Array.isArray(data.questions) ? data.questions : [];
      setQuizQuestions(freshQuestions);

      const newTexts = freshQuestions.map((q) => q.question).filter(Boolean);
      setSeenQuestions((prev) => [...prev, ...newTexts]);
    } catch (err) {
      setQuizError(err.message);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const score = quizQuestions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.answerIndex ? 1 : 0);
  }, 0);

  return (
    <div style={{ padding: '24px', color: '#f3f4f6' }}>
      <h2>Learning Hub & Practice Platform</h2>

      {/* কোর্স ও লেসন কার্ড */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {LEARNING_HUB_DATA.map((course) => (
          <div
            key={course.courseId}
            style={{
              background: '#141416',
              border: '1px solid #2a2a30',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <h3 style={{ marginTop: 0 }}>{course.title}</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>{course.subtitle}</p>
            <ul style={{ paddingLeft: '18px', margin: 0 }}>
              {course.lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <li key={lesson.id} style={{ marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleSelectLesson(course, lesson)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: isActive ? '#fb923c' : '#f97316',
                        fontWeight: isActive ? 700 : 500,
                        textAlign: 'left'
                      }}
                    >
                      {lesson.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* অ্যাক্টিভ লেসন: ওয়েবসাইট রিসোর্স লিংক + ডাইনামিক কুইজ */}
      {activeLesson && (
        <div
          style={{
            background: '#141416',
            border: '1px solid #2a2a30',
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <h3>
            {selectedCourse.title} — {activeLesson.title}
          </h3>
          <p style={{ color: '#d1d5db' }}>
            নিচের নির্ভরযোগ্য রিসোর্স লিংকগুলো থেকে বিস্তারিত পড়ো, তারপর নিচ থেকে নতুন কুইজ তৈরি করে অনুশীলন করো:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {activeLesson.resources.map((resItem) => (
              <a
                key={resItem.url}
                href={resItem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#1f2937',
                  color: '#60a5fa',
                  textDecoration: 'none',
                  fontSize: '14px',
                  border: '1px solid #374151'
                }}
              >
                {resItem.label} ↗
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              disabled={loadingQuiz}
              onClick={() => handleGenerateQuiz(10)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#ea580c',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {loadingQuiz ? 'নতুন প্রশ্ন তৈরি হচ্ছে...' : 'Generate New Quiz (10 Questions)'}
            </button>

            {quizQuestions.length > 0 && !submitted && (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #4b5563',
                  background: '#111827',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Submit Quiz
              </button>
            )}
          </div>

          {quizError && (
            <div style={{ color: '#f87171', marginBottom: '12px' }}>{quizError}</div>
          )}

          {submitted && quizQuestions.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#064e3b',
                color: '#ecfdf5',
                marginBottom: '16px',
                fontWeight: 600
              }}
            >
              Score: {score} / {quizQuestions.length} — আরও ভিন্ন প্রশ্ন পেতে "Generate New Quiz" চাপো।
            </div>
          )}

          {quizQuestions.map((q, qIdx) => (
            <div
              key={q.id || qIdx}
              style={{
                borderTop: '1px solid #27272a',
                paddingTop: '14px',
                marginTop: '14px'
              }}
            >
              <p style={{ fontWeight: 600 }}>
                {qIdx + 1}. {q.question}
              </p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {(q.options || []).map((opt, oIdx) => {
                  const isChosen = selectedAnswers[qIdx] === oIdx;
                  return (
                    <label
                      key={oIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        color: '#e5e7eb'
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${qIdx}`}
                        checked={isChosen}
                        onChange={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <p style={{ color: '#93c5fd', fontSize: '14px', marginTop: '8px' }}>
                  ব্যাখ্যা: {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}