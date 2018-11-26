// server/dev-ssr.js

const webpack = require('webpack')
const axios = require('axios')
const MemoryFS = require('memory-fs')
const fs = require('fs')
const path = require('path')
// 1、webpack配置文件
const webpackConfig = require('@vue/cli-service/webpack.config')
const { createBundleRenderer } = require("vue-server-renderer");

const resolve = file => path.resolve(__dirname, file);

// 2、编译webpack配置文件
const serverCompiler = webpack(webpackConfig)
const mfs = new MemoryFS()
// 指定输出文件到的内存流中
serverCompiler.outputFileSystem = mfs

// 3、监听文件修改，实时编译获取最新的 vue-ssr-server-bundle.json
let bundle
serverCompiler.watch({}, (err, stats) =>{
  if (err) {
    throw err
  }
  stats = stats.toJson()
  stats.errors.forEach(error => console.error(error) )
  stats.warnings.forEach( warn => console.warn(warn) )
  const bundlePath = path.join(
    webpackConfig.output.path,
    'vue-ssr-server-bundle.json'
  )
  bundle = JSON.parse(mfs.readFileSync(bundlePath,'utf-8'))
  console.log('new bundle generated')
})

const express = require('express')
const server = express()

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache ? 24 * 60 * 60 : 0
})

server.use('/js', serve('./dist/js', true))
server.use('/css', serve('./dist/css', true))
server.use('/img', serve('./dist/img', true))

server.get('*', async (req, res) => {

  const clientManifestResp = await axios.get('http://localhost:8080/vue-ssr-client-manifest.json')
  const clientManifest = clientManifestResp.data

  const renderer = createBundleRenderer(bundle, {
    runInNewContext: false,
    template: fs.readFileSync(resolve("../public/index.html"), "utf-8"),
    clientManifest: clientManifest
  });
  
  const context = { url: req.url }

  res.setHeader('Content-Type', 'text-html')

  renderer.renderToString(context, (err, html) => {
      if (err) {
          if (err.code === 404) {
              res.status(404).end('Page not found')
          } else {
              res.status(500).end('Internal Server Error')
          }
      } else {
          res.end(html)
      }
  })

})

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`server started at localhost:${port}`);
});

// module.exports = server