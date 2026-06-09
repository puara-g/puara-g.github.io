import React, { useState, useEffect, useRef } from 'react';
import { fetchBooks } from '../App';
import BookCard from './BookCard';

const YEAR = new Date().getFullYear();

const GENRES = [
  {
    key: 'novel',
    label: '소설',
    queries: [
      `한국 소설 베스트셀러 ${YEAR}`,
      '한국 소설 인기 문학상 수상',
      '한국소설 독자 추천 베스트',
    ],
  },
  {
    key: 'essay',
    label: '에세이',
    queries: [
      `한국 에세이 베스트셀러 ${YEAR}`,
      '한국 에세이 인기 힐링 위로',
      '한국 에세이 독자 추천',
    ],
  },
  {
    key: 'selfhelp',
    label: '자기계발',
    queries: [
      `자기계발 베스트셀러 한국 ${YEAR}`,
      '한국 자기계발 인기 습관 성공',
      '자기계발 독자 추천 베스트',
    ],
  },
  {
    key: 'history',
    label: '역사/인문',
    queries: [
      `한국사 역사 인문 베스트셀러 ${YEAR}`,
      '한국 역사 인문 교양 인기',
      '한국 인문학 독자 추천',
    ],
  },
  {
    key: 'science',
    label: '과학/교양',
    queries: [
      `과학 교양 베스트셀러 한국 ${YEAR}`,
      '한국 과학 교양 인기 추천',
      '과학 대중서 독자 베스트',
    ],
  },
  {
    key: 'economy',
    label: '경제/경영',
    queries: [
      `경제 경영 베스트셀러 한국 ${YEAR}`,
      '한국 재테크 투자 인기 도서',
      '경영 리더십 한국 독자 추천',
    ],
  },
  {
    key: 'children',
    label: '어린이/청소년',
    queries: [
      `한국 어린이 청소년 베스트셀러 ${YEAR}`,
      '한국 어린이 그림책 인기',
      '청소년 소설 한국 독자 추천',
    ],
  },
];

export default function BestSeller({ onAddToLibrary, preview }) {
  const [activeGenre, setActiveGenre] = useState(GENRES[0]);
  const cache = useRef({});
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const count = preview || 10;

  useEffect(() => {
    if (cache.current[activeGenre.key]) {
      setBooks(cache.current[activeGenre.key].slice(0, count));
      return;
    }
    let cancelled = false;
    setLoading(true);
    setBooks([]);

    Promise.all(
      activeGenre.queries.map((q) => fetchBooks(q, 8, 0, 'relevance').catch(() => []))
    ).then((results) => {
      if (cancelled) return;
      const seen = new Set();
      const merged = results.flat().filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      }).slice(0, 10);
      cache.current[activeGenre.key] = merged;
      setBooks(merged.slice(0, count));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeGenre, count]);

  return (
    <>
      {!preview && (
        <>
          <h2 className="page-title">🏆 장르별 베스트셀러 Top 10</h2>
          
        </>
      )}
      <div className="main-genre-tabs" style={{ paddingLeft: 0, flexWrap: 'wrap' }}>
        {GENRES.map((g) => (
          <button
            key={g.key}
            className={`main-genre-tab ${activeGenre.key === g.key ? 'active' : ''}`}
            onClick={() => setActiveGenre(g)}
          >
            {g.label}
          </button>
        ))}
      </div>
      {loading ? <SkeletonGrid count={count} /> : (
        <div className="book-grid">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} rank={i + 1} onAddToLibrary={onAddToLibrary} />
          ))}
        </div>
      )}
    </>
  );
}

function SkeletonGrid({ count }) {
  return (
    <div className="book-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="book-card-container">
          <div className="book-card" style={{ opacity: 0.4 }}>
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