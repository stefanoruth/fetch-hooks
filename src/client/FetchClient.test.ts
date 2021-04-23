import { FetchClient } from './FetchClient'

describe('FetchClient', () => {
    test('???', () => {
        fetchMock.mockResponse(async req => {
            // console.log(req)

            return 'woo'
        })

        const client = new FetchClient()

        expect(client.request({ url: '/' })).toBe(1)
    })
})
