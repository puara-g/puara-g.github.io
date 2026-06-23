# 📚 마음서재 (Maum Library)

> **실시간 구글 북스 API 기반 맞춤형 감정 도서 추천 플랫폼**
> 
> 실제 독자들의 실시간 검색 트렌드와 인기 데이터를 바탕으로 사용자의 현재 기분에 맞는 책을 추천하고, 독서 효율을 높여주는 내 서재 타이머를 제공하는 힐링 도서 플랫폼입니다.

<br>

## 🙌 팀원 소개

| 💻 Frontend & Backend | 💻 Frontend & Backend |
| :---: | :---: |
| 🐰 **김가현** <br> [@puara-g](https://github.com/puara-g) | 🐻 **이영빈** <br> - |

<br>

## 🔮 Tech Stack

본 프로젝트의 구현과 지속 가능한 개발을 위해 사용된 기술 스택 및 라이브러리 의존성 정보입니다.

### 🗣 Languages & Frameworks
| 이름 | 설명 |
| :--- | :--- |
| **JavaScript (ES6+)** | 애플리케이션 핵심 비즈니스 로직 구현 언어 |
| **HTML5 / CSS3** | 시각적 스캐너빌리티(Scannability)와 중앙 정렬 레이아웃을 위한 웹 마크업 및 스타일링 |
| **React** | 컴포넌트 기반 싱글 페이지 애플리케이션(SPA) 아키텍처 |

### 🧱 Libraries & Dependencies
| 이름 | 버전 | 설명 |
| :--- | :---: | :--- |
| **Google Books API** | Live | 전 세계 및 국내 구글 도서 데이터베이스 실시간 연동 |
| **LocalStorage** | 내장 | 유저 개인화 데이터(내 서재 상태, 누적 독서 시간) 유지를 위한 로컬 저장소 |

### 🛠 Tools
* **IDE:** Visual Studio / VS Code
* **VCS:** GitHub

<br>

## 🏗 Architecture & Core Logic

### 1. 컨트롤 타워 (`App.js`) 기반 중앙 상태 관리
* 무거운 외부 라우터 대신 React의 `useState`를 활용한 **State-based Routing**으로 가볍고 빠른 화면 전환을 구현했습니다.
* 공통 API 통신 함수(`fetchBooks`)를 최상위 컴포넌트에 배치하여 하위 컴포넌트 간의 **데이터 재사용성**을 극별화했습니다.

### 2. 실시간 한국 독자 타겟팅 필터링
* 고정된 하드코딩 도서 데이터가 아닌, 유동적 키워드 검색 후 정규식 패턴 검사를 실시간으로 거칩니다.
```javascript
// 검색 데이터 중 한글 서적만 정제하여 실시간 트렌드 반영
.filter((b) => /[가-힣]/.test(b.title) || /[가-힣]/.test(b.authors))
