const path = require('path')
module.exports = {
  publicPath: '/',
  productionSourceMap: false,
  devServer: {
  
  },
  transpileDependencies: [
    /\/node_modules\/vue-echarts\//,
    /\/node_modules\/resize-detector\//
  ]
}
