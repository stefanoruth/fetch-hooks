import React, { useEffect, useState } from 'react'
import { useFetch } from '@stefanoruth/use-fetch'

export const App: React.FunctionComponent = props => {
    const [render, setRender] = useState('server')
    const [page, setPage] = useState(1)

    const { data, loading, error, refetch } = useFetch<{ message: string; time: string }>('/api/json', {
        query: { page },
        ssr: false,
    })

    useEffect(() => {
        setRender('client')
    }, [])

    if (error) {
        if (error.fetchError) {
            return <div>fetchError ({error.fetchError.message})</div>
        }

        if (error.httpError) {
            return <div>httpError ({error.httpError.statusText})</div>
        }

        return <div>The page errored</div>
    }

    if (loading) {
        return <div>Loading</div>
    }

    return (
        <div>
            <div>Hej - {render}</div>
            <div>{data?.message}</div>
            <div>{data?.time}</div>

            <div>
                <button onClick={() => setPage(old => old + 1)}>Next page</button>
            </div>
            <div>
                <button onClick={() => refetch()}>Refetch</button>
            </div>
        </div>
    )
}
