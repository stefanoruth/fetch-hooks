import LRU from 'tiny-lru'
import { fnv1a } from './fnv1a'
import { Operation } from './Operation'

function generateKey(keyObj: Operation) {
    return fnv1a(JSON.stringify(keyObj)).toString(36)
}

export interface Cache {
    get(keyObject: Operation): object
    set(keyObject: Operation, data: object): void
    delete(keyObject: Operation): void
    clear(): void
    keys(): void
    getInitialState(): object
}

interface CacheOptions {
    size?: number
    ttl?: number
    initialState: any
}

export function memCache(
    { size, ttl, initialState }: CacheOptions = {
        size: 100,
        ttl: 0,
        initialState: {},
    }
): Cache {
    const lru = LRU(size, ttl)

    if (initialState) {
        Object.keys(initialState).map(k => {
            lru.set(k, initialState[k])
        })
    }

    return {
        get: (keyObj: Operation) => lru.get(generateKey(keyObj)),
        set: (keyObj: Operation, data: any) => lru.set(generateKey(keyObj), data),
        delete: (keyObj: Operation) => lru.delete(generateKey(keyObj)),
        clear: () => lru.clear(),
        keys: () => lru.keys(),
        getInitialState: () =>
            lru.keys().reduce(
                (initialState, key) => ({
                    ...initialState,
                    [key]: lru.get(key),
                }),
                {}
            ),
    }
}
