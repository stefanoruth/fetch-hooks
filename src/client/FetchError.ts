export interface FetchError {
    fetchError?: Error
    httpError?: { body: string; status: number; statusText: string }
}
