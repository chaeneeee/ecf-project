import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisConfigService } from '../redis/redis.config';
import { CreateSearchQueryDto } from './dto/create-search-query.dto';
import Redis from 'ioredis';
import { BusinessLogicException } from '../exception/business-login.exception';
import { ExceptionCode } from '../exception/exception-code.enum';

@Injectable()
export class SearchService {
  private readonly redisClient: Redis; //Redis 클라이언트 인스턴스
  private readonly keyExpiration: number; //Redis 키 만료 시간

  constructor(
    private readonly prisma: PrismaService, //PrismaService로 DB 액세스
    private readonly redisConfigService: RedisConfigService, //RedisConfigService 로 Redis 설정 
  ) {
    this.redisClient = this.redisConfigService.getClient(); // Redis 클라이언트 가져오기
    this.keyExpiration = this.redisConfigService.getKeyExpiration(); // 환경 변수에서 만료 시간 가져오기
  }


  //검색어 저장 
  async saveSearchQuery(dto: CreateSearchQueryDto) {
    const { keyword, userId, ip } = dto;   // DTO에서 검색 키워드, 사용자 ID oe IP 주소 가져오기
    const userKey = `search:${userId || ip}`; // Redis 에 저장된 사용자 키 생성
    const redisKey = 'trending:keywords'; // Redis 인기 검색어 ZSET 키 

    try {
       // Redis에 사용자 검색 기록이 있는지 확인
      const isDuplicate = await this.redisClient.sismember(userKey, keyword);

      // 검색 기록 없다면
      if (!isDuplicate) {
        // 사용자 검색 기록 추가
        await this.redisClient.sadd(userKey, keyword); // 사용자 키에 Value 로 검색어 추가
        await this.redisClient.expire(userKey, this.keyExpiration); //키 만료 시간 설정

        // Redis의 ZSET에 검색 횟수 추가
        await this.redisClient.zincrby(redisKey, 1, keyword);

        // Redis ZSET에 만료 시간 설정 (TTL)
        const ttl = await this.redisClient.ttl(redisKey);
        if (ttl === -1) {
          await this.redisClient.expire(redisKey, this.keyExpiration); 
        }

        // KeywordStatus 테이블에 검색어의 카운트 증가 (없으면 생성하기)
        await this.prisma.keywordStatus.upsert({
          where: { keyword }, 
          update: { count: { increment: 1 } },
          create: { keyword, count: 1 },
        });

        // DB에 검색 기록 저장
        await this.prisma.searchQuery.create({
          data: {
            keyword,
            userId: userId || null, // 사용자 ID (비회원은 null)
            ip: ip || null, // IP 주소 (회원은 null)
          },
        });

        return {
          keyword,
          createdAt: new Date(),
        };
      } else {

        console.log(`중복된 키워드 검색 ${userKey}: ${keyword}`);
        return { keyword, createdAt: new Date() }; //중독이더라도 응답은 반환
      }
    } catch (error) {
      // 검색어 저장에 실패 했을 시 예외처리 
      console.error('검색어 저장에 실패했습니다:', error);
      throw new BusinessLogicException(ExceptionCode.SEARCH_SAVE_FAILED);
    }
  }

  
  // 인기 검색어 반환 (24시간 기준) 키워드와 검색 횟수
  async getTrendingSearches(): Promise<{ keyword: string; rank: number; score: number }[]> {
    const redisKey = 'trending:keywords';  // 인기 검색어 ZSET 키

    try {
        // Redis ZSET에서 상위 10개 검색어와 점수 조회
      const redisResults = await this.redisClient.zrevrange(redisKey, 0, 9, 'WITHSCORES');

      if (!redisResults.length) {
        return [];    // 데이터가 없을 경우 빈 배열 반환
      }

      // Redis 결과를 키워드와 검색횟수로 반환
      const redisData = [];
      for (let i = 0; i < redisResults.length; i += 2) {
        redisData.push({
          keyword: redisResults[i], // 키워드
          score: parseInt(redisResults[i + 1], 10),  // 검색횟수
        });
      }

      // rank와 검색횟수를 포함하여 반환
      return redisData.map((redisItem, index) => ({
        keyword: redisItem.keyword,
        rank: index + 1,  // 순위 계산
        score: redisItem.score,
      }));
    } catch (error) {
      // Redis 에서 rank 데이터 가져오는 것에 실패했을 때 예외처리 
      console.error('Redis에서 랭킹을 가져오는 것에 실패했습니다:', error);
      throw new BusinessLogicException(ExceptionCode.TRENDING_FETCH_FAILED);
    }
  }


   // 인기 검색어 반환 (24시간 기준) 키워드와 Rank
  async getRedisRankings(): Promise<{ keyword: string; rank: number }[]> {
    const redisKey = 'trending:keywords';   // 인기 검색어 ZSET 키

    try {
      // Redis ZSET에서 검색어(key)만 조회 0~9까지
      const redisResults = await this.redisClient.zrevrange(redisKey, 0, 9);

      if (!redisResults.length) {
        return []; // 데이터가 없을 경우 빈 배열 반환
      }

      // 키워드와 rank 반환
      return redisResults.map((keyword, index) => ({
        keyword,
        rank: index + 1,
      }));
    } catch (error) {
      // Redis 에서 rank 데이터 가져오는 것에 실패했을 때 예외처리 
      console.error('Redis에서 랭킹을 가져오는 것에 실패했습니다:', error);
      throw new BusinessLogicException(ExceptionCode.REDIS_RANK_FETCH_FAILED);
    }
  }

 
  //DB에 저장된 모든 키워드 및 검색 횟수 조회
  async getAllKeywordsFromDB(): Promise<{ keyword: string; count: number }[]> {
    try {
      const keywords = await this.prisma.keywordStatus.findMany({
        orderBy: { count: 'desc' }, // 검색 횟수 기준으로 내림차순 정렬
      });
      
      // 검색어와 횟수를 매핑하여 반환
      return keywords.map((item) => ({
        keyword: item.keyword,
        count: item.count,
      }));
    } catch (error) {
      //데이터베이스에서 키워드 데이터 불러오지 못했을 때의 예외처리
      console.error('데이터베이스에서 키워드를 가져오지 못했습니다', error);
      throw new BusinessLogicException(ExceptionCode.DB_FETCH_FAILED);
    }
  }
}
