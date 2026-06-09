import React, { useState, useRef } from 'react';
import { fetchBooks } from '../App';
import BookCard from './BookCard';

const MOODS = [
  {
    emoji: '🌿',
    label: '힐링',
    desc: '지친 마음을 달래주는 책',
    queries: [
      '혜민 스님 멈추면 비로소 힐링 에세이',
      '한국 힐링 에세이 위로 치유',
      '나태주 풀꽃 시 에세이 감성',
      '유기농 마음 치유 에세이 한국',
      '정호승 시 위로 감동 에세이',
      '숲 자연 치유 에세이 한국',
      '천천히 살기 힐링 에세이',
    ],
  },
  {
    emoji: '😔',
    label: '지침',
    desc: '딱 필요한 위로 한마디',
    queries: [
      '번아웃 위로 공감 에세이 한국',
      '괜찮아 위로 힐링 한국 에세이',
      '혼자가 편한 사람 위로 책',
      '지친 마음 공감 에세이 한국',
      '우울 회복 심리 자기돌봄 한국',
      '김수현 나는 나로 살기로 했다',
      '마음이 힘들 때 한국 에세이',
    ],
  },
  {
    emoji: '🔥',
    label: '동기부여',
    desc: '다시 불타오를 책',
    queries: [
      '원씽 미라클모닝 자기계발 한국',
      '습관의 힘 아침 루틴 자기계발',
      '한국 자기계발 동기부여 성공',
      '도전 열정 성공 스토리 한국',
      '김미경 드림온 동기부여 한국',
      '목표 달성 성장 한국 자기계발',
      '마인드셋 성공 자기계발 베스트',
    ],
  },
  {
    emoji: '🧠',
    label: '지식',
    desc: '머리가 꽉 차는 책',
    queries: [
      '정재승 과학 콘서트 교양',
      '유발 하라리 사피엔스 한국어',
      '한국 인문 교양 지식 베스트셀러',
      '역사 철학 교양 한국 추천',
      '김상욱 떨림과 울림 과학 교양',
      '인문학 교양 한국 독자 추천',
      '세계사 한국사 교양 지식 도서',
    ],
  },
  {
    emoji: '💕',
    label: '설렘',
    desc: '두근두근 설레는 책',
    queries: [
      '한국 로맨스 소설 설렘 청춘',
      '첫사랑 청춘 한국 소설 감성',
      '박상영 알아가는 중입니다 로맨스',
      '한국 연애 소설 베스트셀러',
      '감성 로맨스 청춘 한국 소설',
      '두근두근 사랑 이야기 한국',
      '설레는 사랑 한국 소설 추천',
    ],
  },
  {
    emoji: '🌙',
    label: '고요함',
    desc: '밤에 혼자 읽기 좋은 책',
    queries: [
      '잔잔한 한국 소설 감성 문학',
      '김애란 달려라 아비 한국 단편',
      '밤에 읽는 한국 소설 에세이',
      '서정적 감성 한국 문학 추천',
      '조용한 일상 에세이 한국 감성',
      '이기호 최은영 한국 단편소설',
      '혼자만의 시간 한국 에세이 감성',
    ],
  },
];

export default function MoodRecommendation({ onAddToLibrary }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const queryIndexRef = useRef({});

  const handleSelect = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setLoaded(false);
    setBooks([]);

    const prev = queryIndexRef.current[mood.label] ?? -1;
    const nextIdx = (prev + 1) % mood.queries.length;
    queryIndexRef.current[mood.label] = nextIdx;
    const idx2 = (nextIdx + 1) % mood.queries.length;
    const startIndex = Math.floor(Math.random() * 4) * 2;

    try {
      const [r1, r2] = await Promise.all([
        fetchBooks(mood.queries[nextIdx], 10, startIndex).catch(() => []),
        fetchBooks(mood.queries[idx2], 8, 0).catch(() => []),
      ]);
      const seen = new Set();
      const merged = [...r1, ...r2].filter((b) => {
        if (seen.has(b.id)) return false;
        seen.add(b.id);
        return true;
      });
      for (let i = merged.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [merged[i], merged[j]] = [merged[j], merged[i]];
      }
      setBooks(merged.slice(0, 8));
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  return (
    <div>
      <div className="main-banner">
        <h2>지금 어떤 기분이신가요? 📖</h2>
        <p>기분을 선택하면 딱 맞는 책을 추천해드려요 · 같은 기분을 다시 누르면 새로운 책이 나와요</p>
        <div className="emotion-btn-container">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              className="emotion-pulse-btn"
              style={
                selectedMood?.label === mood.label
                  ? { background: 'var(--ridi-blue)', color: '#fff', borderColor: 'var(--ridi-blue)' }
                  : {}
              }
              onClick={() => handleSelect(mood)}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="book-grid">
          {Array.from({ length: 8 }).map((_, i) => (
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
      )}

      {!loading && loaded && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {selectedMood?.emoji} '{selectedMood?.label}' 기분에 어울리는 책
            </h3>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{selectedMood?.desc}</span>
            <button
              onClick={() => handleSelect(selectedMood)}
              style={{
                marginLeft: 'auto', padding: '5px 14px',
                border: '1px solid var(--ridi-blue)', borderRadius: 20,
                background: '#fff', color: 'var(--ridi-blue)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              🔄 다른 책 보기
            </button>
          </div>
          {books.length === 0 ? (
            <p className="no-data">추천 결과가 없습니다. 다른 기분을 선택해보세요.</p>
          ) : (
            <div className="book-grid">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onAddToLibrary={onAddToLibrary} />
              ))}
            </div>
          )}
        </>
      )}

      {!loaded && !loading && (
        <div className="no-data" style={{ paddingTop: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>☝️</p>
          <p style={{ fontSize: 16, color: '#64748b' }}>위에서 지금 기분을 선택해보세요</p>
        </div>
      )}
    </div>
  );
}
