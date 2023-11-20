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

let routesDescription = [
    'Muestra todas las rutas disponibles y los métodos que aceptan, agrega un ejemplo de cada ruta',
    'Muestra todas las tablas disponibles',
    'Muestra la estructura de una tabla',
    'Muestra todos los registros de una tabla',
    'Muestra un registro de una tabla donde :idField coincide con :idValue, por ejemplo: /tables/usuarios/id/1',
    'Muestra todos los registros de una tabla donde un campo coincide con un valor por ejemplo: /tables/usuarios/username/john',
    'Inserta un registro en una tabla por ejemplo: /tables/insert/usuarios/username,password,role/john,1234,admin',
    'Actualiza un registro de una tabla por ejemplo: /tables/update/usuarios/id,username,role/viejoId,viejoUsuario,viejoRol/nuevoId,nuevoUsuario,nuevoRol',
    'Elimina un registro de una tabla por ejemplo: /tables/delete/usuarios/id/1'
];

router.get('/', async (ctx) => {
    // show all routes available and the methods they accept, add a example of each route

    ctx.body = router.stack.map((item) => {
        return { path: item.path, methods: item.methods, description: routesDescription[router.stack.indexOf(item)] }
    });

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
    ctx.status = 404;
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

router.get('/tables/insert/:table/:fieldsArray/:valuesArray', async (ctx) => {

    let table = await cleanParams([ctx.params.table]);
    let fieldsArray = ctx.params.fieldsArray.split(',');
    let valuesArray = ctx.params.valuesArray.split(',');

    console.log(fieldsArray);
    console.log(valuesArray);

    let fields = fieldsArray.map((item) => {
        return { [item]: '' }
    });

    // connect to database
    let connection = await db.createConnection();

    // query database
    let sql = 'INSERT INTO ?? (??) VALUES (?)';

    let results = await new Promise((resolve) => {
        connection.query(sql, [table, fieldsArray, valuesArray], (error, results) => {
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

router.get('/tables/update/:table/:idFieldsArray/:idOriginalValuesArray/:idNewValuesArray', async (ctx) => {

    let table = await cleanParams([ctx.params.table]);

    let idFieldsArray = ctx.params.idFieldsArray.split(',');
    let idValuesArray = ctx.params.idOriginalValuesArray.split(',');
    let idNewValuesArray = ctx.params.idNewValuesArray.split(',');

    console.log(JSON.stringify(idFieldsArray, null, 2));
    console.log(JSON.stringify(idValuesArray, null, 2));
    console.log(JSON.stringify(idNewValuesArray, null, 2));

    // connect to database
    let connection = await db.createConnection();

    // create arrays of arrays for SET and WHERE clauses
    let setArray = idFieldsArray.map((field, i) => [field, idNewValuesArray[i]]);
    let whereArray = idFieldsArray.map((field, i) => [field, idValuesArray[i]]);

    // format SET and WHERE clauses
    let setClause = setArray.map(pair => connection.format('?? = ?', pair)).join(', ');
    let whereClause = whereArray.map(pair => connection.format('?? = ?', pair)).join(' AND ');

    // query database
    let sql = `UPDATE ?? SET ${setClause} WHERE ${whereClause}`;

    let results = await new Promise((resolve) => {
        connection.query(sql, [table], (error, results) => {
            if (error) {
                console.log(JSON.stringify(error, null, 2));
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

router.get('/tables/delete/:table/:idField/:idValue', async (ctx) => {

    let params = await cleanParams([ctx.params.table, ctx.params.idField, ctx.params.idValue]);

    let table = params[0];
    let idField = params[1];
    let idValue = params[2];

    // connect to database
    let connection = await db.createConnection();

    // query database
    let sql = 'DELETE FROM ?? WHERE ?? = ?';

    let results = await new Promise((resolve) => {
        connection.query(sql, [table, idField, idValue], (error, results) => {
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

// login route

router.post('/login', async (ctx) => {

    // extract username and password from request body
    let username = ctx.request.body.username;
    let password = ctx.request.body.password;

    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { message: 'Username and password required' };
        return;
    }

    if (username === 'admin' && password === 'admin') {
        ctx.status = 200;
        ctx.body = { message: 'Login successful' };
        return;
    }
    
});

module.exports = router;