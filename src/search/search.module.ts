import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../../prisma/migrations/prisma.module';
import { RedisConfigService } from '../redis/redis.config';

@Module({
  imports: [PrismaModule], // PrismaModule 등록
  controllers: [SearchController],
  providers: [SearchService, RedisConfigService], // RedisConfigService 추가
})
export class SearchModule {}
