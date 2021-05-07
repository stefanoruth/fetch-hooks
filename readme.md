# fetch-hooks

![npm](https://img.shields.io/npm/v/@stefanoruth/fetch-hooks)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@stefanoruth/fetch-hooks)

## Features

-   🥇 First-class hooks API
-   📄 Full SSR support
-   🔌 Caching
-   🔥 No more render props hell
-   ⏳ Handle loading and error states with ease

## Install

`yarn add graphql-hooks`

or

`npm install graphql-hooks`

## Quick Start

First you'll need to create a client and wrap your app with the provider:

```ts
import { FetchClient, FetchContext, memCache } from '@stefanoruth/fetch-hooks'

const client = new FetchClient({
    baseUrl: 'http://localhost:3000',
})

function App() {
    return <FetchContext.Provider value={client}>{/* children */}</FetchContext.Provider>
}
```

Now in your child components you can make use of `useFetch`

```ts
import { useFetch } from '@stefanoruth/fetch-hooks'

function MyComponent() {
    const { loading, error, data } = useFetch<{ user: { id: number; name: string }[] }>('/users', {
        variables: { page: 1 },
    })

    if (loading) {
        return 'Loading...'
    }

    if (error) {
        return 'Something Bad Happened'
    }

    return (
        <ul>
            {data.user.map(({ id, name }) => (
                <li key={id}>{name}</li>
            ))}
        </ul>
    )
}
```

## Thanks to

Thanks to the package [graphql-hooks](https://github.com/nearform/graphql-hooks) by nearform, for the idear and the
entire baseline for this package.
