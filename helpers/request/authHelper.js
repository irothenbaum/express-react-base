const AbstractRequestHelper = require('./abstractRequestHelper')

class AuthHelper extends AbstractRequestHelper {
    constructor(req) {
        super(req)

        // init our auth object
        this.req.__AuthCache = this.req.__AuthCache || {}
    }

// -------------------------------------------------------------------
// USER AUTH
// -------------------------------------------------------------------
    async loginAsUser(user) {
        // we regenerate the session
        await (new Promise((resolve, reject) => {
            this.req.session.regenerate((err) => {
                if (err) {
                    reject(err)
                }
                resolve()
            })
        }))

        this.req.session.user_id = user.id

        return this._authObj().User = user
    }
    logout() {
        delete this.req.__AuthCache
        this.req.session.destroy()
    }

    isUserAuthed() {
        return !!this.req.session.user_id
    }

    async getCurrentUser() {
        await this.__loadFromSession()

        let retVal = this._authObj().User
        if (!retVal) {
            throw new Error("Not logged in")
        }
        return retVal
    }

    // -------------------------------------------------------------------
// PRIVATE STUFF
// -------------------------------------------------------------------
    // this is basically a temporary caching object for data loaded within this single request
    // this data is intentionally not persisted in the session
    _authObj() {
        return this.req.__AuthCache
    }

    __clearRoles() {
        delete this._authObj().ClientRoles
    }

    /**
     * @returns {Promise<boolean>}
     * @private
     */
    async __loadFromSession() {
        if (this.req.session.user_id && !this._authObj().User) {
            // TODO: Load database model from session user id
            let user = {
                id: this.req.session.user_id
            }

            if (!user) {
                delete this.req.session.user_id
            } else {
                this._authObj().User = user
            }
        }

        return true
    }
}

module.exports = AuthHelper