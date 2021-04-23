import React, { useCallback, useContext, useEffect, useReducer, useRef } from 'react'
import { FetchOptions } from './FetchClient'
import { FetchContext } from './FetchContext'
import { Operation, ReponseType } from './Operation'
import { actionTypes, reducer } from './reducer'

export interface RequestOptions {
    ssr?: boolean
    skipCache?: boolean
    useCache?: boolean
    updateData?: any
    responseType?: ReponseType
    query?: Record<string, any>
    fetchOptions?: FetchOptions
}

export function useClientRequest(url: string, options: RequestOptions) {
    const client = useContext(FetchContext)
    const isMounted = useRef(true)
    const activeCacheKey = useRef<Operation>(null)

    const operation: Operation = client.getFetchOptions({ url, ...options })
    // console.log({ operation })
    const cacheKey = client.getCacheKey(operation)
    const initialCacheHit = options.skipCache || !client.cache ? null : client.cache.get(cacheKey)
    const initialState = {
        ...initialCacheHit,
        cacheHit: !!initialCacheHit,
        loading: !initialCacheHit,
    }
    const [state, dispatch] = useReducer(reducer, initialState)

    // NOTE: state from useReducer is only initialState on the first render
    // in subsequent renders the operation could have changed
    // if so the state would be invalid, this effect ensures we reset it back
    const stringifiedCacheKey = JSON.stringify(cacheKey)
    useEffect(() => {
        if (!options.updateData) {
            // if using updateData we can assume that the consumer cares about the previous data
            dispatch({ type: actionTypes.RESET_STATE, initialState })
        }
    }, [stringifiedCacheKey]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    // arguments to fetchData override the useClientRequest arguments
    const fetchData = useCallback(
        (newOpts?: RequestOptions) => {
            if (!isMounted.current) {
                return Promise.resolve()
            }
            const revisedOpts = {
                ...options,
                ...(newOpts || {}),
            }

            const revisedOperation: Operation = {
                ...operation,
                ...(newOpts || {}),
            }

            // console.log(revisedOperation)

            const revisedCacheKey = client.getCacheKey(revisedOperation)

            // NOTE: There is a possibility of a race condition whereby
            // the second query could finish before the first one, dispatching an old result
            // see https://github.com/nearform/graphql-hooks/issues/150
            ;(activeCacheKey as any).current = revisedCacheKey

            const cacheHit = revisedOpts.skipCache ? null : client.getCache(revisedCacheKey)

            if (cacheHit) {
                dispatch({
                    type: actionTypes.CACHE_HIT,
                    result: cacheHit,
                    resetState: stringifiedCacheKey !== JSON.stringify(state.cacheKey),
                })

                return Promise.resolve(cacheHit)
            }

            dispatch({ type: actionTypes.LOADING, initialState })
            return client.request(revisedOperation).then(result => {
                // console.dir(result, { depth: null })

                if (revisedOpts.updateData && typeof revisedOpts.updateData !== 'function') {
                    throw new Error('options.updateData must be a function')
                }

                const actionResult: any = { ...result }
                if (revisedOpts.useCache) {
                    actionResult.useCache = true
                    actionResult.cacheKey = revisedCacheKey

                    if (client.ssrMode) {
                        const cacheValue = {
                            error: actionResult.error,
                            data: revisedOpts.updateData
                                ? revisedOpts.updateData(state.data, actionResult.data)
                                : actionResult.data,
                        }
                        client.saveCache(revisedCacheKey, cacheValue)
                    }
                }

                if (isMounted.current && revisedCacheKey === activeCacheKey.current) {
                    dispatch({
                        type: actionTypes.REQUEST_RESULT,
                        updateData: revisedOpts.updateData,
                        result: actionResult,
                    })
                }

                return result
            })
        },
        [client, options, operation]
    )

    // We perform caching after reducer update
    // To include the outcome of updateData
    useEffect(() => {
        if (state.useCache) {
            client.saveCache(state.cacheKey, state)
        }
    }, [client, state])

    const reset = (desiredState = {}) =>
        dispatch({
            type: actionTypes.RESET_STATE,
            initialState: { ...initialState, ...desiredState },
        })

    return [fetchData, state, reset]
}
