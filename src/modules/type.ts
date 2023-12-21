//panigation response
export interface IPanigationResponse<T> {
  totalData: number;
  totalPage: number;
  currentPage: number;
  currentDataSize: number;
  canNext: boolean;
  data: T | T[];
}
