import { promiseWithResolvers } from '@d-fischer/shared-utils';
import type { AccessToken } from './AccessToken';

export class TokenFetcher<T extends AccessToken = AccessToken> {
	private readonly _executor: (scopeSets: string[][]) => Promise<T>;
	private _newTokenScopeSets: string[][] = [];
	private _newTokenPromise: Promise<T> | null = null;
	private _queuedScopeSets: string[][] = [];
	private _queueExecutor: (() => void) | null = null;
	private _queuePromise: Promise<T> | null = null;

	constructor(executor: (scopeSets: string[][]) => Promise<T>) {
		this._executor = executor;
	}

	async fetch(...scopeSets: Array<string[] | undefined>): Promise<T> {
		const filteredScopeSets = scopeSets.filter((val): val is string[] => Boolean(val));
		if (this._newTokenPromise) {
			if (!filteredScopeSets.length) {
				return await this._newTokenPromise;
			}

			if (this._queueExecutor) {
				this._queuedScopeSets.push(...filteredScopeSets);
			} else {
				this._queuedScopeSets = [...filteredScopeSets];
			}

			if (!this._queuePromise) {
				const { promise, resolve, reject } = promiseWithResolvers<T>();
				this._queuePromise = promise;
				this._queueExecutor = async () => {
					if (!this._queuePromise) {
						return;
					}
					this._newTokenScopeSets = this._queuedScopeSets;
					this._queuedScopeSets = [];
					this._newTokenPromise = this._queuePromise;
					this._queuePromise = null;
					this._queueExecutor = null;
					try {
						resolve(await this._executor(this._newTokenScopeSets));
					} catch (e) {
						reject(e as Error);
					} finally {
						this._newTokenPromise = null;
						this._newTokenScopeSets = [];
						(this._queueExecutor as (() => void) | null)?.();
					}
				};
			}

			return await this._queuePromise;
		}

		this._newTokenScopeSets = [...filteredScopeSets];
		const { promise, resolve, reject } = promiseWithResolvers<T>();
		this._newTokenPromise = promise;
		try {
			resolve(await this._executor(this._newTokenScopeSets));
		} catch (e) {
			reject(e as Error);
		} finally {
			this._newTokenPromise = null;
			this._newTokenScopeSets = [];
			this._queueExecutor?.();
		}

		return await promise;
	}
}
