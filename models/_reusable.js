const TYPE_CREATED = 'CREATED'
const TYPE_UPDATED = 'UPDATED'
const TYPE_REMOVED = 'REMOVED'


module.exports = {
    /**
     * @param {Model} model
     * @returns {Function}
     */
    genericAfterFind: function(model) {
        return async (result) => {
            if (!result) {
                return result
            }
            if (typeof model._afterFind === 'function') {
                if(result.constructor === Array) {
                    let arrayLength = result.length;
                    for (let i = 0; i < arrayLength; i++) {
                        result[i] = await model._afterFind(result[i])
                    }
                } else {
                    result = await model._afterFind(result)
                }
            }
            return result;
        }
    },

    /**
     * @param {Model} model
     * @returns {Function}
     */
    genericAfterCreate: function(model) {
        return async (result, options) => {
            if (typeof model._saveForAudit === 'function') {
                await model._saveForAudit(result, options.audit, TYPE_CREATED)
            }

            if (typeof model._afterFind === 'function') {
                await model._afterFind(result)
            }
        }
    },

    /**
     * @param {Model} model
     * @returns {Function}
     */
    genericAfterUpdate: function(model) {
        return async (result, options) => {
            if (typeof model._saveForAudit === 'function') {
                await model._saveForAudit(result, options.audit, TYPE_UPDATED)
            }

            if (typeof model._afterFind === 'function') {
                await model._afterFind(result)
            }
        }
    },

    /**
     * @param {Model} model
     * @returns {Function}
     */
    genericAfterDestroy: function(model) {
        return async (result, options) => {
            if (typeof model._saveForAudit === 'function') {
                await model._saveForAudit(result, options.audit, TYPE_REMOVED)
            }

            if (typeof model._afterFind === 'function') {
                await model._afterFind(result)
            }
        }
    },
}