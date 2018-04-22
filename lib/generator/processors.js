const unified = require('unified')
const markdown = require('remark-parse')
const remark2rehype = require('remark-rehype')
const html = require('rehype-stringify')
const frontmatter = require('remark-frontmatter')
const extractFrontmatter = require('./plugin/extractYaml')
const recommended = require('remark-preset-lint-recommended')

const md2html = unified()
  .use(markdown)
  .use(recommended)
  .use(frontmatter)
  .use(extractFrontmatter)
  .use(remark2rehype)
  .use(html)
  .freeze().process

module.exports = { md2html }
