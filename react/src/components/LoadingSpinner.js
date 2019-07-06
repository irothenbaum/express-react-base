const React = require('react')

class LoadingSpinner extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div style={{textAlign: 'center'}}>
                <div className={"loading-spinner"}> </div>
            </div>
        )
    }
}

module.exports = LoadingSpinner