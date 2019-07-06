const {
    EXAMPLE_ACTION
} = require('../constants/actionTypes')
const {
    GET_EXAMPLE,
} = require('../constants/endpoints')
const api = require('../../../helpers/api')

const updateExample = (data) => {
    return {
        type: EXAMPLE_ACTION,
        value: data
    }
}

module.exports = {
    syncExampleAction: async (dispatch) => {
        try {
            let response = await api.get(GET_EXAMPLE)
            dispatch(updateExample(response.data))
        } catch (e) {
            console.error(e)
        }
    },
}