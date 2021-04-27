import React from 'react'
import express from 'express'
import path from 'path'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { App as AppShell } from './App'
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'
import { getInitialState } from '@stefanoruth/fetch-hooks/server'
import cors from 'cors'

const app = express()

app.use(
    cors({
        origin: 'http://localhost:3000',
    })
)
app.use(express.static(path.join(__dirname, '../dist')))

app.use('/api/error', () => {
    throw new Error('This fine little error happened.')
})

app.use('/api/json', (req, res) => {
    console.log('Request')

    return res.json({ message: `Hello World - page ${req.query.page}`, time: new Date().toISOString() })
})

app.use('/api/text', (req, res) => {
    return res.send('Hi')
})

app.get('/', async (req, res) => {
    const client = new FetchClient({
        baseUrl: 'http://localhost:3000',
        cache: memCache(),
        ssrMode: true,
        // logErrors: false,
        // fetchOptions: { mode: 'cors', credentials: 'include' },
    })

    const App = (
        <FetchContext.Provider value={client}>
            <AppShell />
        </FetchContext.Provider>
    )

    try {
        const initialState = await getInitialState({ App, client })

        console.dir({ initialState }, { depth: null })

        const content = renderToString(App)

        const html = renderToStaticMarkup(
            <html lang="en">
                <head>
                    <meta charSet="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>React Portal SSR</title>
                </head>
                <body>
                    <div id="app" dangerouslySetInnerHTML={{ __html: content }} />
                    <script
                        type="text/javascript"
                        dangerouslySetInnerHTML={{
                            __html: `window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(
                                /</g,
                                '\\u003c'
                            )};`,
                        }}
                    />
                    <script src="/client.js" />
                </body>
            </html>
        )

        return res.send('<!DOCTYPE html>' + html)
    } catch (error) {
        console.error(error)
        return res.status(500).send(error.message)
    }
})

app.listen(3000)
