import type { Plugin } from "unified";
import type { ElementContent, Root } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { visit } from "unist-util-visit";
// import fs from "fs";
import { validate, render } from "./jsoncanvas";

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
  return (tree) => {
    visit(tree, "element", (node, index, pre) => {
      console.log(node, index, pre);

      // only match image embeds
      if (node.tagName !== "img" || index === undefined) {
        return;
      }

      // const nodeData = node.data ajec t;
      const canvasPath = "jsoncanvas";
      const webcheck = canvasPath.trim().toLowerCase();

      const canvasMarkdown = "JSONCANVASTEST";
      if (webcheck.startsWith("https://")) {
        // Fetch
      } else {
        // readfile
      }

      let canvas;

      if (validate(canvasMarkdown)) {
        canvas = render(canvasMarkdown, {});
      } else {
        canvas = "<div>Not a properly formatted JsonCanvas</div>";
      }

      const canvasHast = fromHtmlIsomorphic(canvas, {
        fragment: true,
      });
      node.properties = {
        ...node.properties,
      };
      node.tagName = "div";
      node.children = canvasHast.children as ElementContent[];
      index += 1;
    });
  };
};
