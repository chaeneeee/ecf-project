export class GuestSearchQueryEntity {
    id: number;
    keyword: string;
    ip: string; // 비회원 요청의 고유 식별값
    createdAt: Date;
  }
  