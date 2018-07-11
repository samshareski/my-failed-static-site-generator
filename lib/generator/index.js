const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const vfile = require('to-vfile')
const report = require('vfile-reporter')
const Mustache = require('mustache')
const rimraf = promisify(require('rimraf'))
const readdir = promisify(fs.readdir)
const mkdir = promisify(fs.mkdir)

const postsDir = path.resolve('content/posts')
const templatesDir = path.resolve('templates')
const distDir = path.resolve('dist')

const { md2html } = require('./processors')

const logFileError = file => {
  const err = report(file, { quiet: true })
  if (err) {
    console.error(err)
  }
  return file
}

const processContent = async (srcDir, templatesDir, dstDir) => {
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

  postTemplate = vfile
    .readSync(path.resolve(templatesDir, 'post.mustache'))
    .toString()

  const wrappedPosts = wrapPosts(postsHtml, distDir, postTemplate)

  rimraf(distDir)
    .then(() => mkdir(distDir))
    .then(() =>
      Promise.all(
        wrappedPosts.map(post =>
          vfile
            .write(post)
            .then(logFileError)
            .catch(err => report(err))
        )
      )
    )
}

const wrapPosts = (postsHtml, distDir, template) => {
  return postsHtml.map(post => {
    const frontmatter = post.data.frontmatter
    return vfile({
      path: path.join(distDir, `${frontmatter.slug}.html`),
      contents: Mustache.render(template, {
        title: frontmatter.title,
        post: post.toString()
      })
    })
  })
}

processContent(postsDir, templatesDir, distDir)
