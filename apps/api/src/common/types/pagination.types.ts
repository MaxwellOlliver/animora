export type CursorPaginatedRequest = {
  cursor?: string;
  limit?: number;
};

export type CursorPaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
};
