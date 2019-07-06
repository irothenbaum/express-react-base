const createError = require('http-errors');
const asyncHandler = require('express-async-handler')
const AuthHelper = require('../helpers/request/authHelper')

const UserAuthRequired = asyncHandler(async function(req, res, next) {
    let authHelper = new AuthHelper(req)
    if (authHelper.isUserAuthed()) {
        return next()
    } else {
        if (!req._respondsWithJSON) {
            req.session._next = req.originalUrl
        }
        return next(createError(401, "Must be logged in to access this resource"));
    }
})

module.exports = UserAuthRequired