const express = require('express')
const asyncHandler = require('express-async-handler')
const LandingController = require('../controllers/LandingController')
const respondsWithJson = require('../middlewares/respondsWithJSON')

const router = express.Router()

// Handle root route
router.get('/', asyncHandler(LandingController.getRoot))

// some other example (with json)
router.get('/example', respondsWithJson, asyncHandler(LandingController.getExample))

// how we handle the react app page
router.get('/game', asyncHandler(LandingController.getGamePage))

module.exports = router