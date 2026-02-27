# 🏗️ Welcome to TA!

<img width="250" height="250" alt="Ta-logo" src="https://github.com/user-attachments/assets/04150be0-355c-40c1-8060-7230d03766f3" />

Timwokr의 과제전형이라는 의미의 `Timwork-Assignment` 와 </br>
현장에 기술적으로 도움을 준다는 `Technical Assitant` 의 줄임말로 </br>
알파벳 `T` 와 `a` 를 타워크레인과 물체로 형상화 하여 로고를 제작했습니다.

# ❓ TA 서비스 요약

건축 도면을 공간 / 공종 / 리비전 별로 탐색하고 확대·축소 / 리비전 비교 / 공종 겹쳐보기 를 지원하는 도면 뷰어 웹 애플리케이션입니다.

## ↪️ 프로젝트 실행 방법

```bash
git clone https://github.com/seong5/TimworkAssignment.git
cd TimworkAssignment
npm install
npm run dev
```

## 💻 기술 스택

| 구분          | 기술                               |
| ------------- | ---------------------------------- |
| 언어          | TypeScript                         |
| 프레임워크    | React 18+                          |
| 빌드 도구     | Vite                               |
| 스타일링      | Tailwind CSS                       |
| 라우팅        | React Router                       |
| 상태 관리     | Zustand                            |
| 데이터 페칭   | TanStack Query                     |
| UI 라이브러리 | react-zoom-pan-pinch, lucide-react |

## ✅ 구현 기능

- [x] **메인 페이지**: 공간(101동, 주민공동시설, 주차장) 목록, 공간 검색, 최근 변경된 도면 확인
- [x] **도면 탐색**: 공간별 도면 트리, 브레드크럼 네비게이션, 공종·리비전 선택
- [x] **도면 뷰어**: 이미지 표시, Polygon 영역 클리핑, 확대/축소/팬, 보더 영역 안내 문구
- [x] **도면 검색**: 공종(건축, 소방 등) 키워드로 검색후 검색결과 클릭 시 해당 공종 도면 렌더링
- [x] **리비전 비교**: 좌우 패널 비교, Zoom/Pan 동기화, 변경사항·설명 표시
- [x] **겹쳐보기**: 여러 공종 레이어 겹침, 투명도 조절, OverlayLayerTree
- [x] **최신 리비전 배지**: 현재 도면이 최신 리비전일 때 표시
- [x] **반응형 레이아웃**: 모바일,태블릿,데스크톱 대응

## ❌ 미완성 기능

- [ ] 로직 분리 (일부만 적용, 전체는 미적용)
- [ ] 전체 도면 Polygon 좌표 미적용 (일부 도면은 기본 이미지로 렌더링)
- [ ] 반응형 웹 디테일한 수정 미적용
- [ ] 테스트 코드 미구현
