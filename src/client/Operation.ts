import { FetchOptions } from './FetchClient'

export type ReponseType = 'json' | 'text'

export interface Operation {
    url: string
    responseType?: ReponseType // Default to json
    query?: Record<string, any>
    fetchOptions?: FetchOptions
}
