import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import NewBooks from './components/NewBooks';
import BestSeller from './components/BestSeller';
import MoodRecommendation from './components/MoodRecommendation';
import MyLibrary from './components/MyLibrary';
import SearchResults from './components/SearchResults';

const API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
const API_BASE = 'https://www.googleapis.com/books/v1/volumes';

export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop';

export function normalizeBook(item) {
  const info = item.volumeInfo || {};
  return {
    id: item.id,
    title: info.title || '제목 없음',
    authors: info.authors ? info.authors.join(', ') : '저자 미상',
    description: info.description || '',
    thumbnail: info.imageLinks?.thumbnail?.replace('http://', 'https://') || DEFAULT_COVER,
    infoLink: info.infoLink || '#',
    categories: info.categories || [],
    publishedDate: info.publishedDate || '',
  };
}

// 저자 검색 여부 판단: "작가 김가현", "저자 김가현", "author 김가현" 형태만
// 한글 이름 단독 입력은 제목 검색과 구별 불가하므로 제외
export function isAuthorQuery(query) {
  return /^(작가|저자|author)\s+\S/i.test(query.trim());
}

// 저자명 추출: "작가 김가현" → "김가현"
export function extractAuthorName(query) {
  const m = query.trim().match(/^(작가|저자|author)\s+(.+)/i);
  return m ? m[2].trim() : null;
}

export async function fetchBooks(query, maxResults = 10, startIndex = 0, orderBy = '') {
  const trimmed = query.trim();
  let q = trimmed;

  const authorName = extractAuthorName(trimmed);
  if (authorName) {
    // 작가 이름으로 검색: inauthor + 이름 직접 병행
    q = `inauthor:"${authorName}" OR "${authorName}"`;
  }

  const params = new URLSearchParams({
    q,
    maxResults,
    startIndex,
    ...(orderBy ? { orderBy } : {}),
    ...(API_KEY && API_KEY !== '여기에_API_키_입력' ? { key: API_KEY } : {}),
  });
  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) throw new Error(`API 오류 ${res.status}`);
  const data = await res.json();
  return (data.items || []).map(normalizeBook);
}

// ─── 앱 루트 ─────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('home'); // home | newbooks | bestseller | mood | library | search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dropdownBooks, setDropdownBooks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // 마이 서재 상태 (LocalStorage)
  const [library, setLibrary] = useState(() => {
    try {
      const saved = localStorage.getItem('maum_library');
      return saved ? JSON.parse(saved) : { want: [], reading: [], completed: [] };
    } catch { return { want: [], reading: [], completed: [] }; }
  });

  useEffect(() => {
    localStorage.setItem('maum_library', JSON.stringify(library));
  }, [library]);

  // 헤더 검색 드롭다운 - 디바운스 300ms
  const handleSearchInput = useCallback((val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setDropdownBooks([]); setShowDropdown(false); return; }
    setShowDropdown(true);
    setDropdownLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const books = await fetchBooks(val, 5);
        setDropdownBooks(books);
      } catch { setDropdownBooks([]); }
      finally { setDropdownLoading(false); }
    }, 300);
  }, []);

  // 검색 실행 → search 뷰로 이동
  const handleSearch = (q) => {
    const query = (q || searchInput).trim();
    if (!query) return;
    setSearchQuery(query);
    setShowDropdown(false);
    setView('search');
  };

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const STATUS_LABEL = { want: '찜 도서', reading: '독서중', completed: '완독' };

  const handleAddToLibrary = (book, status) => {
    setLibrary((prev) => {
      const cleaned = {
        want: prev.want.filter((b) => b.id !== book.id),
        reading: prev.reading.filter((b) => b.id !== book.id),
        completed: prev.completed.filter((b) => b.id !== book.id),
      };
      cleaned[status].push({ ...book, readingTime: 0 });
      return cleaned;
    });
  };

  const totalBooks = library.want.length + library.reading.length + library.completed.length;

  const NAV_TABS = [
    { key: 'home',       label: '홈' },
    { key: 'newbooks',   label: '이달의 신작' },
    { key: 'bestseller', label: '베스트셀러' },
    { key: 'mood',       label: '기분 추천' },
    { key: 'library',    label: `내 서재 (${totalBooks})` },  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* ── 헤더 ── */}
      <header className="app-header">
        <div className="header-content">
          {/* 로고 */}
          <div className="header-left">
            <button
              className="logo"
              onClick={() => setView('home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, fontWeight: 'bold', color: 'var(--ridi-blue)' }}
            >
              마음서재
            </button>
          </div>

          {/* 검색바 + 드롭다운 */}
          <div className="header-center" ref={dropdownRef}>
            <div className="header-search-container">
              <div className="header-search-bar">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="책 제목 또는 작가 이름 검색..."
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => searchInput && setShowDropdown(true)}
                />
              </div>

              {/* 드롭다운 */}
              {showDropdown && (
                <div className="search-dropdown">
                  <div className="dropdown-header">검색 결과</div>
                  <div className="dropdown-list">
                    {dropdownLoading ? (
                      <div className="dropdown-empty">검색 중…</div>
                    ) : dropdownBooks.length === 0 ? (
                      <div className="dropdown-empty">결과가 없습니다</div>
                    ) : (
                      dropdownBooks.map((book) => (
                        <div
                          key={book.id}
                          className="dropdown-item"
                          onClick={() => handleSearch(book.title)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="dropdown-cover">
                            <img src={book.thumbnail} alt={book.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                              onError={(e) => { e.target.src = DEFAULT_COVER; }}
                            />
                          </div>
                          <div className="dropdown-info">
                            <div className="dropdown-title">{book.title}</div>
                            <div className="dropdown-author">{book.authors}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 우측 네비게이션 */}
          <div className="header-right">
            <nav className="nav-links">
              {NAV_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 15,
                    color: view === key ? 'var(--ridi-blue)' : '#404040',
                    borderBottom: view === key ? '2px solid var(--ridi-blue)' : '2px solid transparent',
                    padding: '4px 4px 2px',
                    marginLeft: 20,
                    transition: 'color 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <main className="app-main">
        {view === 'home' && <HomePage setView={setView} onAddToLibrary={handleAddToLibrary} />}
        {view === 'newbooks' && <NewBooks onAddToLibrary={handleAddToLibrary} />}
        {view === 'bestseller' && <BestSeller onAddToLibrary={handleAddToLibrary} />}
        {view === 'mood' && <MoodRecommendation onAddToLibrary={handleAddToLibrary} />}
        {view === 'library' && <MyLibrary library={library} setLibrary={setLibrary} />}
        {view === 'search' && <SearchResults query={searchQuery} onAddToLibrary={handleAddToLibrary} />}
      </main>

      <footer className="app-footer">
        <p>© 2025 마음서재 · Google Books API 기반</p>
      </footer>
    </div>
  );
}

// ─── 홈 페이지 ────────────────────────────────────────────────
function HomePage({ setView, onAddToLibrary }) {
  const MOODS = [
    { emoji: '🌿', label: '힐링이 필요해요' },
    { emoji: '😔', label: '지치고 힘들어요' },
    { emoji: '🔥', label: '동기부여가 필요해요' },
    { emoji: '🧠', label: '지식을 쌓고 싶어요' },
    { emoji: '💕', label: '설레고 싶어요' },
    { emoji: '🌙', label: '조용히 쉬고 싶어요' },
  ];

  return (
    <div>
      {/* 감정 배너 */}
      <div className="main-banner">
        <h2>지금 어떤 기분이신가요? 📖</h2>
        <p>기분을 선택하면 딱 맞는 책을 추천해드려요</p>
        <div className="emotion-btn-container">
          {MOODS.map(({ emoji, label }) => (
            <button
              key={label}
              className="emotion-pulse-btn"
              onClick={() => setView('mood')}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* 이달의 신작 미리보기 */}
      <section className="section-wrapper">
        <button
          className="section-title-link"
          onClick={() => setView('newbooks')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          이달의 신작 &nbsp;›
        </button>
        <NewBooks onAddToLibrary={onAddToLibrary} preview={4} />
      </section>

      {/* 베스트셀러 미리보기 */}
      <section className="section-wrapper">
        <button
          className="section-title-link"
          onClick={() => setView('bestseller')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          장르별 베스트셀러 &nbsp;›
        </button>
        <BestSeller onAddToLibrary={onAddToLibrary} preview={4} />
      </section>
    </div>
  );
}