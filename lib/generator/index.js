const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const promisify = require('util').promisify

const vfile = require('to-vfile')
const vfileFindDown = require('vfile-find-down')
const vfileFindAll = promisify(vfileFindDown.all)
const vfileFindOne = promisify(vfileFindDown.one)
const report = require('vfile-reporter')
const rehype = require('rehype')
const Mustache = require('mustache')
const rimraf = promisify(require('rimraf'))

const postsDir = path.resolve('content/posts')
const assetsDir = path.resolve('content/assets')
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

const processContent = async (postsDir, assetsDir, templatesDir, distDir) => {
  const assets = await vfileFindAll(
    ['.png', '.jpeg', '.gif', '.mp4'],
    assetsDir
  )
  const fingerprintedAssets = await fingerprintAssets(assets, distDir)

  const postsMd = await vfileFindAll('.md', postsDir)

  const postsHtml = await mdPosts2Html(postsMd)

  const wrappedPosts = await wrapPosts(postsHtml, distDir, templatesDir)

  const allFiles = wrappedPosts.concat(fingerprintedAssets)
  await writeFilesToDist(allFiles, distDir)
}

const fingerprintAssets = (assets, distDir) => {
  return Promise.all(
    assets.map(asset =>
      vfile
        .read(asset)
        .then(file => {
          file.data.oldPath = file.path
          return file
        })
        .then(fingerprintAsset)
        .then(moveToDist(distDir, 'static', 'images'))
        .then(logFileError)
        .catch(err => report(err))
    )
  )
}

const fingerprintAsset = asset => {
  const hash = crypto.createHash('sha256')

  hash.update(asset.contents)

  const tag = hash.digest('hex')
  const tagTruncated = tag.substring(tag.length - 20)
  asset.stem = `${asset.stem}.${tagTruncated}`
  return asset
}

const moveToDist = (dist, ...subFolders) => file => {
  const dir = path.resolve(dist, ...subFolders)
  file.dirname = dir
  return file
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

const wrapPosts = async (postsHtml, distDir, templatesDir) => {
  postTemplate = await vfile.read(path.resolve(templatesDir, 'post.mustache'))

  return postsHtml.map(post => {
    const frontmatter = post.data.frontmatter
    return vfile({
      path: path.join(distDir, 'posts', `${frontmatter.slug}.html`),
      contents: Mustache.render(postTemplate.toString(), {
        title: frontmatter.title,
        post: post.toString()
      })
    })
  })
}

const mkDirs = file => {
  const { root, dir } = path.parse(file.path)
  const strippedRootDir = dir.substr(root.length)
  const dirList = strippedRootDir.split(path.sep)

  dirList.reduce((acc, dir) => {
    const fullPath = path.resolve(acc, dir)

    try {
      fs.statSync(fullPath)
    } catch (err) {
      if (err.code === 'ENOENT') {
        fs.mkdirSync(fullPath)
      }
    }

    return fullPath
  }, root)
}

const writeFilesToDist = async (files, distDir) => {
  return rimraf(distDir).then(() =>
    Promise.all(
      files.map(file => {
        mkDirs(file)
        return vfile
          .write(file)
          .then(logFileError)
          .catch(err => report(err))
      })
    )
  )
}

processContent(postsDir, assetsDir, templatesDir, distDir)
