import React, { useState, useEffect } from 'react';
import { fetchBooks } from '../App';
import BookCard from './BookCard';

const YEAR = new Date().getFullYear();
const MONTH = new Date().getMonth() + 1;
// 이달 기준 YYYY-MM prefix (예: "2026-06")
const THIS_MONTH_PREFIX = `${YEAR}-${String(MONTH).padStart(2, '0')}`;
// 이전 달까지 허용 범위 (최근 2달, 이달 책이 부족할 경우 대비)
const PREV_MONTH = MONTH === 1 ? 12 : MONTH - 1;
const PREV_YEAR = MONTH === 1 ? YEAR - 1 : YEAR;
const PREV_MONTH_PREFIX = `${PREV_YEAR}-${String(PREV_MONTH).padStart(2, '0')}`;

// 한국 독자 기반 신작 쿼리 - 이달 신간 키워드 중심
const NEW_QUERIES = [
  `한국 소설 신간 ${YEAR}년 ${MONTH}월`,
  `에세이 신간 ${YEAR}년 ${MONTH}월 한국`,
  `한국 문학 신작 ${YEAR}`,
  `자기계발 신간 ${YEAR} 한국`,
  `인문 교양 신간 ${YEAR}`,
];

export default function NewBooks({ onAddToLibrary, preview }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const count = preview || 12;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all(
      NEW_QUERIES.slice(0, 4).map((q) =>
        fetchBooks(q, Math.ceil(count / 2) + 4, 0, 'newest').catch(() => [])
      )
    ).then((results) => {
      if (cancelled) return;
      const seen = new Set();
      const allBooks = results
        .flat()
        .filter((b) => {
          if (seen.has(b.id)) return false;
          seen.add(b.id);
          return true;
        })
        .filter((b) => {
          const hasKorean = /[가-힣]/.test(b.title) || /[가-힣]/.test(b.authors);
          return hasKorean || b.publishedDate >= `${YEAR}`;
        })
        .sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''));

      // 이달(THIS_MONTH_PREFIX)에 출판된 책만 표시
      const filtered = allBooks.filter((b) => b.publishedDate.startsWith(THIS_MONTH_PREFIX));
      setBooks(filtered.slice(0, count));
    }).catch(() => {
      if (!cancelled) setError('신작 정보를 불러오지 못했습니다.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [count]);

  if (loading) return <SkeletonGrid count={count} />;
  if (error) return <p style={{ color: '#e11d48' }}>{error}</p>;

  return (
    <>
      {!preview && (
        <>
          <h2 className="page-title">📚 이달의 신작</h2>
          <p style={{ color: '#666', marginBottom: 24, marginTop: -16 }}>
            {YEAR}년 {MONTH}월 출판 도서
          </p>
        </>
      )}
      <div className="book-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onAddToLibrary={onAddToLibrary} />
        ))}
      </div>
    </>
  );
}

function SkeletonGrid({ count }) {
  return (
    <div className="book-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="book-card-container">
          <div className="book-card" style={{ opacity: 0.5 }}>
            <div className="book-cover" style={{ background: '#e2e8f0' }} />
            <div className="book-info">
              <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 12, background: '#e2e8f0', borderRadius: 4, width: '60%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}