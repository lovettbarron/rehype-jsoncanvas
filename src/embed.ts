import type { Element } from "hast"
import { s } from "hastscript"

import { fromMarkdown } from "mdast-util-from-markdown"
import { toHast } from "mdast-util-to-hast"

import type { GenericNode } from "@trbn/jsoncanvas"
// import { applyDefaults, Options } from "./options";
import { getCanvasFromEmbed } from "./plugin"

const imagesLoaded = [] as Array<any>

export function checkImagesLoaded(callback: Function) {
  const allLoaded = imagesLoaded.every((el) => el.complete)
  console.group("Images loading", imagesLoaded, allLoaded)
  if (imagesLoaded.length < 1) return callback()
  //   return callback();
  if (allLoaded) callback()
  else checkImagesLoaded(callback)
}

// This renders out the images
export async function drawEmbedded(
  svg: Element,
  grp: Element,
  node: GenericNode | any,
) {
  if (node.type === "file" && svg) {
    if (node.file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const image = s("image", {
        x: 5 + node.x + <number>svg.properties!.renWidth / 2,
        y: 5 + node.y + <number>svg.properties!.renHeight / 2,
        width: node.width - 10,
        height: node.height - 10,
        "xlink:href": node.file,
      })

      grp.children.push(image)
    }
  }
}

// This renders out the images
export async function drawMarkdownEmbed(
  svg: Element,
  grp: Element,
  node: GenericNode | any,
) {
  if (node.type === "file" && svg) {
    if (node.file.match(/\.(md|mdx)$/i)) {
      const mdFile = await getCanvasFromEmbed(node.file)

      const mdast = fromMarkdown(mdFile)
      const hast = toHast(mdast)

      // Ref: https://stackoverflow.com/questions/45518545/svg-foreignobject-not-showing-on-any-browser-why
      const embed = s("foreignObject", {
        x: 5 + node.x + <number>svg.properties!.renWidth / 2,
        y: 5 + node.y + <number>svg.properties!.renHeight / 2,
        width: node.width - 10,
        height: node.height - 10,
      })
      embed.children.push(hast as Element) // If this breaks, this is probably the spot it breaks

      grp.children.push(embed)
    }
  }
}
