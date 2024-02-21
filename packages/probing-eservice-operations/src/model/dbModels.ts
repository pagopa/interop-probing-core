/* dbModel query type's definitions */

export type WithMetadata<T> = { data: T; metadata: { version: number } };

export type ListResultEservices<T> = { content: T[]; offset?: number, limit?: number, totalElements: number };
export type ListResultProducers<T> = { content: T[]; };

export const emptyListResult = { results: [], totalCount: 0 };