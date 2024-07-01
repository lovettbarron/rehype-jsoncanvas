import type { Plugin } from "unified";
import type { Element, ElementContent, Root } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { visit } from "unist-util-visit";
import fs from "fs";
import { validate, render } from "./jsoncanvas";
import JSONCanvas from "@trbn/jsoncanvas";

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
    const nodesToReplace = [] as Array<Element>;

    // Iterate over the markdown file as tree
    visit(tree, "element", (node, index) => {
      console.log(node, index);

      // only match image embeds
      if (node.tagName !== "img" || index === undefined) {
        return;
      }
      console.log("Adding", node);
      nodesToReplace.push(node);
      // index = index += 1;
    });

    for (const node of nodesToReplace) {
      const canvasPath = node.properties.src as string;
      console.log("Detected", canvasPath);
      let canvasMarkdown = await getCanvasFromEmbed(canvasPath);

      console.log("Got markdown", canvasMarkdown);
      const jsonCanvasFromString = JSONCanvas.fromString(canvasMarkdown);

      let canvas;

      if (validate(jsonCanvasFromString)) {
        canvas = render(jsonCanvasFromString, {});
      } else {
        canvas = "<div>Not a properly formatted JsonCanvas</div>";
      }

      console.log(canvas);

      const canvasHast = fromHtmlIsomorphic(
        `<img alt='' src='${canvas}' style='width:100%' />`,
        {
          fragment: true,
        }
      );
      node.properties = {
        ...node.properties,
      };
      node.tagName = "div";
      node.children = canvasHast.children as ElementContent[];
    }
  };
};

async function getCanvasFromEmbed(path: string): Promise<string> {
  let canvasMarkdown = "Loading";
  const webcheck = path.trim().toLowerCase();

  if (webcheck.startsWith("https://") || typeof window !== "undefined") {
    await fetch(path)
      .then((res) => res.text())
      .then((text) => (canvasMarkdown = text));
  } else {
    // To accomodate ssr
    canvasMarkdown = fs.readFileSync(path, {
      encoding: "utf8",
      flag: "r",
    });
  }
  if (canvasMarkdown === null) return "";

  return canvasMarkdown;
}
