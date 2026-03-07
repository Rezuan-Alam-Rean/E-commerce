export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
};
