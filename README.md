# 파일 확장자 차단

<img width="1346" height="583" alt="Image" src="https://github.com/user-attachments/assets/1be59a47-a8e6-40ea-a542-a1ef1a765471" />

<br/>

## 사이트 바로가기

- **사이트**: http://3.38.191.18:3000/
- **API 문서 (Swagger)**: http://3.38.191.18:3000/api-docs

<br/>

## 기능 개요

### 테이블 스키마

> 고정 확장자와 커스텀 확장자를 상태 플래그(`is_fixed`, `is_blocked`)로 구분하여 <br/>
> 단일 테이블에서 일관되게 관리하도록 설계함 <br/>

| 컬럼명       | 타입             | NULL | 기본값            | 설명                      |
| ------------ | ---------------- | ---- | ----------------- | ------------------------- |
| `id`         | integer (SERIAL) | ❌   | 시퀀스            | 확장자 고유 ID            |
| `name`       | varchar(200)     | ❌   |                   | 확장자 이름 (UNIQUE)      |
| `is_fixed`   | boolean          | ❌   | false             | 고정 / 커스텀 확장자 구분 |
| `is_blocked` | boolean          | ❌   | true              | 차단 여부                 |
| `created_at` | timestamp        | ⭕   | CURRENT_TIMESTAMP | 생성 시각                 |
| `deleted_at` | timestamp        | ⭕   |                   | Soft Delete용 컬럼 (옵션) |

<details>
<summary>컬럼별 설계 의도</summary>

### is_fixed
- 고정 확장자 / 커스텀 확장자 구분 플래그
    - true → 고정 확장자
    - false → 커스텀 확장자
- 하나의 테이블에서 확장자 타입을 상태값으로 구분하여 관리

### is_blocked
- 확장자 차단 여부를 나타내는 플래그
- 생성 시 기본값은 true
- 고정 확장자의 경우
→ 사용자가 체크 해제 시 is_blocked = false로 변경
실제 차단 로직에서 직접 사용하는 컬럼

### deleted_at
- Soft Delete 확장을 고려해 컬럼만 포함
- 실제 서비스에서 삭제 이력까지 관리해야 한다면 Soft Delete가 필요
- 본 과제에서는 요구사항 범위를 고려해 Hard Delete로 처리
    - 커스텀 확장자: 삭제 시 테이블에서 완전히 제거
    - 고정 확장자: 삭제 개념 없이 항상 유지

</details>

<details>
<summary>테이블 사진 캡쳐본</summary>

<img width="1081" height="272" alt="Image" src="https://github.com/user-attachments/assets/5330b1ec-f238-477b-bd9a-8e7953e42b8b" />

</details>

<br/>

| 구분          | 설명                                                                     | 조작                            |
| ------------- | ------------------------------------------------------------------------ | ------------------------------- |
| 고정 확장자   | DB에 사전 등록된 확장자 (`bat`, `cmd`, `com`, `cpl`, `exe`, `scr`, `js`) | 추가 불가 / 체크 상태만 변경    |
| 커스텀 확장자 | 사용자가 직접 관리하는 확장자                                            | 추가·삭제 가능 / 중복 등록 불가 |

<br/>

## 기술 스택 및 환경

- **서버**: Node.js + Express
- **템플릿 엔진**: 서버 사이드 렌더링
- **개발 환경**: 서버 + 로컬 PostgreSQL
- **배포 환경**: AWS EC2 + AWS RDS (PostgreSQL)

<br/>

## 구현 시 고려 사항

- 대소문자 무시 처리 (`EXE` / `exe` 동일)
- 커스텀 확장자 중복 입력 방지
- 고정 확장자 재추가 시 에러 처리
- 입력값 앞뒤 공백 제거
- 특수문자 입력 제한 (영문, 숫자만 허용)
- 확장자 입력 글자 수 실시간 카운팅 (~200)
