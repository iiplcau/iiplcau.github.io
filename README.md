# IIPL 홈페이지

중앙대학교 지능형 정보처리 연구실(IIPL) 홈페이지입니다. GitHub Pages로 배포되며, 주소는 https://iiplcau.github.io 입니다.

## 내용 업데이트

HTML을 고칠 필요 없이 아래 데이터 파일만 수정하면 됩니다. GitHub에서 파일을 열고 연필 아이콘으로 편집한 뒤 Commit하면 1~2분 안에 사이트에 반영됩니다.

| 파일 | 내용 |
| --- | --- |
| `publications.json` | 논문 목록. 위에 있을수록 최신으로 표시됩니다 |
| `news.json` | 홈 화면의 소식. 위에서 6개가 먼저 보입니다 |
| `people.json` | 멤버 목록 (그룹별) |
| `projects.json` | 연구 과제 목록. 홈 화면의 진행 과제 수도 여기서 계산됩니다 |
| `gallery.json` | Gallery 페이지의 행사별 사진 목록. 사진 파일은 `gallery/` 폴더에 있습니다 |

### 논문 추가 예시

`publications.json` 맨 앞(`[` 바로 다음)에 아래 형식으로 추가하고, 항목 사이에 쉼표를 넣어 주세요.

```json
{
  "title": "Paper Title",
  "authors": "First Author, Second Author, YoungBin Kim",
  "venue": "The 2027 Conference on ... (ACL 2027)",
  "badge": "ACL 2027",
  "type": "conference",
  "year": 2027,
  "tags": ["Findings"],
  "links": [{ "label": "Paper", "url": "https://aclanthology.org/..." }]
},
```

- `type`: `conference`, `journal`, `workshop` 중 하나
- `tags`: `Findings`, `Oral`, `Spotlight`, `Demo`, `Short` 등. 없으면 `[]`
- `links`: 없으면 `[]`
- 홈 화면의 "Recent acceptances"와 논문 수, People 페이지의 "Recent" 표시는 이 파일에서 자동으로 계산됩니다.

### 소식 추가 예시

```json
{ "year": "2027", "kind": "Paper", "text": "Three papers accepted to ACL 2027." },
```

`kind`는 `Paper`, `Award`, `Grant`, `Service` 중 하나입니다.

### 멤버 추가 예시

```json
{ "ko": "홍길동", "en": "Gildong Hong", "photo": "", "homepage": "" }
```

사진은 정사각형에 가까운 JPG를 저장소에 올리고 `"photo": "photo-gildong-hong.jpg"`처럼 파일 이름을 적으면 됩니다.

### 과제 추가 예시

```json
{ "title": "과제명", "funder": "한국연구재단 중견연구", "period": "2026~2029", "role": "연구책임자", "status": "ongoing" },
```

- `role`: `연구책임자` 또는 `공동연구원`
- `status`: 진행 중이면 `ongoing`, 끝나면 `completed`로 바꾸면 됩니다

### 사진 추가 예시

1. 사진을 가로 1200px 정도의 JPG로 줄여 `gallery/` 폴더에 올립니다 (예: `gallery/2026-11-emnlp-1.jpg`)
2. `gallery.json` 맨 앞에 행사를 추가합니다

```json
{
  "date": "2026.11",
  "title": "EMNLP 2026",
  "place": "City, Country",
  "photos": [
    { "src": "gallery/2026-11-emnlp-1.jpg", "w": 1200, "h": 900 }
  ]
},
```

`w`, `h`는 사진의 가로, 세로 픽셀 크기입니다. 대략적인 값이어도 괜찮습니다.

GitHub 웹 화면에서는 한 번에 100개까지만 올릴 수 있으니 사진이 많으면 나눠서 올려 주세요.

## 주의

- JSON은 쉼표 하나만 빠져도 해당 섹션이 표시되지 않습니다. 수정 후 사이트에서 확인하고, 문제가 있으면 직전 커밋으로 되돌리면 됩니다.
- 연구 주제, 교수 소개, 모집 안내 같은 고정 문구는 `index.html`과 `people.html`에 있습니다.
