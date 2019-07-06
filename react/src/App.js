const css = require('./App.scss')
const {
    _BASE_PATH,
    ROUTE_ROOT,
    ROUTE_GAME
} = require("./constants/routes")
const { BrowserRouter: Router, Route } = require('react-router-dom')
const { createStore } = require("redux")
const { Provider } = require('react-redux')
const rootReducer = require("./reducers")
const React = require('react')
const Landing = require('./screens/Landing')

const store = createStore(rootReducer)

class App extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <Provider store={store}>
                <Router basename={_BASE_PATH}>
                    <h1>Street Chess</h1>
                    <Route path={ROUTE_ROOT} component={Landing} />
                </Router>
            </Provider>
        )
    }
}

module.exports = App