const koaRouter = require('koa-router');
const router = new koaRouter();
const db = require('./db');

const tables = []

async function cleanParams(params) {
    let cleanParams = [];
    for (let param of params) {
        cleanParams.push(param.replace(/[^a-z0-9_]/gi, ''));
    }
    return cleanParams;
}

async function getTables() {

    // connect to database
    let connection = await db.createConnection();

    // query database
    let sql = 'SHOW TABLES';

    let results = await new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });

    for (let row of results) {
        tables.push(row[Object.keys(row)[0]]);
    }

    // disconnect from database
    await db.destroyConnection(connection);
}

getTables();

router.get('/', async (ctx) => {
    ctx.body = 'API basica para conectar a una base de datos MySQL';
    ctx.body += '\n\n';
    ctx.body += 'Rutas disponibles:';
    ctx.body += '\n';
    ctx.body += 'GET /tables';
    ctx.body += '\n';
    ctx.body += 'Devuelve un array con los nombres de las tablas de la base de datos';
    ctx.body += '\n\n';
    ctx.body += 'GET /tables/:table';
    ctx.body += '\n';
    ctx.body += 'Devuelve un array con los nombres de los campos de la tabla especificada';
    ctx.body += '\n\n';
    ctx.body += 'GET /tables/:table/all';
    ctx.body += '\n';
    ctx.body += 'Devuelve un array con todos los registros de la tabla especificada';
    ctx.body += '\n\n';
    ctx.body += 'GET /tables/:table/:idField/:idValue';
    ctx.body += '\n';
    ctx.body += 'Devuelve un array con todos los registros de la tabla especificada donde el campo idField coincide con idValue';
    ctx.body += '\n\n';
    ctx.body += 'GET /tables/:table/:field/:value';
    ctx.body += '\n';
    ctx.body += 'Devuelve un array con todos los registros de la tabla especificada donde el campo field coincide con value';
    ctx.status = 200;
});

router.get('/tables', async (ctx) => {
    ctx.body = tables;
    ctx.status = 200;
});

router.get('/tables/:table', async (ctx) => {

    // Clean params

    let table = await cleanParams([ctx.params.table]);

    // connect to database
    let connection = await db.createConnection();

    // query database
    let sql = 'DESCRIBE ??';

    let results = await new Promise((resolve) => {
        connection.query(sql, [table], (error, results) => {
            if (error) {
                resolve(error);
            } else {
                resolve(results);
            }
        });
    });

    // disconnect from database
    await db.destroyConnection(connection);

    ctx.body = results;
    ctx.status = 200;
});

// get all records from a table
router.get('/tables/:table/all', async (ctx) => {

    let table = await cleanParams([ctx.params.table]);

    // connect to database
    let connection = await db.createConnection();

    // query database
    let sql = 'SELECT * FROM ??';

    let results = await new Promise((resolve) => {
        connection.query(sql, [table], (error, results) => {
            if (error) {
                resolve(error);
            } else {
                resolve(results);
            }
        });
    });

    // disconnect from database
    await db.destroyConnection(connection);

    ctx.body = results;
    ctx.status = 200;
});

router.get('/tables/:table/:idField/:idValue', async (ctx) => {

    let params = await cleanParams([ctx.params.table, ctx.params.idField, ctx.params.idValue]);
    
    let table = params[0];
    let idField = params[1];
    let idValue = params[2];


    // connect to database
    let connection = await db.createConnection();

    // query database
    let sql = 'SELECT * FROM ?? WHERE ?? = ?';

    let results = await new Promise((resolve) => {
        connection.query(sql, [table, idField, idValue], (error, results) => {
            if (error) {
                resolve(error)
            } else {
                resolve(results);
            }
        });
    }
    );

    // disconnect from database
    await db.destroyConnection(connection);

    ctx.body = results;
    ctx.status = 200;
});

// get all records from a table where a field matches a value

router.get('/tables/:table/:field/:value', async (ctx) => {
    
        let params = await cleanParams([ctx.params.table, ctx.params.field, ctx.params.value]);

        let table = params[0];
        let field = params[1];
        let value = params[2];
    
        // connect to database
        let connection = await db.createConnection();
    
        // query database
        let sql = 'SELECT * FROM ?? WHERE ?? = ?';
    
        let results = await new Promise((resolve) => {
            connection.query(sql, [table, field, value], (error, results) => {
                if (error) {
                    resolve(error);
                } else {
                    resolve(results);
                }
            });
        }
        );
    
        // disconnect from database
        await db.destroyConnection(connection);
    
        ctx.body = results;
        ctx.status = 200;
    });

module.exports = router;