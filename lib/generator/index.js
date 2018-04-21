const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const unified = require('unified')
const markdown = require('remark-parse')
const remark2rehype = require('remark-rehype')
const html = require('rehype-stringify')
const frontmatter = require('remark-frontmatter')
const extractFrontmatter = require('./plugin/extractYaml')
const recommended = require('remark-preset-lint-recommended')
const vfile = require('to-vfile')
const report = require('vfile-reporter')
// const readdir = promisify(fs.readdir)

// const postsDir = path.resolve('content/posts')
// const distDir = path.resolve('dist')

// const processContent = async (srcDir, dstDir) => {
//   const yearDirs = await readdir(srcDir)

//   console.log(yearDirs)
// }

// processContent(postsDir, distDir)
const processor = unified()
  .use(markdown)
  .use(recommended)
  .use(frontmatter)
  .use(extractFrontmatter)
  .use(remark2rehype)
  .use(html)

vfile
  .read('content/posts/2018-04-17-markdown-to-html.md')
  .then(processor.process)
  .then(file => {
    const err = report(file, { quiet: true })
    if (err) {
      console.error(err)
    }
    console.dir(file)
    return file
  })
  .catch(err => console.error(report(err)))
