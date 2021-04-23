import { createContext } from 'react'
import { FetchClient } from './FetchClient'

export const FetchContext = createContext<FetchClient>(null as any)

FetchContext.displayName = 'FetchContext'
