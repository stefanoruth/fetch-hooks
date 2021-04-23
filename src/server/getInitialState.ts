import React, { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FetchClient } from '../client/FetchClient'

export async function getInitialState(options: { App: ReactElement; client: FetchClient }): Promise<any> {
    const { App, client } = options

    client.ssrMode = true

    renderToStaticMarkup(App)

    if (client.ssrPromises.length > 0) {
        await Promise.all(client.ssrPromises)
        // clear promises
        client.ssrPromises = []
        // recurse there may be dependant queries
        return getInitialState(options)
    } else {
        return client.getInitialState()
    }
}
