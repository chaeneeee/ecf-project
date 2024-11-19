import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SearchModule } from './search/search.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()  //swagger 로 문서화하기
    .setTitle('ECF API 명세서') // 문서 제목
    .setDescription('ECF 과제를 위한 API 문서') // 문서 설명
    .setVersion('1.0') // 버전
    .build();
    const document = SwaggerModule.createDocument(app, config, {
      include: [SearchModule], // 포함할 모듈만 명시
    } );
    SwaggerModule.setup('ecf-api-docs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  // Middleware로 IP 포맷팅 추가
  app.use((req, res, next) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    req['clientIp'] = Array.isArray(rawIp) ? rawIp[0] : rawIp?.replace(/^::ffff:/, '') || 'unknown';
    next();
  });
  await app.listen(3000);
  
}
bootstrap();
