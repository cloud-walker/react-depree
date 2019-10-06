export default {
  input: 'src/deps-context.js',
  external: ['react'],
  output: {
    file: 'index.js',
    format: 'cjs',
    name: 'react-depree',
  },
}
