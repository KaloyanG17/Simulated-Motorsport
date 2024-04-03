// vite.config.js
const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        race: resolve(__dirname, 'race/index.html'),
        qualifying: resolve(__dirname, 'qualifying/index.html'),
        info: resolve(__dirname, 'info/index.html'),
        indexLow: resolve(__dirname, 'indexLow/index.html'),
      }
    }
  }
}