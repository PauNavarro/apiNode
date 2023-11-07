const Koa = require('koa');
const app = new Koa();

app.listen(82);
console.log('Server running on port 82');

const router = require('./utils/routes');
app.use(router.routes());
