import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSearchQueryDto {
  @ApiProperty({
    description: '검색 키워드',
    example: 'nestjs',
  })
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @ApiProperty({
    description: '회원 요청 시 사용자 ID',
    example: 'cheche',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: '비회원 요청 시 IP 주소',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({
    description: '사용자 나이 (선택)',
    example: 25,
    required: false,
  })
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiProperty({
    description: '사용자 성별 (선택)',
    example: 'male',
    required: false,
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    description: '사용자 지역 (선택)',
    example: 'Seoul',
    required: false,
  })
  @IsOptional()
  @IsString()
  region?: string;
}
