var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')

var c = config('development')

new WebpackDevServer(webpack(c), {
    https: true,
    publicPath: c.output.publicPath,
    hot: true,
    inline: true,
    historyApiFallback: true,
    // ------------------------------------------------
    // NOTE: this is a security issue! Do not use on Production
    // @see https://stackoverflow.com/questions/43619644/i-am-getting-an-invalid-host-header-message-when-running-my-react-app-in-a-we for more
    disableHostCheck: true
    // ------------------------------------------------
}).listen(3001, '0.0.0.0', function (err, result) {
    if (err) {
        console.log(err)
    }

    console.log('Listening at 0.0.0.0:3001')
})