const fs = require('fs')
const express = require('express')
const server = express()
const path = require('path')
const compression = require('compression')
const favicon = require('serve-favicon')

const resolve = file => path.resolve(__dirname, file);

const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache ? 24 * 60 * 60 : 0
})

const { createBundleRenderer } = require('vue-server-renderer')
const bundle = require('./dist/vue-ssr-server-bundle.json');
const clientManifest = require('./dist/vue-ssr-client-manifest.json');

const renderer = createBundleRenderer(bundle, {
    runInNewContext: false,
    template: fs.readFileSync(resolve('./public/index.html'), 'utf-8'),
    clientManifest,
})

server.use(compression({ threshold: 0 }))
server.use('/js', serve('./dist/js', true))
server.use('/css', serve('./dist/css', true))
server.use('/img', serve('./dist/img', true))
server.use(favicon('./dist/favicon.ico'))

server.get('*', (req, res) => {
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

const port = 3000
server.listen(port,function () {
    console.log(`server started at localhost:${port}`)
})