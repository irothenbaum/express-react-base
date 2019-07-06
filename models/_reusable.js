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
            if(result.constructor === Array) {
                let arrayLength = result.length;
                for (let i = 0; i < arrayLength; i++) {
                    result[i] = await model._afterFind(result[i])
                }
            } else {
                result = await model._afterFind(result)
            }
            return result;
        }
    },

    /**
     * @param {Model} model
     * @returns {Function}
     */
    genericAfterCreate: function(model) {
        return async (result) => {
            await model._afterFind(result)
        }
    },
}