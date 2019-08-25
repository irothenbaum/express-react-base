const BaseController = require('./BaseController')
const TwigRender = require('../helpers/twigRender')
const auth = require('../config/auth')
const WebpackStats = require('../react/webpack-stats.json')

class LandingController extends BaseController {
    static async getRoot(req, res, next) {
        TwigRender(res, 'landing')
    }

    static async getExample(req, res, next) {
        res.json([
            'some', 'example', 'data'
        ])
    }

    static async getGamePage(req, res, next) {
        TwigRender(res, 'game', {
            // on Dev, we don't have a bundle hash so we need to bust the client cache with a timestamp
            appFile: WebpackStats.chunks.main[0].name + ( auth.environment === 'development'
                ? ( '?t=' + Date.now() )
                : '')
        })
    }
}

module.exports = LandingController