import { PrismaModule } from './../prisma/migrations/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchModule } from './search/search.module';
import { IpMiddleware } from './common/middleware/ip.middleware';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfigService } from './redis/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // .env 파일을 모든 모듈에서 접근 가능하게 설정
    }),
    SearchModule, // 검색어 관련 모듈
    PrismaModule, // Prisma 모듈
  ],
  controllers: [AppController], 
  providers: [
    AppService, 
    RedisConfigService, // Redis 설정 서비스 추가
  ],
  exports: [
    RedisConfigService, // Redis 설정을 다른 모듈에서도 사용할 수 있게 내보낸다 providers 안에 있는 애만 내보낼 수 있다
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpMiddleware).forRoutes('*'); // 모든 경로에 IP 미들웨어 적용
  }
}
