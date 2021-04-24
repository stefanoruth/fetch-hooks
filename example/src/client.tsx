import React from 'react'
import { hydrate } from 'react-dom'
import { App } from './App'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'

const initialState = (window as any).__INITIAL_STATE__
console.log('initialState', initialState)
const client = new FetchClient({
    baseUrl: 'http://localhost:3000',
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
