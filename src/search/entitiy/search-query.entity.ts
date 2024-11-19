export class SearchQueryEntity {
  id: number;
  keyword: string;
  userId?: string;
  ip?: string;
  age?: number;
  gender?: string;
  region?: string;
  createdAt: Date;
}
