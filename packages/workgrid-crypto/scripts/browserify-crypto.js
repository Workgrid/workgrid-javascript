const fs = require('fs')
const path = require('path')
const browserify = require('browserify')

const outputDir = path.resolve(__dirname, '../dist')
const cryptoBrowserify = require.resolve('crypto-browserify')

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

const b = browserify([cryptoBrowserify], { standalone: 'crypto-browserify' })
b.bundle().pipe(fs.createWriteStream(path.resolve(outputDir, 'crypto-browserify.js')))
