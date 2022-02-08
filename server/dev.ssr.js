const webpack = require('webpack');
const axios = require('axios');
const MemoryFS = require('memory-fs');
const fs = require('fs');
const path = require('path');
const Router = require('@koa/router');

// webpack配置文件
const webpackConfig = require('@vue/cli-service/webpack.config');
const { createBundleRenderer } = require('vue-server-renderer');

// 编译webpack配置文件
  const serverCompiler = webpack(webpackConfig);
  const mfs = new MemoryFS();
  serverCompiler.outputFileSystem = mfs;

// 监听文件修改，实时编译获取最新的vue-ssr-server-bundle.json
let bundle;
serverCompiler.watch({}, (err, stats) => {
  if (err) {
    throw err;
  }
  const _stats = stats.toJson();
  _stats.errors.forEach(error => console.log(error));
  _stats.warnings.forEach(warn => console.warn(warn));
  const bundlePath = path.join(webpackConfig.output.path, 'vue-ssr-server-bundle.json');
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'));
});

// 处理请求
const handleRequest = async ctx => {
  console.log('path', ctx.path);
  if (!bundle) {
    ctx.body = '等待webpack打包完成后再访问';
    return;
  }

  // 获取最新的vue-ssr-client-manifest.json
  let clientManifestResp, clientManifest;
  try {
    clientManifestResp = await axios.get('http://localhost:8080/vue-ssr-client-manifest.json');
    clientManifest = clientManifestResp.data;
  } catch (err) {
    console.log('获取资源接口资源错误！');
  }

  const renderer = createBundleRenderer(bundle, {
    runInNewContext: false,
    template: fs.readFileSync(path.resolve(__dirname, '../src/index.temp.html'), 'utf-8'),
    clientManifest,
  });
  try {
    const html = await renderToString(ctx, renderer);
    ctx.body = html;
  } catch (err) {
    console.log('err event: ' + err);
  }
};

function renderToString(context, renderer) {
  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      err ? reject(err) : resolve(html);
    });
  });
}

const router = new Router();

router.get('(.*)', handleRequest);

module.exports = router;
