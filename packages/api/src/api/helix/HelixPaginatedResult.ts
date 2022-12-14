import type { ConstructedType } from '@d-fischer/shared-utils';
import type { HelixPaginatedResponse, HelixPaginatedResponseWithTotal } from '@twurple/api-call';
import type { ApiClient } from '../../ApiClient';

/**
 * A result coming from a Helix resource that is paginated using a cursor.
 */
export interface HelixPaginatedResult<T> {
	/**
	 * The returned data.
	 */
	readonly data: T[];

	/**
	 * A cursor for traversing more results.
	 */
	cursor?: string;
}

/**
 * A result coming from a Helix resource that is paginated using a cursor, also including a total number of items.
 */
export interface HelixPaginatedResultWithTotal<T> {
	/**
	 * The returned data.
	 */
	readonly data: T[];

	/**
	 * A cursor for traversing more results.
	 */
	cursor: string;

	/**
	 * The total number of items.
	 */
	total: number;
}

/** @private */ export function createPaginatedResult<
	I,
	O extends new (data: I, client: ApiClient) => ConstructedType<O>
>(
	response: HelixPaginatedResponse<I>,
	type: O,
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	client: ApiClient
): HelixPaginatedResult<ConstructedType<O>>;
/** @private */ export function createPaginatedResult<I, O extends new (data: I) => ConstructedType<O>>(
	response: HelixPaginatedResponse<I>,
	type: O
): HelixPaginatedResult<ConstructedType<O>>;
/** @private */ export function createPaginatedResult<
	I,
	O extends new (data: I, _client?: ApiClient) => ConstructedType<O>
>(response: HelixPaginatedResponse<I>, type: O, client?: ApiClient): HelixPaginatedResult<ConstructedType<O>> {
	let dataCache: Array<ConstructedType<O>> | undefined = undefined;
	return {
		get data() {
			return (dataCache ??= (response.data as I[] | undefined)?.map(data => new type(data, client)) ?? []);
		},
		cursor: response.pagination?.cursor
	};
}

/** @private */ export function createPaginatedResultWithTotal<
	I,
	O extends new (data: I, client: ApiClient) => ConstructedType<O>
>(
	response: HelixPaginatedResponseWithTotal<I>,
	type: O,
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	client: ApiClient
): HelixPaginatedResultWithTotal<ConstructedType<O>>;
/** @private */ export function createPaginatedResultWithTotal<I, O extends new (data: I) => ConstructedType<O>>(
	response: HelixPaginatedResponseWithTotal<I>,
	type: O
): HelixPaginatedResultWithTotal<ConstructedType<O>>;
/** @private */ export function createPaginatedResultWithTotal<
	I,
	O extends new (data: I, _client?: ApiClient) => ConstructedType<O>
>(
	response: HelixPaginatedResponseWithTotal<I>,
	type: O,
	client?: ApiClient
): HelixPaginatedResultWithTotal<ConstructedType<O>> {
	let dataCache: Array<ConstructedType<O>> | undefined = undefined;
	return {
		get data() {
			return (dataCache ??= (response.data as I[] | undefined)?.map(data => new type(data, client)) ?? []);
		},
		cursor: response.pagination!.cursor!,
		total: response.total
	};
}
