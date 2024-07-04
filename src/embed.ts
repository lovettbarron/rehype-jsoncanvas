import { s } from "hastscript";
import { Element } from "hast";

import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";

import { GenericNode } from "@trbn/jsoncanvas";
// import { applyDefaults, Options } from "./options";

const imagesLoaded = [] as Array<any>;

export function checkImagesLoaded(callback: Function) {
  let allLoaded = imagesLoaded.every((el) => el.complete);
  console.group("Images loading", imagesLoaded, allLoaded);
  if (imagesLoaded.length < 1) return callback();
  //   return callback();
  if (allLoaded) callback();
  else checkImagesLoaded(callback);
}

// This renders out the images
export async function drawEmbedded(svg: Element, node: GenericNode | any) {
  if (node.type === "file" && svg) {
    if (node.file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const image = s("image", {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        "xlink:href": node.file,
      });

      svg.children.push(image);
    }
  }
}

// This renders out the images
export async function drawMarkdownEmbed(svg: Element, node: GenericNode | any) {
  if (node.type === "file" && svg) {
    if (node.file.match(/\.(md|mdx)$/i)) {
      const resp = await fetch(node.file);
      const mdFile = await resp.text();

      const mdast = fromMarkdown(mdFile);
      const hast = toHast(mdast);

      // Ref: https://stackoverflow.com/questions/45518545/svg-foreignobject-not-showing-on-any-browser-why
      const embed = s("foreignObject", {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      });
      embed.children.push(hast as Element); // If this breaks, this is probably the spot it breaks

      svg.children.push(embed);
    }
  }
}
