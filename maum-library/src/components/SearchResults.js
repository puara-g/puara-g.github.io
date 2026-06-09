import React, { useState, useEffect } from 'react';
import { fetchBooks, isAuthorQuery, extractAuthorName, DEFAULT_COVER } from '../App';

export default function SearchResults({ query, onAddToLibrary }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError('');
    // 작가 검색이면 결과를 해당 저자 책만 필터링
    const authorName = extractAuthorName(query);

    fetchBooks(query, 20)
      .then((books) => {
        if (authorName) {
          // 저자명 포함된 책만 남기기 (부분 일치)
          const filtered = books.filter((b) =>
            b.authors && b.authors.toLowerCase().includes(authorName.toLowerCase())
          );
          setBooks(filtered.length > 0 ? filtered : books); // 필터 결과 없으면 전체
        } else {
          setBooks(books);
        }
      })
      .catch(() => setError('검색 중 오류가 발생했습니다.'))
      .finally(() => setLoading(false));
  }, [query]);

  const authorMode = isAuthorQuery(query);

  return (
    <div>
      <p className="search-query-text">
        {authorMode ? '✍️ 작가 ' : ''}<strong>"{query}"</strong> 검색 결과 {!loading && `(${books.length}건)`}
      </p>
      {authorMode ? (
        <p style={{ fontSize: 13, color: '#4f46e5', marginTop: -12, marginBottom: 20, background: '#eef2ff', padding: '6px 12px', borderRadius: 6, display: 'inline-block' }}>
          작가 이름으로 검색했어요 · 해당 저자의 책을 모아 보여드려요
        </p>
      ) : (
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: -12, marginBottom: 20 }}>
          💡 작가 이름만 입력하면 해당 작가의 책을 모아볼 수 있어요
        </p>
      )}

      {error && <p style={{ color: '#e11d48' }}>{error}</p>}

      {loading ? (
        <div className="search-list-container">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="search-list-item" style={{ opacity: 0.4 }}>
              <div className="search-list-cover" style={{ background: '#e2e8f0' }} />
              <div className="search-list-info">
                <div style={{ height: 20, background: '#e2e8f0', borderRadius: 4, marginBottom: 10, width: '50%' }} />
                <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <p className="no-data">검색 결과가 없습니다.</p>
      ) : (
        <div className="search-list-container">
          {books.map((book) => (
            <div key={book.id} className="search-list-item">
              <div className="search-list-cover">
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                  onError={(e) => { e.target.src = DEFAULT_COVER; }}
                />
              </div>
              <div className="search-list-info">
                <a href={book.infoLink} target="_blank" rel="noopener noreferrer" className="search-list-title">
                  {book.title}
                </a>
                <p className="search-list-author-genre">
                  {book.authors}
                  {book.publishedDate && <span style={{ marginLeft: 12, color: '#999' }}>{book.publishedDate.slice(0, 7)}</span>}
                </p>
                <p className="search-list-desc">
                  {book.description ? book.description.slice(0, 180) + (book.description.length > 180 ? '…' : '') : ''}
                </p>
                {/* 서재 담기 버튼 */}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {[
                    { key: 'want',      label: '찜',    bg: '#eef2ff', color: '#4f46e5' },
                    { key: 'reading',   label: '독서중', bg: '#fffbeb', color: '#d97706' },
                    { key: 'completed', label: '완독',   bg: '#ecfdf5', color: '#059669' },
                  ].map(({ key, label, bg, color }) => (
                    <button
                      key={key}
                      onClick={() => onAddToLibrary(book, key)}
                      style={{
                        padding: '6px 14px', border: 'none', borderRadius: 4,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', background: bg, color,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}