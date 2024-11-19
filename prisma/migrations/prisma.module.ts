import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Global() // 글로벌 모듈로 선언 (모든 모듈에서 사용 가능)
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // PrismaService를 외부 모듈에서 사용할 수 있도록 export
})
export class PrismaModule {}
