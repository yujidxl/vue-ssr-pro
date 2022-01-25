const Koa = require('koa');
const Router = require('@koa/router');
const { createBundleRenderer } = require('vue-server-renderer');
const serverBundle = require('./dist/vue-ssr-server-bundle.json');
const clientManifest = require('./dist/vue-ssr-client-manifest.json');
const path = require('path');
const Static = require('koa-static');
const app = new Koa();
const router = new Router();
const resolve = file => path.resolve(__dirname, file);
const template = require('fs').readFileSync(resolve('./src/index.temp.html'), 'utf-8');
const render = createBundleRenderer(serverBundle, {
  template,
  runInNewContext: false,
  clientManifest,
  basedir: resolve('./dist'),
});

app.use(Static(resolve('dist')));

router.get('(.*)', async ctx => {
  const context = { url: ctx.url };
  try {
    const html = await render.renderToString(context);
    ctx.type = 'html';
    ctx.body = html;
  } catch (err) {
    if (err.code === 404) {
      ctx.status = 404;
      ctx.body = 'page not found';
    } else {
      ctx.status = 500;
      ctx.body = 'internal server error';
    }
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
