import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    //req - 클라이언트 요청 객체 , res - 서버 응답 객체 , next - 다음 미들웨어로 제어 넘기는 콜백 함수
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // IPv6에서 IPv4로 변환
    req['clientIp'] = Array.isArray(rawIp)
      ? rawIp[0]
      : rawIp?.replace(/^::ffff:/, '') || 'unknown';
      // IPv6 주소 표현법에서 IPv4 주소를 나타내는 "::ffff:" 접두사를 제거
      // IP 주소를 식별할 수 없는 경우 기본값으로 'unknown'을 설정
    next();
  }
}
