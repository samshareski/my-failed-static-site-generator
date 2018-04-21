const visit = require('unist-util-visit')
const remove = require('unist-util-remove')
const yaml = require('js-yaml')
const report = require('vfile-reporter')

function visitor(node, file) {
  try {
    file.data.frontmatter = yaml.safeLoad(node.value)
  } catch (err) {
    report(err)
  }
}

function transformer(tree, file) {
  visit(tree, 'yaml', node => visitor(node, file))
  remove(tree, 'yaml')
}

function attacher() {
  return transformer
}

module.exports = attacher
