# My Failed Static Site Generator
## What I Wanted to Do
Build my own static site generator similar to [Gatsby.js](https://www.gatsbyjs.org/).
I wanted to write my blog posts in Markdown and convert them to HTML plus all the necessary navigation pages.

## How far I got
I got the conversion from MD -> HTML using [unified](https://unifiedjs.github.io/).
I got part way through taking my static assets and fingerprinting them with a hash.

## Why I gave up
I was just using a Node script to do all of the build steps. I'm not a master at Node and I found dealing with files very frustrating.
Unified uses a vfile abstraction library for dealing with files which was great when it worked.
But then I ran into some issues where it was failing silently for reasons I couldn't figure out.

I also started to realizing that making my posts in Markdown was going to limit me a little bit. 
I thought about using [MDX](https://github.com/mdx-js/mdx) but I was beginning to get tired of writing all these build steps.

I released that at the pace that I was likely to produce content, doing all the optimizations and build step stuff for my site wasn't going to be my bottleneck.
I'm also starting to think that static front end projects that can't serve their source code and have it be semi-functional is kind of crappy.

## Closing thoughts
I'm happy I tried to make this. I learned a lot about how things like Gatsby and webpack work by digging through their source and trying to copy their features.

My next attempt at writing a blog will probably be a back to basics approach where I do as many things manually as possible until the manual steps take more time than actually producing content.
