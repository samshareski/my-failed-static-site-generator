const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const vfile = require('to-vfile')
const report = require('vfile-reporter')
const readdir = promisify(fs.readdir)

const postsDir = path.resolve('content/posts')
const distDir = path.resolve('dist')

const { md2html } = require('./processors')

const logFileError = file => {
  const err = report(file, { quiet: true })
  if (err) {
    console.error(err)
  }
  return file
}

const processContent = async (srcDir, dstDir) => {
  const postNames = await readdir(srcDir)
  const postsHtml = await Promise.all(
    postNames.map(post =>
      vfile
        .read(path.resolve(postsDir, post))
        .then(md2html)
        .then(logFileError)
        .catch(err => report(err))
    )
  )

  console.dir(postsHtml)
}

processContent(postsDir, distDir)
