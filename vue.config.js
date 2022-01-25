const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
module.exports = {
  configureWebpack: () => {
    const config = {
      client: {
        entry: './src/entry-client.js',
        optimization: {
          splitChunks: {
            cacheGroups: {
              defaultVendors: {
                test(module) {
                  return (
                    // 如果它在 node_modules 中
                    /node_modules/.test(module.context) &&
                    // 如果 request 是一个 CSS 文件，则无需外置化提取
                    !/\.css$/.test(module.request)
                  );
                },
                priority: -10,
                reuseExistingChunk: true,
              },
              common: {
                name: 'manifest',
                priority: -9,
                minChunks: 2,
              },
            },
          },
        },
        plugins: [new VueSSRClientPlugin()],
      },
      server: {
        // 将 entry 指向应用程序的 server entry 文件
        entry: './src/entry-server.js',
        // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
        // 并且还会在编译 Vue 组件时，
        // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
        target: 'node',

        // 对 bundle renderer 提供 source map 支持
        devtool: 'source-map',

        // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
        output: {
          libraryTarget: 'commonjs2',
        },
        optimization: {
          splitChunks: false
        },
        // https://webpack.js.org/configuration/externals/#function
        // https://github.com/liady/webpack-node-externals
        // 外置化应用程序依赖模块。可以使服务器构建速度更快，
        // 并生成较小的 bundle 文件。
        // externals: nodeExternals({
        // 不要外置化 webpack 需要处理的依赖模块。
        // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
        // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
        //   whitelist: /\.css$/,
        // }),
        externals: /\.css$/,

        // 这是将服务器的整个输出
        // 构建为单个 JSON 文件的插件。
        // 默认文件名为 `vue-ssr-server-bundle.json`
        plugins: [new VueSSRServerPlugin()],
      },
    };
    return config[process.env.VUE_APP_BUILD_TARGET];
  },
  chainWebpack(config) {
    if (process.env.VUE_APP_BUILD_TARGET === 'server') {
      delete config.plugins.delete('clean');
    }
  },
};
