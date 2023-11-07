const Koa = require('koa');
const app = new Koa();

// try to listen on 80, if its not available, listen on 82
try {
    console.log('listening on port 80');
    app.listen(80);
} catch (error) {
    console.log('port 80 is not available, listening on port 82');
    app.listen(82);
}

const router = require('./utils/routes');
app.use(router.routes());
