module.exports = {
    env: {
        browser: true,
        es2021: true,
        es6: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            experimentalObjectRestSpread: true
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: [
        'react-native',
        'react'
    ],
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'react/prop-types': 0
    },
    'settings': {
        'react': {
            'version': 'detect'
        }
    }
}
