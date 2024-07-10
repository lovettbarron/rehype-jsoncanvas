# rehype-jsoncanvas

NOTE: This project is currently in active development/prove of concept stage and has a number of limitations. But feel free to fork, PR, or add issues if you have requests and I will respond quickly.

## What does this do?

A rehype plugin that renders a [json-canvas](https://jsoncanvas.org/) element, probably downstream from a markdown file.

Rendered Canvas inside of Obsidian
![](./example/test-for-plugin.png)

Rendered canvas as svg on [next shims](https://github.com/lovettbarron/shims)
![](./example/currentrender.png)

## Why does it do it?

Because I really like the obsidian json-canvas format, and would like to leverage it a bit more simply in my websites.

Rehype is a toolkit in the unified.js ecosystem that works to parse html trees and manipulate specific elements from those trees. It works well with Markdown and html, and so is perfect for this use case. Becuse the Obsidian ecosystem is primarily markdown, building something like this in the unified ecosystem makes sense.

## How does it do it?

Parses the html content (If it's from markdown, usually after the markdown has been translates), then renders a canvas

## Install and Use

```
npm i rehype-jsoncanvas
```

And then import it

```
import rehypeJsonCanvas from "rehype-jsoncanvas"
```

Then use it however you use rehype plugins. Please note, it will not work with `react-markdown` as that component doesn't currently support async rehype plugins.

This is an example of using Unified to render out the base.md markdown. Basically you need to process the markdown first, then transform the markdown rehype. The plugin will then look for rendered images with a .canvas extension to render out the jsonCanvas.

```js
async function renderMarkdown(markdown: string) {
  const md = await unified()
    .use(parser)
    .use(mdast2hast)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeRaw)
    .use(rehypePrism)
    .use(rehypeJsonCanvas, { ssrPath: "public", mdPath: "_content" })
    .use(rehypeStringify)
    .process(markdown);

  return md;
}
const markdown = await renderMarkdown(content);
const rendered = (await markdown.value) as string;
```

and pull that rendered markdown into your dom somehow

```jsx
<div
  className={markdownStyles["markdown"]}
  dangerouslySetInnerHTML={{ __html: rendered }}
/>
```

See [base.md](example/base.md) for an examples. A simple nextjs app lives [in this repo](hhttps://github.com/lovettbarron/shims/) to see how it might be used (rehype-jsoncanvas-ssr), though the react app doesn't currently work.

## Options

The [options](src/options.ts) file has everything, but I'll just share the used ones currently. Please note that these are likely to change before I hit v1.0. They currently define the path broadly, and an overview might look like this:

Grab a file via filesync: ProjectDirectory/ssrPath/assetpath/filename.extension
Grab a file via fetch: url/assetpath/filename.extension
Read a mdfile ssr NOT stored in static directory: ProjectDirectory/mdPath/filename.md

There's definitely a better way to do this but...

####options.ssrPath
Takes a string and defaults to 'public' from the nextjs ecosystem. This defines where any static files are stored within the relative project directory.

####options.assetPath
Takes a string or null, and if the .canvas and image files lives somewhere underneath the SSR path. Think of this as the relative path within your static folder as the top level directory. This is used when embedding images within the svg.

####options.mdPath
Path to markdown files relative to project directory. Assuming you don't store the markdown directory in your static folder.

####options.nodeStrokeWidth
Defines the stroke width of node box borders

####options.lineStrokeWidth
Defines the stroke width of lines between nodes.

####options.openEmbededInNewTab
Currently doesn't do anything. Will basically define whether clicking on an embedded image or markdown file will open as a new tab.

## References along the way

- https://github.com/wujieli0207/vue-json-canvas
- https://github.com/JS-DevTools/rehype-inline-svg
- https://github.com/trbndev/jsoncanvas
- https://github.com/Digital-Tvilling/react-jsoncanvas
