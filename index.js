const Koa = require('koa');
const app = new Koa();
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

// try to listen on 80, if its not available, listen on 82
try {
    console.log('listening on port 82');
    app.listen(82);
} catch (error) {
    console.log('Error: ' + error);
    process.exit(1);
}

// use cors
app.use(cors());

// use body parser
app.use(bodyParser());

// log requests
app.use(async (ctx, next) => {
    console.log(`${ctx.method} ${ctx.url} from ${ctx.ip} at ${new Date().toISOString()}`);
    await next();
});


const router = require('./utils/routes');
app.use(router.routes());
