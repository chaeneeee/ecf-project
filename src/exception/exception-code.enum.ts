export enum ExceptionCode {
    KEYWORD_NOT_FOUND = '404_KEYWORD_NOT_FOUND',
    BAD_REQUEST = '400_BAD_REQUEST',
    SEARCH_SAVE_FAILED = '500_SEARCH_SAVE_FAILED', 
    TRENDING_FETCH_FAILED = '500_TRENDING_FETCH_FAILED',
    DB_FETCH_FAILED = '500_DB_FETCH_FAILED',
    REDIS_RANK_FETCH_FAILED = '500_REDIS_RANK_FETCH_FAILED',
  }
  
  export const ExceptionMessages: Record<ExceptionCode, { statusCode: number; message: string }> = {
    [ExceptionCode.KEYWORD_NOT_FOUND]: { statusCode: 404, message: '키워드를 찾을 수 없습니다.' },
    [ExceptionCode.BAD_REQUEST]: { statusCode: 400, message: '잘못된 요청입니다.' },
    [ExceptionCode.TRENDING_FETCH_FAILED]: { statusCode: 500, message: '트렌드키워드를 가져오는데 실패했습니다.' },
    [ExceptionCode.SEARCH_SAVE_FAILED]: { statusCode: 500, message: '검색어 저장하는 것을 실패했습니다.' },
    [ExceptionCode.DB_FETCH_FAILED]: { statusCode: 500, message: '데이터베이스에서 데이터를 가져오는 데 실패했습니다.' },
    [ExceptionCode.REDIS_RANK_FETCH_FAILED]: { statusCode: 500, message: 'Redis에서 랭크를 가져오는 데 실패했습니다.' },  
};
  