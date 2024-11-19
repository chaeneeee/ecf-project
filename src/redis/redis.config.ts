import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  private readonly redisClient: Redis;
  private readonly keyExpiration: number;

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'), // .env에서 REDIS_HOST 가져오기
      port: parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10), // .env에서 REDIS_PORT 가져오기
    });
    this.keyExpiration = this.configService.get<number>('REDIS_KEY_EXPIRATION', 86400); // 기본값으로 24시간 설정
  }

// Redis 클라이언트 반환
  getClient(): Redis {
    return this.redisClient;
  }

// 키 만료 시간 반환
  getKeyExpiration(): number {
    return this.keyExpiration;
  }
}
