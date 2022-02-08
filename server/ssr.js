const Koa = require('koa');
// const koaStatic = require('koa-static');
// const path = require('path');

// const resolve = file => path.resolve(__dirname, file);
const app = new Koa();

const router = require('./dev.ssr');

app.use(router.routes()).use(router.allowedMethods());

// app.use(koaStatic(resolve('./dist')));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server started at localhost:${port}`);
});

module.exports = app;
