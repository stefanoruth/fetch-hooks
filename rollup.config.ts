import typescript from 'rollup-plugin-typescript2'
import bundleSize from 'rollup-plugin-bundle-size'
import del from 'rollup-plugin-delete'

export default [
    {
        input: 'src/client/index.ts',
        output: [
            {
                file: 'dist/client.js',
                format: 'cjs',
            },
        ],
        external: ['react', 'react-dom', 'isomorphic-fetch', 'query-string', 'tiny-lru'],
        plugins: [typescript(), bundleSize(), del({ targets: ['dist/client'] })],
    },
    {
        input: 'src/server/index.ts',
        output: [
            {
                file: 'dist/server.js',
                format: 'cjs',
            },
        ],
        external: ['react-dom/server'],
        plugins: [typescript(), bundleSize(), del({ targets: ['dist/server'] })],
    },
]
