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

export const rehypeJsonCanvas: Plugin<[], Root> = (
  config?: Partial<Options>,
) => {
  return async (tree) => {
    const nodesToReplace = [] as Array<Element>

    // Iterate over the markdown file as tree
    visit(tree, "element", (node, index) => {
      // only match image embeds
      if (node.tagName !== "img" || index === undefined) {
        return
      }

      // This makes sure that the file in the image tag is a canvas
      const canvasCheck = node.properties.src as string
      if (!canvasCheck.includes(".canvas")) return

      nodesToReplace.push(node)
      // index = index += 1;
    })

    for (const node of nodesToReplace) {
      const canvasPath = node.properties.src as string
      const canvasMarkdown = await getCanvasFromEmbed(canvasPath, config)

      if (canvasMarkdown.length < 1) return
      const jsonCanvasFromString = JSONCanvas.fromString(canvasMarkdown)

      let canvas = null

      if (validate(jsonCanvasFromString)) {
        canvas = render(jsonCanvasFromString, config)
      } else {
        canvas = h("div", "Not a properly formatted JsonCanvas")
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
  let canvasMarkdown = ""
  const webcheck = markdownPath.trim().toLowerCase()

  // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
  const extension = webcheck.slice(
    (Math.max(0, webcheck.lastIndexOf(".")) || Number.POSITIVE_INFINITY) + 1,
  )

  if (webcheck.startsWith("https://") || typeof window !== "undefined") {
    await fetch(markdownPath)
      .then((res) => res.text())
      .then((text) => {
        canvasMarkdown = text
      })
  } else {
    const opPath =
      extension === "md" ? options.mdPath : options.assetPath || null

    console.log("opPath", opPath)
    // To accomodate ssr
    const ssrPath = opPath
      ? path.join(process.cwd(), opPath, markdownPath)
      : path.join(process.cwd(), markdownPath)
    console.log(ssrPath)
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
