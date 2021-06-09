const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  context: process.cwd(),
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head',
      scriptLoading: 'blocking'
    })
  ],
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    open: true,
    port: 9000,
    // before用来配置路由 express服务器
    before(router){
      router.get('/success', function(req, res){
        // console.log(req)
        res.json({id: 1})
      })
      router.post('/error', function(req, res){
        // console.log(req)
        res.sendStatus(500)
      })
    }
  }
}