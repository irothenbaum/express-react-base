import Observable from './simpleObservable'

// This event fires whenever we send a message to the server
export const EVENT_MESSAGE_SENT = 'message-sent'

// This event fires when our socket connects
export const EVENT_CONNECTION_OPENED = 'connection-opened'

// This event fires when our socket closes
export const EVENT_CONNECTION_CLOSED = 'connection-closed'

// This event fires when our socket experiences an error (i.e., heartbeat failure)
export const EVENT_CONNECTION_ERROR = 'connection-error'

// 50 milliseconds
const QUEUE_CHECK_TIMEOUT = 50

// 1 === WebSocket.OPEN
const OPEN_STATE = 1

export class HeartbeatSocket extends Observable {
    /**
     * @param {string} url
     */
    constructor(url) {
        super()
        this.__socket = new WebSocket(url)
        this.__missedHeartbeats = 0

        this.__queue = []

        this._send = this._send.bind(this)
        this.__sendInternal = this.__sendInternal.bind(this)
        this._initSocket()
    }

    _initSocket() {
        throw new Error("Inherited class must override the _initSocket function")
    }

    /**
     * @param {string} type
     * @param {number} timeout
     * @protected
     */
    _startHeartbeat(type, timeout) {
        // don't allow us to double-heartbeat
        if (this.__heartbeatInterval) {
            clearInterval(this.__heartbeatInterval)
        }

        this.__heartbeatInterval = setInterval(() => {
            try {
                this.__missedHeartbeats++
                if (this.__missedHeartbeats >= 3) {
                    throw new Error("Too many missed heartbeats.")
                }
                this._send(type)
            } catch(e) {
                this.trigger(EVENT_CONNECTION_ERROR, e.message)
                this.close();
            }
        }, timeout)
    }

    /**
     * @param {string} type
     * @param {object?} data
     */
    _send(type, data) {
        if (this.__socket.readyState !== OPEN_STATE) {
            this.__queue.push(arguments)
            this.__startQueue()
            return false
        } else {
            return this.__sendInternal(type, data)
        }
    }

    /**
     * @param {string} type
     * @param {object?} data
     */
    __sendInternal(type, data) {
        this.__socket.send(JSON.stringify({type: type, payload: data, timestamp: Date.now()}))
        this.trigger(EVENT_MESSAGE_SENT, {type, data})
    }

    __startQueue() {
        if (this.__queueInterval) {
            // do nothing, it's already started
            return
        }

        this.__queueInterval = setInterval(() => {
            if (this.__socket.readyState === OPEN_STATE) {
                // it's open, no need to continue checking
                clearInterval(this.__queueInterval)
                delete this.__queueInterval

                // notify that we're open again
                this.trigger(EVENT_CONNECTION_OPENED)

                // if we have a queue, we need to start sending it
                if (this.__queue.length > 0) {
                    do {
                        // grab the oldest item in the queue
                        let args = this.__queue.shift()
                        // NOTE: we call send not sendInternal because it could potentially die again
                        // If it does die again, the queue will restart and that item will be back at the end.
                        // so, while not ideal because it loses its place in line, it will properly prevent duplicates + dropped messages
                        this._send(args[0], args[1])

                    } while (this.__queue.length > 0 && this.__socket.readyState === OPEN_STATE)

                    // if we broke our loop because it died again, we need to re-start the poll
                    // NOTE: This is only *needed* if it dies in the microsecond between the last _send(...) and the while condition check
                    // because if the _send(...) failed it would have already started again
                    if (this.__socket.readyState !== OPEN_STATE && this.__queue.length > 0) {
                        this.__startQueue()
                    }
                }
            }
        }, QUEUE_CHECK_TIMEOUT)
    }

    close() {
        clearInterval(this.__heartbeatInterval)
        delete this.__heartbeatInterval

        clearInterval(this.__queueInterval)
        delete this.__queueInterval

        this.__socket.close()
        this.trigger(EVENT_CONNECTION_CLOSED)
    }
}