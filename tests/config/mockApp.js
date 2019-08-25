const express = require('express')
const routes = require('../../routes')
const enableWs = require('express-ws')

const mockApp = express()
enableWs(mockApp, {})

mockApp.use(routes)

module.exports = mockApp