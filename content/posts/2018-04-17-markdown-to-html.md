# md -> html

There are a lot of great static site generators out there but I'd like to get into the weeds instead.
But not too far in the weeds; there's a great library called [unified](https://github.com/unifiedjs/unified) which is a "interface for processing text using syntax trees".
I'll use this library to turn my Markdown into an abstract syntax tree (AST), apply some transformations, then turn the AST into HTML.

The specific module I need is [remark](https://github.com/remarkjs/remark) which is the Markdown processor built on unified. So I'll install that along with a couple plugins

```bash
> yarn add remark remark-preset-lint-recommended remark-html vfile-reporter
```

Ok, time to copy paste from remark's README.

```javascript
const remark = require('remark')
const recommended = require('remark-preset-lint-recommended')
const html = require('remark-html')
const report = require('vfile-reporter')

remark()
  .use(recommended)
  .use(html)
  .process('## Hello world!', function(err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
```

Which yields the following:

```
  1:1  warning  Missing newline character at end of file  final-newline  remark-lint

⚠ 1 warning
<h2>Hello world!</h2>
```

Nice.
But transforming Markdown strings isn't going to cut it.
I need to process some files.
Luckily, unified has it's own file abstraction called [vfile](https://github.com/vfile/vfile).
This means I can avoid learning Node's core file APIs for a while longer.
There's a little helper library called `to-vile` which will help read and write files to and from vfiles.

```bash
> yarn add to-vfile
```

Now I need to break up the example code a little bit.
First I'm going to stash the processor object into a variable.

```javascript
const processor = remark()
  .use(recommended)
  .use(html)
```

The `remark` function returns a processor object (it's actually just a `unified` processor with some plugins pre-applied).
Unified uses a fluent interface to apply plugins.
Each call to the `use` function returns a new processor with a new plugin applied.
In this case I'm using the `remark-preset-lint-recommended` plugin for linting and the `remark-html` plugin to transform the Markdown to HTML.

Now I need to read a file. I'll use the `read` function provided from the `to-vfile` library.

```javascript
const toVfile = require('to-vfile')

toVfile.read('content/posts/2018-04-17-markdown-to-html.md')
```

The `read` function returns a promise which will resolve with a vfile object.
Our `processor` object has a method called `process` which I passed a callback function to in the first example.
If I don't pass it a callback function, it will return a promise instead which resolves with processed file. Since it returns a promise, I can just pass that function into a promise chain.

```javascript
toVfile
  .read('content/posts/2018-04-17-markdown-to-html.md')
  .then(processor.process)
```

Now I want to write the html back to a file, but I need to change the path on the vfile object first.

```javascript
toVfile
  .read('content/posts/2018-04-17-markdown-to-html.md')
  .then(processor.process)
  .then(file => Object.assign(file, { path: 'markdown-to-html.html' }))
```

To write it to a real file, I'll use the `write` function from `to-vfile`, which I'll just add to the promise chain.

```javascript
toVfile
  .read('content/posts/2018-04-17-markdown-to-html.md')
  .then(processor.process)
  .then(file => Object.assign(file, { path: 'markdown-to-html.html' }))
  .then(toVfile.write)
```

For the finishing touch, I'll add a bit of error reporting.

```javascript
const report = require('vfile-reporter')

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
```

The function provided by `vfile-reporter` can accept either a vfile or an `Error` object. The linting plugin adds messages to the vfile which `vfile-reporter` will turn into a nice looking error message if they're found.

And there we go, a nice little Markdown to HTML processor. All that's left is to dynamically read all the blog posts rather than hard coding the file paths, but that will be left as an exercise for the reader, and also to me, cause I haven't done it yet.
