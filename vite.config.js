// vite.config.js
const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        race: resolve(__dirname, 'race/index.html')
      }
    }
  }
}