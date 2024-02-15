/* dbModel query type's definitions */

export type WithMetadata<T> = { data: T; metadata: { version: number } };

export type ListResult<T> = { content: T[]; offset?: number, limit?: number, totalElements?: number };
export const emptyListResult = { results: [], totalCount: 0 };