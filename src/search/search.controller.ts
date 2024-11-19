import { Controller, Post, Get, Body, Req, BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchQueryDto } from './dto/create-search-query.dto';
import { Request } from 'express';
import { ExceptionCode } from 'src/exception/exception-code.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

// 검색 관련 API를 처리하는 controller 
@ApiTags('Search')  // 태그 추가로 그룹화
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
// SearchService를 주입받아 검색 관련 서비스 로직 처리

// 검색어 키워드 저장
  @Post('keywords')
  @ApiOperation({
    summary: '검색어 저장',
    description: '사용자가 입력한 검색어를 저장합니다.',
  })
  @ApiBody({
    description: '검색어 저장 요청 데이터',
    type: CreateSearchQueryDto, 
    examples: {
      example1: {
        summary: '회원 검색어 저장 요청',
        value: {
          keyword: 'nestjs',
          userId: '12345',
          age: 25,
          gender: 'male',
          region: 'Seoul',
        },
      },
      example2: {
        summary: '비회원 검색어 저장 요청',
        value: {
          keyword: 'nestjs',
          ip: '192.168.1.1',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '검색어가 성공적으로 저장되었습니다.',
    schema: {
      example: {
        success: true,
        data: {
          keyword: 'nestjs',
          userId: '12345',
          createdAt: '2024-11-19T12:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '검색어가 없습니다.',
    schema: {
      example: {
        statusCode: 400,
        message: '검색어가 없습니다.',
        error: 'Bad Request',
      },
    },
  })
  async saveSearchQuery(@Body() body: CreateSearchQueryDto, @Req() req: Request) {
    // 클라이언트 IP 주소 추출
    // 'x-forwarded-for' 헤더는 프록시 경유한 경우 클라이언트 IP 포함
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // IPv6 형식 주소 IPv4 형식으로 변환
    const clientIp = Array.isArray(rawIp)
      ? rawIp[0] // 값이 배열이면 첫 번째 값 사용
      : rawIp?.replace(/^::ffff:/, '').replace(/^::1$/, '127.0.0.1') || 'unknown';

      // 사용자 userId 제공되지 않은 경우 IP 주소 식별자로 사용하여 검색어 저장 
    if (!body.userId) {
      body.ip = clientIp as string;
    }
    // 검색어가 없는 경우 BadRequestException을 발생
    if (!body.keyword) {
      throw new BadRequestException(ExceptionCode.KEYWORD_NOT_FOUND);
    }
    // 검색어 저장 로직을 호출
    const result = await this.searchService.saveSearchQuery(body);
    // 성공적으로 저장된 결과를 반환
    return {
      success: true,
      data: result,
    };
  }

  //인기 검색어 조회
  @Get('trending')
  @ApiOperation({ summary: '인기 검색어 조회', description: 'Redis에서 인기 검색어 목록을 반환합니다.' })
  @ApiResponse({
    status: 200,
    description: '성공적으로 인기 검색어를 반환했습니다.',
    schema: {
      example: {
        success: true,
        data: [
          { keyword: 'nestjs', rank: 1, score: 50 },
          { keyword: 'swagger', rank: 2, score: 30 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Redis에서 데이터를 가져오는 중 오류 발생',
    schema: {
      example: {
        statusCode: 500,
        message: 'Redis에서 데이터를 가져오지 못했습니다',
        error: 'Redis Fetch Failed',
      },
    },
  })
  async getTrendingSearches() {
    // 인기 검색어 검색 서비스에서 조회
    const trendingSearches = await this.searchService.getTrendingSearches();
    // 인기 검색어 목록 반환
    return {
      success: true,
      data: trendingSearches,
    };
  }

  // 데이터 베이스 저장된 모든 검색어 조회
  @Get('db-keywords')
  @ApiOperation({
    summary: '데이터베이스 검색어 조회',
    description: '데이터베이스에 저장된 모든 검색어와 검색 횟수를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 검색어를 반환했습니다.',
    schema: {
      example: {
        success: true,
        data: [
          { keyword: 'nestjs', count: 50 },
          { keyword: 'swagger', count: 30 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '데이터베이스에서 데이터를 가져오는 중 오류 발생',
    schema: {
      example: {
        statusCode: 500,
        message: '데이터베이스에서 데이터를 가져오지 못했습니다',
        error: 'Database Fetch Failed',
      },
    },
  })
  async getAllKeywordsFromDB() {
    const dbKeywords = await this.searchService.getAllKeywordsFromDB();
    return {
      success: true,
      data: dbKeywords,
    };
  }
}
