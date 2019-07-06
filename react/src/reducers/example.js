const {
    EXAMPLE_ACTION,
} = require('../constants/actionTypes')

const initialState = {
    data : [],
}

function setExampleData(state, data) {
    return {...state, data: data}
}

// Reducers should export a single function which takes the state object and the action that was dispatched
module.exports = function(state = initialState, action) {
    switch (action.type) {
        case EXAMPLE_ACTION:
            return setExampleData(state, action.value);
    }

    return state
}