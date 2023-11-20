let mysql = require('mysql');
let fs = require('fs');
let path = require('path');

let configPath = path.join(__dirname, 'conn.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (config.dbName === undefined) {
    console.log('Please specify a database name in conn.json');
    process.exit(1);
}


async function createConnection() {

    let connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.dbName
    });

    connection.connect((err) => {
        if (err) {
            console.log('Error connecting to database');
            console.log(err);
            process.exit(1);
        }    }
    );

    return connection;
    
}

async function destroyConnection(connection) {
    connection.end();
}

module.exports = {
    createConnection: createConnection,
    destroyConnection: destroyConnection
};