const express = require('express')
const auth = require('../config/auth')
const WebpackStats = require('../react/webpack-stats.json')
const TwigRender = require('../helpers/twigRender')
const asyncHandler = require('express-async-handler')

const router = express.Router()

router.get('/example', asyncHandler(async function(req, res, next){
    res.json([
        'some', 'example', 'data'
    ])
}))

// Load our controllers here
router.get('/game', (req, res, next) => {
    TwigRender(res, 'game', {
        // on Dev, we don't have a bundle hash so we need to bust the client cache with a timestamp
        appFile: WebpackStats.chunks.main[0].name + ( auth.environment === 'development'
            ? ( '?t=' + Date.now() )
            : '')
    })
})

// Handle root route
router.get('/', (req, res) => {
    TwigRender(res, 'landing')
})

module.exports = router