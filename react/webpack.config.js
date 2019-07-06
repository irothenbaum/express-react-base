//require our dependencies
const path = require('path')
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')
const auth = require('../config/auth.json')

const PROJECT_PATH = './react'
const BUNDLE_PATH = './assets/js/react'

module.exports = (env) => {

    if (!env) {
        env = auth.environment
    }

    let config = {
        //the base directory (absolute path) for resolving the entry option
        context: __dirname,

        mode: env,

        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },

        // we don't specify the extension now, because we will later in the `resolve` section
        entry: [
            './src/index'
        ],

        output: {
            // where we want our compiled bundle to be stored
            path: path.resolve(BUNDLE_PATH),

            // No hash for development builds
            filename: env === 'development' ? '[name].js' : '[name]-[hash].js',
        },

        plugins: [
            //tells webpack where to store data about your bundles.
            new BundleTracker({filename: PROJECT_PATH + '/webpack-stats.json'}),
        ],

        module: {
            rules: [
                {
                    //a regexp that tells webpack use the following loaders on all
                    //.js and .jsx files
                    test: /\.jsx?$/,

                    // we don't want babel to transpile all the files in node_modules
                    exclude: /node_modules/,

                    use: [
                        {
                            // use babel to convert our ES6 into ES5
                            loader: 'babel-loader',
                            query: {
                                //specify that we will be dealing with React code
                                presets: ['@babel/preset-react']
                            },
                        }
                    ]
                }, {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader", // translates CSS into CommonJS
                            options: { sourceMap: true }
                        },
                        {
                            loader: "sass-loader", // compiles Sass to CSS
                            options: {
                                sourceMap: true,
                                includePaths: [path.resolve('./assets/css/')]
                            }
                        }
                    ]
                }
            ]
        },

        resolve: {
            //extensions that should be used to resolve modules
            extensions: ['.js', '.jsx']
        }
    }

    /*
    // This would use a webpack-dev-server to hot reload during dev, but I'd need to work out a way to get the bundle
    // path to the frontend, so disabling for now
    if (env === 'development') {
        config.entry.unshift('webpack/hot/only-dev-server')
        config.entry.unshift('webpack-dev-server/client?'+auth.domain+':3001')

        // tells the URL to load packages
        config.output.publicPath = auth.domain + ':3001/assets/bundles/';

        // use the hot module replace loader (doesn't work for VMs, but still cool to have)
        config.plugins.unshift(new webpack.HotModuleReplacementPlugin());

        config.module.rules[0].use.unshift({
            // use our react-hot-loader
            loader: 'react-hot-loader/webpack'
        });
    }
    */

    return config
}

