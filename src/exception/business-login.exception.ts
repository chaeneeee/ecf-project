import { HttpException } from '@nestjs/common';
import { ExceptionCode, ExceptionMessages } from './exception-code.enum';

// 비지니스 로직 예외처리 
export class BusinessLogicException extends HttpException {
  constructor(exceptionCode: ExceptionCode) {
    //예외 코드 상세 정보 가져오기
    const exceptionDetail = ExceptionMessages[exceptionCode];
     // HttpException의 부모에 예외 상세 정보를 전달
    super(
      {
        statusCode: exceptionDetail.statusCode,  //상태코드 작성
        errorCode: exceptionCode, // 예외 코드 설정
        message: exceptionDetail.message, //나타낼 오류 메시지
      },
      exceptionDetail.statusCode,
    );
  }
}
