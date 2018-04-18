const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const remark = require('remark')
const recommended = require('remark-preset-lint-recommended')
const html = require('remark-html')
const toVfile = require('to-vfile')
const report = require('vfile-reporter')
// const readdir = promisify(fs.readdir)

// const postsDir = path.resolve('content/posts')
// const distDir = path.resolve('dist')

// const processContent = async (srcDir, dstDir) => {
//   const yearDirs = await readdir(srcDir)

//   console.log(yearDirs)
// }

// processContent(postsDir, distDir)
const processor = remark()
  .use(recommended)
  .use(html)

toVfile
  .read('content/posts/2018-04-17-markdown-to-html.md')
  .then(processor.process)
  .then(file => {
    const err = report(file, { quiet: true })
    if (err) {
      console.error(err)
    }
    return file
  })
  .then(file => Object.assign(file, { path: 'markdown-to-html.html' }))
  .then(toVfile.write)
  .catch(err => console.error(report(err)))
