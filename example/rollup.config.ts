import typescript from 'rollup-plugin-typescript2'
import del from 'rollup-plugin-delete'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import bundleSize from 'rollup-plugin-bundle-size'
import replace from '@rollup/plugin-replace'

export default [
    {
        input: 'src/client.tsx',
        output: [
            {
                file: 'dist/client.js',
                format: 'iife',
                sourcemap: 'inline',
                name: 'app',
            },
        ],
        plugins: [
            replace({
                preventAssignment: true,
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            typescript(),
            nodeResolve({
                browser: true,
                dedupe: ['react', 'react-dom'],
            }),
            commonjs({
                include: ['node_modules/**'],
            }),
            bundleSize(),
            del({ targets: ['dist/client.js'] }),
        ],
    },
    {
        input: 'src/server.tsx',
        output: [
            {
                file: 'dist/server.js',
                format: 'cjs',
            },
        ],
        external: [
            'react',
            'react-dom',
            'react-dom/server',
            'express',
            'path',
            'cors',
            '@stefanoruth/fetch-hooks',
            '@stefanoruth/fetch-hooks/server',
        ],
        plugins: [typescript(), bundleSize(), del({ targets: ['dist/server.js'] })],
    },
]
