import React from 'react'
import { hydrate } from 'react-dom'
import { App } from './App'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/use-fetch'
import { domain } from './domain'

const initialState = (window as any).__INITIAL_STATE__
console.log('initialState', initialState)
const client = new FetchClient({
    baseUrl: domain,
    cache: memCache({ initialState }),
    // fetchOptions: {
    //     mode: 'cors',
    //     credentials: 'include',
    // },
})

hydrate(
    <FetchContext.Provider value={client}>
        <App />
    </FetchContext.Provider>,
    document.getElementById('app')
)
