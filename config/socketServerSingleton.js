const enableWs = require('express-ws')

let wsInstance

/**
 * @param {*?} app
 * @param {*?} server
 * @returns {*}
 */
module.exports = function(app, server) {
    if (!wsInstance) {
        if (!app || !server) {
            throw new Error("Cannot initialize singleton")
        }

        // enable Web Sockets for chat
        wsInstance = enableWs(app, server, {
            wsOptions: {
                maxPayload: 65535
            }
        })
    }

    return wsInstance
}

