const { combineReducers } = require('redux')
const example = require('./example')

module.exports = combineReducers({
    /*
    debug: (state = {}, action) => {
        console.log(action)
        return state
    },
    */
    Example: example
});