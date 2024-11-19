

---

# SUBMISSION.md

---

## 🛠️ 구현 방법 설명

### 1. NestJS와 TypeScript를 활용한 모듈화된 구조 설계
- 프로젝트는 **NestJS**와 **TypeScript**를 기반으로 작성되었으며, **모듈화된 아키텍처**를 통해 각 계층의 역할을 분리.
- 주요 계층:
  - **Controller**: HTTP 요청/응답 관리 및 API 명세 제공.
  - **Service**: 비즈니스 로직 구현 및 데이터베이스/Redis와 상호작용.
  - **DTO**: 데이터 유효성 검사 및 요청 데이터 구조 정의.
  - **Module**: 의존성 주입(DI)과 모듈 간 종속성을 관리.

---

### 2. Prisma와 데이터베이스 관리

#### 2-1. 데이터베이스 모델 설계
- 데이터 모델링과 ORM 작업은 **Prisma**를 활용.
- 주요 데이터 모델:
  - **SearchQuery 모델**: 회원/비회원의 검색어 데이터를 저장.  
  - **KeywordStatus 모델**: 검색어와 검색 횟수를 저장하며, `keyword` 필드는 중복 방지를 위해 `unique`로 설정.  

#### 2-2. 데이터 저장 로직
- Prisma와 Redis 간 데이터 동기화:
  - Redis에서 관리되는 검색어 데이터를 데이터베이스에 백업.  
  - 중복 데이터는 `KeywordStatus` 모델에서 `count`만 증가.  

---

### 3. Redis를 활용한 검색어 관리

#### 3-1. Redis Key 구조 설계
- Redis를 효율적으로 활용하기 위해 두 가지 주요 키를 설계:
  1. **인기 검색어 관리**  
     - `trending:keywords` 키를 사용하여 검색어와 검색 횟수를 **ZSET** 자료구조에 저장.  
     - 검색 횟수를 기준으로 정렬하며, `zrevrange` 명령어로 상위 10개의 검색어를 반환.  
     - TTL(24시간)을 설정하여 실시간 인기 검색어만 유지하며, 데이터는 매일 갱신.
     - **ZSET 저장 형식**:  
       ```plaintext
       ZSET Key: trending:keywords
       Value: 검색어, Score: 검색 횟수
       Example: { "티셔츠": 50, "청바지": 30 }
       ```

  2. **사용자별 검색 기록 관리**  
     - Redis의 **Set 자료구조**를 활용하여 회원(`userId`) 및 비회원(`IP`)의 검색 기록을 저장.  
     - 사용자 고유 키를 생성하여, 중복된 검색어 저장을 방지하고 TTL을 통해 검색 기록을 제한된 시간 동안만 유지.  
     - **Set 저장 형식**:  
       ```plaintext
       Set Key: search:userId or search:ip
       Value: 사용자가 검색한 키워드
       Example (회원): search:chedyyydddrche -> ["청바지", "맨투맨"]
       Example (비회원): search:127.0.0.1 -> ["청바지", "맨투맨"]
       ```

---

#### 3-2. 검색어 저장 로직
- **Redis**와 **Prisma**를 조합하여 검색어 데이터를 효율적으로 관리:

1. **중복 검색어 처리**
   - `sismember` 명령어를 사용하여 사용자 키에 동일한 검색어가 이미 존재하는지 확인.
   - 예를 들어, 회원이 `"nestjs"`라는 검색어를 입력하면:
     ```plaintext
     Redis Set Key: search:user123
     Set Value: ["청바지", "원피스"]
     Command: SISMEMBER search:user123 "청바지"
     Result: 1 (이미 존재함)
     ```
   - 검색어가 이미 존재할 경우 데이터베이스와 Redis에는 아무런 변화가 발생하지 않음.

2. **새로운 검색어 저장**
   - 새로운 검색어는 Redis와 데이터베이스 모두에 저장:
     - Redis의 사용자별 Set에 검색어 추가:
       ```plaintext
       Redis Set Key: search:user123
       Command: SADD search:user123 "청바지"
       Result: 1 (성공적으로 추가됨)
       ```
     - Redis ZSET에 검색어와 검색 횟수를 추가/갱신:
       ```plaintext
       Redis ZSET Key: trending:keywords
       Command: ZINCRBY trending:keywords 1 "청바지"
       Result: 1 (검색 횟수 추가)
       ```
     - Prisma를 통해 데이터베이스에 검색 기록 저장:
       ```typescript
       await prisma.searchQuery.create({
         data: {
           keyword: "청바지지",
           userId: "user123",
           ip: null, // 회원의 경우 IP는 null
         },
       });
       ```

3. **TTL 설정**
   - 사용자별 검색 기록 키는 24시간 동안만 유지되도록 TTL 설정:
     ```plaintext
     Redis Set Key: search:user123
     Command: EXPIRE search:user123 86400
     ```
   - 인기 검색어를 관리하는 ZSET 키도 24시간 TTL 설정:
     ```plaintext
     Redis ZSET Key: trending:keywords
     Command: EXPIRE trending:keywords 86400
     ```

---

## 🔍 어려웠던 점

### 1. NestJS와 TypeScript의 첫 도입
- 익숙했던 자바(Spring) 스타일과 달리 NestJS의 모듈화와 명시적인 의존성 주입 방식에 적응하는 데 시간이 걸렸습니다.  
- DI에서 Spring은 자동 주입이 가능하지만 NestJS는 모듈화된 구조를 기반으로 Module에 명시적으로 서비스를 등록해야 했습니다 이로 인해 초기 설계에서 모듈 간 의존성을 설정하는 데 시간이 걸렸습니다.

### 2. 검색어 중복 처리 설계
- Redis와 데이터베이스 양쪽에서 중복된 검색어 저장을 방지하면서도 TTL을 설정하는 로직이 복잡했습니다.  
- 회원/비회원 데이터 병합 관리: Redis와 데이터베이스 양쪽에서 중복 처리를 방지하기 위해 Redis의 키 구조와 데이터 동기화 로직을 설계하는 데 시간이 소요되었습니다.

### 3. Redis ZSET 활용
- Redis 에서 key, value 형태만 사용하다  ZSET과 관련 명령어(`zincrby`, `zrevrange`)를 처음 사용하여 검색어와 검색 횟수를 정렬하는 로직(ZRANGE WITHSCORES)을 작성하는 부분

---

## 💡 개선하고 싶은 부분

### 1. 검색어 필터링
- 부적절하거나 불필요한 검색어를 저장하지 않도록 필터링 로직을 추가할 계획입니다.  

### 2. 데이터베이스 효율화
- 키워드 데이터를 모두 저장하고 있기에 데이터베이스에 저장된 모든 검색어 데이터를 장기적으로 관리할 수 있도록 개선이 필요합니다.  
- 오래된 데이터를 주기적으로 아카이빙하거나 주요 검색어만 유지하는 정책을 고려 중입니다.  

### 3. Redis 과부하 방지
- 대규모 데이터 유입 시, `userId`와 `IP`를 키로 사용한 구조에서 과부하가 발생할 가능성이 있습니다.  
- Redis 클러스터링 Redis 캐싱 등 데이터베이스 간 Redis 최적화를 도입할 계획입니다.  

### 4. 예외 처리 고도화
- 현재 예외 처리 로직은 기본적인 상태 코드와 메시지를 반환하는 수준입니다.  
- 문제를 쉽게 이해할 수 있도록 더 세분화된 예외 처리 로직을 추가할 예정입니다.  

---

