import fs from "node:fs"
import path from "node:path"
import JSONCanvas from "@trbn/jsoncanvas"
import type { Element, Root } from "hast"
import { h } from "hastscript"
import type { Plugin } from "unified"
// import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { visit } from "unist-util-visit"
import { render, validate } from "./jsoncanvas"

import { type Options, applyDefaults } from "./options"
/*

Let's think this through.
I need to fetch the relevant embedded .canvas elements, and parse across two different ways of embedding, ![](file.canvas) and [[file.canvas]]

Then I need to generate a canvas node, and populate it with the relevent objects per the jsoncanvas spec

Then I need to pass this populated canvas back to rehype to be placed into the rendered html stream

Core Assumptions:
- Assume serverside, pga markdown
- Assume a canvas fallback incase of old browser
- Assume a need for arbitrary sized canvas
- Assume a fallback for improperly formatted canvas

Things decide:
- Navigable/zoomable?
- Themeable? > Probably want a css module that can be overridden in config

*/

export const rehypeJsonCanvas: Plugin<[], Root> = () => {
  return async (tree) => {
    const nodesToReplace = [] as Array<Element>

    // Iterate over the markdown file as tree
    visit(tree, "element", (node, index) => {
      console.log(node, index)

      // only match image embeds
      if (node.tagName !== "img" || index === undefined) {
        return
      }
      console.log("Adding", node)
      nodesToReplace.push(node)
      // index = index += 1;
    })

    for (const node of nodesToReplace) {
      const canvasPath = node.properties.src as string
      const canvasMarkdown = await getCanvasFromEmbed(canvasPath)

      const jsonCanvasFromString = JSONCanvas.fromString(canvasMarkdown)

      let canvas = null

      if (validate(jsonCanvasFromString)) {
        canvas = render(jsonCanvasFromString, {})
      } else {
        canvas = h("div", "<div>Not a properly formatted JsonCanvas</div>")
      }

      if (!canvas) return
      node.properties = {
        ...node.properties,
      }
      node.tagName = "div"
      node.children = []
      node.children.push(canvas)
    }
  }
}

export async function getCanvasFromEmbed(
  markdownPath: string,
  config?: Partial<Options>,
): Promise<string> {
  const options = applyDefaults(config)
  let canvasMarkdown = "Loading"
  const webcheck = markdownPath.trim().toLowerCase()

  if (webcheck.startsWith("https://") || typeof window !== "undefined") {
    await fetch(markdownPath)
      .then((res) => res.text())
      .then((text) => {
        canvasMarkdown = text
      })
  } else {
    // To accomodate ssr
    const ssrPath = options.assetPath
      ? path.join(process.cwd(), options.assetPath, markdownPath)
      : path.join(process.cwd(), markdownPath)
    console.log("File Path", ssrPath)
    try {
      canvasMarkdown = fs.readFileSync(ssrPath, {
        encoding: "utf8",
        flag: "r",
      })
    } catch (err) {
      console.log("No Canvas File Found. Try using the assetPath option!", err)
    }
  }
  if (canvasMarkdown === null) return ""

  return canvasMarkdown
}
