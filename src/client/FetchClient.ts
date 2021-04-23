import fetch from 'isomorphic-fetch'
import { Operation } from './Operation'
import { Cache } from './memCache'
import { stringify } from 'query-string'

interface FetchResult<T extends unknown> {
    data?: T
    httpError?: { body: string; status: number; statusText: string }
    fetchError?: Error
}

export interface FetchOptions {
    credentials?: RequestCredentials
    headers?: HeadersInit
    mode?: RequestMode
}

export class FetchClient {
    public ssrMode?: boolean
    public ssrPromises: Promise<any>[] = []
    public cache?: Cache
    private logErrors?: boolean
    private onError?: (params: { result: FetchResult<any>; url: string }) => void
    private fetchOptions: FetchOptions
    private baseUrl?: string

    constructor(config?: {
        baseUrl?: string
        cache?: Cache
        ssrMode?: boolean
        logErrors?: boolean
        fetchOptions?: FetchOptions
        onError?: (params: { result: FetchResult<any>; url: string }) => void
    }) {
        this.baseUrl = config?.baseUrl
        this.cache = config?.cache
        this.ssrMode = config?.ssrMode
        this.logErrors = config?.logErrors
        this.fetchOptions = config?.fetchOptions || {}
    }

    async request<T extends unknown>(operation: Operation): Promise<FetchResult<T>> {
        let url: string

        if (operation.url.startsWith('http')) {
            url = operation.url
        } else {
            url = (this.baseUrl || '') + operation.url
        }

        if (operation?.query && Object.keys(operation.query).length > 0) {
            url += '?' + stringify(operation.query)
        }

        // console.log({ url, operation })

        const requestOptions: RequestInit = {
            ...this.fetchOptions,
            headers: {
                ...(operation?.responseType !== 'text' ? { 'Content-Type': 'application/json' } : {}),
                ...this.fetchOptions.headers,
                // ...operation.fetchOptions,
            },
        }

        return fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(body =>
                        this.generateResult({
                            httpError: { body, status: response.status, statusText: response.statusText },
                        })
                    )
                }

                if (operation?.responseType === 'text') {
                    return response.text().then(data => this.generateResult({ data }))
                }

                return response.json().then(data => this.generateResult({ data }))
            })
            .catch(fetchError => {
                return this.generateResult({ fetchError })
            })
            .then(result => {
                if (result.error) {
                    if (this.logErrors) {
                        this.logErrorResult({ result, url })
                    }

                    if (this.onError) {
                        this.onError({ result, url })
                    }
                }

                return result
            })
    }

    getCacheKey(operation: Operation): Operation {
        // Fill in client specific settings.
        return {
            ...operation,
            fetchOptions: {
                ...this.fetchOptions,
                ...operation.fetchOptions,
            },
        }
    }

    getCache(cacheKey: Operation) {
        return this.cache && this.cache.get(cacheKey)
    }

    getFetchOptions(operation: Operation): Operation {
        return {
            ...this.fetchOptions,
            ...operation,
        }
    }

    saveCache(cacheKey: Operation, value: object) {
        if (this.cache) {
            this.cache.set(cacheKey, value)
        }
    }

    logErrorResult(data: { result: FetchResult<any>; url: string }) {
        console.error(data)
    }

    private generateResult({
        data,
        httpError,
        fetchError,
    }: {
        data?: any
        fetchError?: Error
        httpError?: { body: string; status: number; statusText: string }
    }) {
        if (httpError || fetchError) {
            return {
                data,
                error: {
                    httpError,
                    fetchError,
                },
            }
        }

        return { data }
    }

    getInitialState() {
        if (this.cache) {
            return this.cache.getInitialState()
        }

        throw new Error(
            'A cache implementation must be provided for SSR, please pass one to `GraphQLClient` via `options`.'
        )
    }
}
