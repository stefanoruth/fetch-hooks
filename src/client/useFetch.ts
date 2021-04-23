import { useCallback, useContext, useEffect, useState } from 'react'
import { FetchError } from './FetchError'
import { FetchContext } from './FetchContext'
import { RequestOptions, useClientRequest } from './useClientRequest'

export function useFetch<T extends unknown>(
    url: string,
    overrideOptions?: RequestOptions
): {
    data: T | undefined
    loading: boolean
    error: FetchError | undefined
    refetch: (options?: RequestOptions) => any
} {
    const options = { useCache: true, ...overrideOptions }
    const client = useContext(FetchContext)
    const [calledDuringSSR, setCalledDuringSSR] = useState(false)
    const [queryReq, state] = useClientRequest(url, options)

    if (client.ssrMode && options.ssr !== false && !calledDuringSSR && !options.skipCache) {
        if (!state.data && !state.error) {
            const promise = queryReq()
            client.ssrPromises.push(promise)
        }
        setCalledDuringSSR(true)
    }

    const stringifiedAllOpts = JSON.stringify(options)

    useEffect(() => {
        queryReq()
    }, [url, stringifiedAllOpts])

    return {
        ...state,
        refetch: useCallback(
            (options?: RequestOptions) =>
                queryReq({
                    skipCache: true, // don't call the updateData that has been passed into useQuery here
                    // reset to the default behaviour of returning the raw query result
                    // this can be overridden in refetch options
                    updateData: (_: any, data: any) => data,
                    ...options,
                }),
            [queryReq]
        ),
    } as any
}
