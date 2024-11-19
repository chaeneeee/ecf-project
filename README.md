
---

#  

# 📘 **ECF - 과제 README**  

#  

---

## 🛠️ **프로젝트 실행 방법**

### 1. **필수 모듈 설치**  
아래 명령어를 실행하여 프로젝트에 필요한 Node.js 모듈을 설치합니다

```bash
npm install
```  

### 2. **프로젝트 실행**  
애플리케이션 시작을 위해 아래 명렁어를 입력해주세요 

```bash
npm start
```  

---

## 🌐 **API 사용 방법**

### 1. **키워드 등록**  
- **유형**: `POST`  
- **URL**: `http://localhost:3000/search/keywords`  

#### **Request Body (회원)**  

```json
{
  "keyword": "티셔츠",
  "userId": "chaeneee",
  "age": 25,
  "gender": "male",
  "region": "Seoul"
}
```  

#### **Request Body (비회원)**  

```json
{
  "keyword": "티셔츠"
}
```  

#### **Response Body (회원)**  

```json
{
  "success": true,
  "data": {
    "keyword": "티셔츠",
    "createdAt": "2024-11-19T15:09:53.140Z"
  }
}
```  

#### **Response Body (비회원)**  

```json
{
  "success": true,
  "data": {
    "keyword": "티셔츠",
    "createdAt": "2024-11-19T14:53:01.177Z"
  }
}
```  

#### **응답 Status Code**  

| **Status Code** | **응답 본문**                                                                 |
|------------------|------------------------------------------------------------------------------|
| `201`           | 검색어가 성공적으로 저장되었습니다.                                           |
| `400`           | 요청에 검색어가 없거나 필수 데이터가 누락되었습니다.                          |
| `500`           | 서버에서 검색어 저장 중 예외 발생.                                           |  

---

### 2. **인기 검색어 조회**  
- **유형**: `GET`  
- **URL**: `http://localhost:3000/search/trending`  

#### **Response Body**  

```json
{
  "success": true,
  "data": [
    { "keyword": "티셔츠", "rank": 1, "score": 50 },
    { "keyword": "청바지", "rank": 2, "score": 30 }
  ]
}
```  

#### **응답 Status Code**  

| **Status Code** | **응답 본문**                                                         |
|------------------|----------------------------------------------------------------------|
| `200`           | 인기 검색어 목록이 성공적으로 반환되었습니다.                         |
| `500`           | Redis에서 인기 검색어 데이터를 가져오지 못하였습니다.                 |  

---

### 3. **데이터베이스 저장된 키워드 조회**  
- **유형**: `GET`  
- **URL**: `http://localhost:3000/search/db-keywords`  

#### **Response Body**  

```json
{
  "success": true,
  "data": [
    { "keyword": "티셔츠", "count": 50 },
    { "keyword": "청바지지", "count": 30 }
  ]
}
```  

#### **응답 Status Code**  

| **Status Code** | **응답 본문**                                                         |
|------------------|----------------------------------------------------------------------|
| `200`           | 데이터베이스 검색어 목록이 성공적으로 반환되었습니다.                  |
| `500`           | 데이터베이스에서 검색어 데이터를 가져오지 못한 경우.                   |  

---

## 🧩 **구현한 기능 목록**  

### 1. **키워드 저장**  
- **회원/비회원 구분 처리**:  
  - 회원: `userId`로 검색어 저장.  
  - 비회원: 클라이언트 IP 주소(`ip`)를 자동으로 추출하여 저장.  
  - 회원은 지역 데이터를 포함하고, 비회원은 IP 주소로 저장하여 지역별 데이터 활용 가능.  

- **검색어 중복 처리 방지**:  
  - Redis에 `search:userId` 또는 `search:ip` 형태로 사용자 키를 생성하고, 값(value)으로 사용자가 검색한 키워드 목록을 저장.  
  - Redis에 이미 등록된 식별자가 이미 등록된 value의 키워드를 검색하면
    검색 횟수(count)가 증가하지 않고 데이터베이스에 중복 저장하지 않음.
  - 새로운 검색어에 대해서만 Redis와 데이터베이스 업데이트.  

### 2. **Redis를 통한 인기 검색어 관리**  
- Redis의 `ZSET` 자료구조를 사용하여 검색어와 검색 횟수(`score`)를 저장.  
- `ZRANGE trending:keywords 0 9 WITHSCORES`로 검색 횟수 기준으로 정렬하여 1위~10위 반환.  
- Redis 키(`trending:keywords`)는 TTL(24시간)이 설정되어 24시간 동안의 랭킹 유지.  
  TTL 조절을 통해 기간별 인기 검색어 제공 가능.  

### 3. **데이터베이스 저장된 키워드 조회**  
- 데이터베이스에는 총 키워드와 그 검색 횟수가 저장됨.  
- 검색어를 `count` 기준 내림차순(`desc`)으로 정렬하여 검색 순위를 제공.  

### 4. **Redis TTL 설정**  
- 모든 검색 키는 Redis에서 24시간 동안 유지되어 단기적 인기 검색어 트렌드를 확인 가능.  

### 5. **예외 처리**  
- **비즈니스 로직 예외**:  
  - 잘못된 요청이나 서버 처리 중 오류 발생 시 예외 처리.  

- **ExceptionCode 열거형**:  
  - `KEYWORD_NOT_FOUND`, `SEARCH_SAVE_FAILED`, `TRENDING_FETCH_FAILED` 등 상세한 예외 코드와 메시지로 관리.  

---

## 📂 **폴더 구조**  

```
src
├── common
│   └── middleware
│       └── ip.middleware.ts         # IP 추출을 위한 미들웨어
├── exception
│   ├── business-login.exception.ts  # 커스텀 비즈니스 로직 예외
│   └── exception-code.enum.ts       # 예외 코드 열거형
├── redis
│   └── redis.config.ts              # Redis 클라이언트 및 설정
├── search
│   ├── dto
│   │   └── create-search-query.dto.ts # 검색 요청 데이터 DTO
│   ├── entity
│   │   └── search-query.entity.ts   # 회원 검색어 Entity
│   ├── search.controller.ts         # 검색 API 엔드포인트 처리
│   ├── search.module.ts             # 검색 모듈 정의
│   └── search.service.ts            # 검색 비즈니스 로직
├── prisma
│   ├── prisma.module.ts             # Prisma 모듈 정의
│   ├── prisma.service.ts            # Prisma 서비스 (DB 액세스)
│   └── schema.prisma                # Prisma 스키마 정의
├── app.controller.spec.ts           # 테스트용 컨트롤러
├── app.controller.ts                # 기본 컨트롤러
├── app.module.ts                    # 메인 애플리케이션 모듈
├── app.service.ts                   # 기본 서비스
└── main.ts                          # 애플리케이션 엔트리포인트
```  

---

## 💡 **.env 파일**  

`.env` 파일의 예시:  

```plaintext
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/your_database

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_KEY_EXPIRATION=86400

# Application
PORT=3000
```  

---

