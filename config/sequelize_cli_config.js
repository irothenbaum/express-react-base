/**
 * This file is used to translate our auth.json data object into the format expected by Sequelize-cli
 * NOTE: we use the development key (even on prod) because that's the default prop it will look for
 * @see http://docs.sequelizejs.com/manual/tutorial/migrations.html#dynamic-configuration
 */
const auth = require('./auth');

module.exports = {
    development: {
        username: auth.database.username,
        password: auth.database.password,
        database: auth.database.name,
        host: auth.database.conf.host,
        dialect: auth.database.conf.dialect,
    },
    test: {
        username: auth.test_database.username,
        password: auth.test_database.password,
        database: auth.test_database.name,
        host: auth.test_database.conf.host,
        dialect: auth.test_database.conf.dialect,
    }
};