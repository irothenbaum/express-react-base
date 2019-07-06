const axios = require('axios')

axios.defaults.withCredentials = true

axios.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response.status === 401) {
        console.warn("Lost session. Logging out...")
        window.location.href="/clients/login"
    }
    return Promise.reject(error)
})

const serialize = function(obj) {
    let str = [];
    for (let p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

class API {
    /**
     *
     * @param {string} url
     * @param {object?} data
     * @returns {Promise}
     */
    get(url, data = null) {
        url += '?' + serialize(data)
        return this._fetchInternal('get', url, data)
    }

    /**
     *
     * @param {string} url
     * @param {object|FormData?} data
     * @returns {Promise}
     */
    post(url, data = null) {
        return this._fetchInternal('post', url, data, null)
    }

    /**
     *
     * @param {string} url
     * @param {object?} data
     * @returns {Promise}
     */
    put(url, data = null) {
        return this._fetchInternal('put', url, data)
    }

    /**
     *
     * @param {string} url
     * @returns {Promise}
     */
    delete(url) {
        return this._fetchInternal('delete', url)
    }

    /**
     * @param {string} method
     * @param {string} url
     * @param {object|FormData} data
     * @param {object?} headers
     * @returns {Promise}
     * @private
     */
    _fetchInternal(method, url, data = null, headers = null) {
        return this.__fetchAxios(...arguments)
    }


    __fetchAxios(method, url, data=null, headers=null) {
        if (data instanceof FormData) {
            headers = Object.assign({}, headers, {'Content-Type': 'multipart/form-data'})
        }

        let config
        if (headers) {
            config = {
                headers: headers
            }
        }

        return axios(url, {
            method,
            data: data,
            config: config,
            withCredentials: true
        }).then(response => {
            return {
                status: response.status,
                data: response.data,
                url: url,
                method
            }
        }).catch(err => {
            if (!err.response) {
                // the server isn't running?
                return Promise.reject({
                    status: 0,
                    data: null,
                    url: url,
                    method
                })
            }
            return Promise.reject({
                status: err.response.status,
                data: err.response.data,
                url: url,
                method
            })
        })
    }
}

module.exports = (new API())