const RespondsWithJSON = function(req, res, next) {
    req._respondsWithJSON = true
    return next()
}

module.exports = RespondsWithJSON