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

const processContent = async (srcDir, templatesDir, distDir) => {
  const postNames = await readdir(srcDir)
  const postPaths = postNames.map(post => path.resolve(srcDir, post))

  const postsHtml = await mdPosts2Html(postPaths)

  const wrappedPosts = wrapPosts(postsHtml, distDir, templatesDir)

  writePostsToDist(wrappedPosts, distDir)
}

const mdPosts2Html = mdPosts => {
  return Promise.all(
    mdPosts.map(post =>
      vfile
        .read(post)
        .then(md2html)
        .then(logFileError)
        .catch(err => report(err))
    )
  )
}

const wrapPosts = (postsHtml, distDir, templatesDir) => {
  postTemplate = vfile
    .readSync(path.resolve(templatesDir, 'post.mustache'))
    .toString()

  return postsHtml.map(post => {
    const frontmatter = post.data.frontmatter
    return vfile({
      path: path.join(distDir, `${frontmatter.slug}.html`),
      contents: Mustache.render(postTemplate, {
        title: frontmatter.title,
        post: post.toString()
      })
    })
  })
}

const writePostsToDist = (posts, distDir) => {
  rimraf(distDir)
    .then(() => mkdir(distDir))
    .then(() =>
      Promise.all(
        posts.map(post =>
          vfile
            .write(post)
            .then(logFileError)
            .catch(err => report(err))
        )
      )
    )
}

processContent(postsDir, templatesDir, distDir)
