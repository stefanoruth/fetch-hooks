import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

export default [
    {
        input: 'src/client.tsx',
        output: [
            {
                file: 'dist/client.js',
                format: 'iife',
                sourceMap: 'inline',
            },
        ],
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
        },
        plugins: [commonjs(), typescript()],
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
        plugins: [commonjs(), typescript()],
    },
]
