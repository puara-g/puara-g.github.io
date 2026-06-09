import React from 'react';
import { DEFAULT_COVER } from '../App';

// 공통 도서 카드 컴포넌트 (그리드용)
export default function BookCard({ book, rank, onAddToLibrary }) {
  return (
    <div className="book-card-container">
      {rank != null && <span className="rank-badge">{rank}</span>}
      <div className="book-card">
        <div className="book-cover" style={{ padding: 0 }}>
          <img
            src={book.thumbnail}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = DEFAULT_COVER; }}
          />
        </div>
        <div className="book-info">
          <p className="book-title">{book.title}</p>
          <p className="book-author">{book.authors}</p>
          {book.publishedDate && (
            <p className="book-tags">{book.publishedDate.slice(0, 7)}</p>
          )}
        </div>
      </div>
      {onAddToLibrary && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[
            { key: 'want',      label: '찜',   title: '찜 도서에 담기',  bg: '#eef2ff', color: '#4f46e5' },
            { key: 'reading',   label: '독서중', title: '독서중으로 담기', bg: '#fffbeb', color: '#d97706' },
            { key: 'completed', label: '완독',  title: '완독 목록에 담기', bg: '#ecfdf5', color: '#059669' },
          ].map(({ key, label, title, bg, color }) => (
            <button
              key={key}
              title={title}
              onClick={() => onAddToLibrary(book, key)}
              style={{
                flex: 1, padding: '5px 0', border: 'none', borderRadius: 4,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', background: bg, color,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
