/**
 * Copyright 2020 Workgrid Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs')
const path = require('path')
const browserify = require('browserify')

const outputDir = path.resolve(__dirname, '../dist')
const cryptoBrowserify = require.resolve('crypto-browserify')

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

const b = browserify([cryptoBrowserify], { standalone: 'crypto-browserify' })
b.bundle().pipe(fs.createWriteStream(path.resolve(outputDir, 'crypto-browserify.js')))
