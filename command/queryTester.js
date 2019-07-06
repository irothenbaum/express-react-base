/**
 * This is a helper process so we can easily test the result of queries in the queries folders
 * Use like:
 *
 * node queryTester.js [FILE NAME] [--Param1 Value1] [--Param2 Value2]
 *
 * File Name should be just the .sql file inside the queries folder
 *
 * i.e.,
 * node queryTester.js someQuery.sql --user_id 123456789
 *
 * By default all queries are run as SELECT query, use Param "QueryType" to change this.
 * i.e.,
 * node queryTester.js someQuery.sql --QueryType BULKUPDATE
 * @see https://github.com/sequelize/sequelize/blob/master/lib/query-types.js
 */


const Sequelize = require('sequelize')
const sequelizeInstance = require('../config/sequelize')
const fs = require('fs')
const path = require('path')

let argv = require('minimist')(process.argv.slice(2));

let query = loadQuery(argv['_'][0])

let params = {}
Object.entries(argv).forEach(tuple => {
    if (tuple[0] !== '_') {
        params[tuple[0]] = tuple[1]
    }
})

console.log("RUNNING WITH PARAMS:")
console.log("")
console.log(params)
console.log("")
console.log("----------------------------")
console.log("")
console.log("RESULTS:")
console.log("")

runQuery(query, params).then(results => {
    console.log(typeof results)
    console.log(results)
    console.log("")
    process.exit()
})



// -------------------------------------------------------------------------
// HELPERS

function loadQuery(queryName) {
    return fs.readFileSync(path.join(__dirname, 'queries', queryName), "utf8")
}

async function runQuery(query, params) {
    return await sequelizeInstance.query(query, {
        type: params.QueryType || Sequelize.QueryTypes.SELECT,
        replacements: params,
    })
}