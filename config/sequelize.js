const Sequelize = require('sequelize');
const auth = require('./auth')
const logger = require('../helpers/logger')

let options = auth.database.conf

if (options.logging) {
    options.logging = (msg) => {
        logger.debug(msg)
    }
}

const sequelize = new Sequelize(auth.database.name, auth.database.username, auth.database.password, options);
sequelize.authenticate().catch(err => {
    logger.error('Unable to connect to the database:', err);
});

module.exports = sequelize