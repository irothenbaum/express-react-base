export const _BASE_PATH = '/'
export const ROUTE_ROOT = '/'
export const ROUTE_GAME = '/game/:game_id'

export const ConstructLink = (route, params) => {
    let retVal = route
    if (typeof params === 'object') {
        Object.entries(params).forEach(tuple => {
            // TODO: Should we check that they didn't send *extra* params for this route?
            retVal = retVal.replace(':' + tuple[0], tuple[1])
        })
    }

    // make sure we didn't miss any params
    if (retVal.indexOf(':') !== -1) {
        throw new Error("Invalid link created")
    }

    return retVal
}

