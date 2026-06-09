import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_COVER } from '../App';

const TABS = [
  { key: 'want',      label: '찜 도서' },
  { key: 'reading',   label: '독서중'  },
  { key: 'completed', label: '완독'    },
];

export default function MyLibrary({ library, setLibrary }) {
  const [activeTab, setActiveTab] = useState('want');
  const books = library[activeTab] || [];

  const handleRemove = (id) => {
    setLibrary((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((b) => b.id !== id) }));
  };

  const handleMove = (book, to) => {
    setLibrary((prev) => {
      const cleaned = {
        want: prev.want.filter((b) => b.id !== book.id),
        reading: prev.reading.filter((b) => b.id !== book.id),
        completed: prev.completed.filter((b) => b.id !== book.id),
      };
      cleaned[to].push(book);
      return cleaned;
    });
  };

  const handleTimeUpdate = (id, seconds) => {
    setLibrary((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((b) =>
        b.id === id ? { ...b, readingTime: (b.readingTime || 0) + seconds } : b
      ),
    }));
  };

  const total = library.want.length + library.reading.length + library.completed.length;

  return (
    <div>
      {/* 서재 헤더 */}
      <div className="mypage-greeting-card">
        <h2>📚 내 서재</h2>
        <p>총 <strong>{total}권</strong> 담겨 있어요</p>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              paddingBottom: 12, fontWeight: 700, fontSize: 16,
              color: activeTab === key ? 'var(--ridi-blue)' : '#94a3b8',
              borderBottom: activeTab === key ? '2px solid var(--ridi-blue)' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {label} ({library[key].length})
          </button>
        ))}
      </div>

      {/* 도서 목록 */}
      {books.length === 0 ? (
        <div className="mypage-empty-dashed">
          <p style={{ fontSize: 36 }}>📭</p>
          <p>아직 담은 책이 없어요. 마음에 드는 책을 찾아보세요!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {books.map((book) => (
            <LibraryItem
              key={book.id}
              book={book}
              activeTab={activeTab}
              onRemove={handleRemove}
              onMove={handleMove}
              onTimeUpdate={handleTimeUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 서재 가로 아이템 ─────────────────────────────────────────
function LibraryItem({ book, activeTab, onRemove, onMove, onTimeUpdate }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const start = () => {
    if (running) return;
    startRef.current = Date.now() - elapsed * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    setRunning(true);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    if (elapsed > 0) { onTimeUpdate(book.id, elapsed); setElapsed(0); }
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0 ? `${h}시간 ${m}분 ${sec}초` : `${m}분 ${sec}초`;
  };

  const moveTargets = TABS.filter((t) => t.key !== activeTab);

  return (
    <div style={{
      display: 'flex', gap: 20, padding: '20px 24px',
      background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <img
        src={book.thumbnail || DEFAULT_COVER}
        alt={book.title}
        style={{ width: 80, height: 112, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
        onError={(e) => { e.target.src = DEFAULT_COVER; }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>{book.title}</p>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 10px' }}>{book.authors}</p>

        {/* 독서 시간 */}
        <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 10 }}>
          누적 독서 시간: <span style={{ fontWeight: 600, color: 'var(--ridi-blue)' }}>{fmt(book.readingTime || 0)}</span>
          {running && <span style={{ color: '#e11d48', marginLeft: 10, fontWeight: 600 }}>● {fmt(elapsed)}</span>}
        </div>

        {/* 타이머 (읽는중만) */}
        {activeTab === 'reading' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={start} disabled={running} style={btnStyle('#4f46e5', running)}>▶ 시작</button>
            <button onClick={stop} disabled={!running} style={btnStyle('#e11d48', !running)}>■ 정지·저장</button>
          </div>
        )}

        {/* 이동 / 삭제 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {moveTargets.map(({ key, label }) => (
            <button key={key} onClick={() => onMove(book, key)}
              style={{ padding: '5px 12px', border: '1px solid #e2e8f0', borderRadius: 4, background: '#f8fafc', fontSize: 12, cursor: 'pointer', color: '#475569' }}>
              {label}(으)로 이동
            </button>
          ))}
          <button onClick={() => onRemove(book.id)}
            style={{ padding: '5px 12px', border: '1px solid #fecaca', borderRadius: 4, background: '#fff1f2', fontSize: 12, cursor: 'pointer', color: '#e11d48' }}>
            🗑 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, disabled) {
  return {
    padding: '6px 16px', border: 'none', borderRadius: 4,
    background: bg, color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  };
}
