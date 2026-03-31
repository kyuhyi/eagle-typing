# BSD TYPING 스티치 디자인 5개 화면 요약

## 화면 1: 수련 모드 선택 (4카드)
- 자리연습(grid_view/primary), 낱말연습(auto_stories/tertiary), 단문연습(bolt/secondary), 장문연습(history_edu/error)
- card-bracket 스타일, hover:-translate-y-2
- 하단 장식 이미지 + 훈련 성과

## 화면 2: 자리 연습 던전 그리드 (8카드)
- 기본자리(keyboard/CLEARED), 왼손윗자리(auto_fix_normal), 왼손아랫자리(shield), 가운데자리(flare)
- 오른손윗자리(mountain_flag), 오른손아랫자리(volcano), 전체자리(workspace_premium/BOSS), 숫자자리(calculate)
- hero-bg 배경, Chapter 01 badge, glass-panel cards
- progress bar, CLEARED/LV.N/BOSS badges

## 화면 3: 낱말 연습 화면 (2컬럼)
- 좌: 중앙 단어 표시(text-[7rem]), 입력 필드, progress dots
- 우: 전투 통계 사이드바 (정확도/진행시간/타수), Active Buff 카드
- particle-bg 배경

## 화면 4: 단문 연습 화면 (2컬럼 + 사이드 액션)
- 상단 3개 스탯카드 (등급/정확도/콤보)
- 중앙: glass-panel 타이핑 캔버스, 문장+커서, 키보드 힌트, WPM 속도계
- 우측 플로팅: 다시시작/기록확인/종료 버튼
- bracket-left/right 스타일

## 화면 5: 장문 연습 화면 (고전 문학 스크롤)
- 좌: "THE GRAND CHRONICLE" 고대 두루마리 스타일
  - ornate corners(골드), CHAPTER I 헤더
  - 완료줄(골드/60%), 현재줄(text-3xl highlight), 미래줄(fade)
  - scroll-mask gradient
- 우: 최종 시련 현황 사이드바 (정확도/타수/시간), Progress Map, 액션버튼
- 장식: 동심원, 텍스처 오버레이
