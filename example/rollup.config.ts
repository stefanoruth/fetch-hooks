import typescript from 'rollup-plugin-typescript2'
import del from 'rollup-plugin-delete'
import nodeResolve from '@rollup/plugin-node-resolve'
import bundleSize from 'rollup-plugin-bundle-size'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'

export default [
    {
        input: 'src/client.tsx',
        output: [
            {
                file: 'dist/client.js',
                format: 'iife',
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
            }),
            commonjs({
                include: /node_modules/,
            }),
            bundleSize(),
            del({ targets: ['dist/client.js'] }),
        ],
    },
]
