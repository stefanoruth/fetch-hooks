import { FetchError } from './FetchError'

export enum actionTypes {
    RESET_STATE = 'RESET_STATE',
    LOADING = 'LOADING',
    CACHE_HIT = 'CACHE_HIT',
    REQUEST_RESULT = 'REQUEST_RESULT',
}

export function reducer(
    state: { error: FetchError; loading: boolean; cacheHit: boolean; data?: any },
    action: { type: actionTypes; initialState?: any; resetState?: any; result?: any; updateData?: any }
) {
    switch (action.type) {
        case actionTypes.RESET_STATE:
            return action.initialState
        case actionTypes.LOADING:
            // if the previous action resulted in an error - refetch should clear any errors
            if (state.error) {
                return {
                    ...action.initialState,
                    data: state.data,
                    loading: true,
                }
            }
            if (state.loading) {
                return state // saves a render cycle as state is the same
            }
            return {
                ...state,
                loading: true,
            }
        case actionTypes.CACHE_HIT:
            if (state.cacheHit && !action.resetState) {
                // we can be sure this is the same cacheKey hit
                // because we dispatch RESET_STATE if it changes
                return state
            }
            return {
                ...action.result,
                cacheHit: true,
                loading: false,
            }
        case actionTypes.REQUEST_RESULT:
            return {
                ...action.result,
                data:
                    state.data && action.result.data && action.updateData
                        ? action.updateData(state.data, action.result.data)
                        : action.result.data,
                cacheHit: false,
                loading: false,
            }
        default:
            return state
    }
}
