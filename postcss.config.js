module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-cssnext': {
      browsers: [
        'Chrome >= 48',
        'FireFox >= 44',
        'Safari >= 7',
        'last 4 Edge versions'
      ],
    }
  },
}
