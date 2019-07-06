const socketServer = require('../../config/socketServerSingleton')

const SocketHelper = {
    CONVERSATION_SOCKET_CONNECT: 'conversation-messages:connect',
    CONVERSATION_SOCKET_HEARTBEAT: 'conversation-messages:heartbeat',
    CONVERSATION_SOCKET_NEW_MESSAGE: 'conversation-messages:new-message',
    CONVERSATION_SOCKET_READ_MESSAGE: 'conversation-messages:read-message',
    CONVERSATION_SOCKET_OTHER_USER_READ_MESSAGE: 'conversation-messages:other-user-read-message',

    CLIENT_SOCKET_HEARTBEAT: 'client-notifications:heartbeat',
    CLIENT_SOCKET_NEW_MESSAGE: 'client-notifications:new-message',
    CLIENT_SOCKET_NEW_ESCALATION_PING: 'client-notifications:new-escalation-ping',
    CLIENT_SOCKET_NEW_REPORTED_INCIDENT: 'client-notifications:new-reported-incident',
    CLIENT_SOCKET_NEW_DIRECTIVE: 'client-notifications:new-directive',

    SOCKET_OPEN: 1,

    /**
     * @returns {Array}
     */
    getClients() {
        // wss.clients is a set, not an array. But I like arrays
        /** @type {Set} clients */
        let clients = socketServer().getWss().clients
        return Array.from(clients)
    },

    /**
     * @param {string} conversationId
     * @returns {Array<WebSocket>}
     */
    getActiveSocketsInConversation(conversationId) {
        return SocketHelper.getClients().filter(s =>  {
            return s.readyState === SocketHelper.SOCKET_OPEN
                && s.conversationConnection
                && s.conversationConnection.conversation_id === conversationId
        })
    },

    /**
     * @param {Array<string>} clientIds
     * @returns {Array<WebSocket>}
     */
    getActiveClientConnectionsByClientId(clientIds) {
        return SocketHelper.getClients().filter(s =>  {
            return s.readyState === SocketHelper.SOCKET_OPEN
                && s.clientConnection
                && clientIds.indexOf(s.clientConnection.client_id) > -1
        })
    },

    /**
     * @param {WebSocket} socket
     * @param {string} userId
     * @param {string} conversationId
     */
    markSocketForConversation(socket, userId, conversationId) {
        socket.conversationConnection = {
            conversation_id: conversationId,
            user_id: userId
        }
    },

    /**
     * @param {WebSocket} socket
     * @param {string} userId
     * @param {string} clientId
     */
    markSocketForClientNotifications(socket, userId, clientId) {
        socket.clientConnection = {
            user_id: userId,
            client_id: clientId
        }
    },

    /**
     * @param {Array<WebSocket>} sockets
     * @param {string} type
     * @param {object?} data
     */
    pushToSockets(sockets, type, data) {
        let d = Date.now()
        sockets.forEach(s => {
            // only push to active sockets
            if (s.readyState === SocketHelper.SOCKET_OPEN) {
                s.send(JSON.stringify({
                    type: type,
                    payload: data,
                    timestamp: d
                }))
            }
        })
    }
}

module.exports = SocketHelper