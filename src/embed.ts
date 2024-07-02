import { unified } from "unified";
import parse from "remark-parse";
import remark2rehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import html2canvas from "html2canvas";

import { GenericNode } from "@trbn/jsoncanvas";

import { loadImage, Canvas, CanvasRenderingContext2D } from "canvas";
// import { applyDefaults, Options } from "./options";

const imagesLoaded = [] as Array<any>;

export function checkImagesLoaded(callback: Function) {
  let allLoaded = imagesLoaded.every((el) => el.complete);
  console.group("Images loading", imagesLoaded, allLoaded);
  if (imagesLoaded.length < 1) return callback();
  return callback();
  //   if (allLoaded)

  //     callback();
  //   else checkImagesLoaded(callback);
}

// This renders out the images
export async function drawEmbedded(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  node: GenericNode | any
) {
  if (node.type === "file" && canvas) {
    if (node.file.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const img = await loadImage(node.file);
      console.log("is the image loaded?", img.complete);
      console.log("img", img);

      const aspect = img.width / img.height;
      img.onload = () => {
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          node.width - node.width / aspect,
          node.height - node.height / aspect,
          node.width / aspect,
          node.height / aspect
        );
      };
      imagesLoaded.push(img);
    }
  }
}

// This renders out the images
export async function drawMarkdownEmbed(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  node: GenericNode | any
) {
  if (node.type === "file" && canvas) {
    if (node.file.match(/\.(md|mdx)$/i)) {
      const resp = await fetch(node.file);
      const mdFile = await resp.text();
      const renderedMarkdown = await unified()
        .use(parse)
        .use(remark2rehype) // Convert Markdown to HTML
        .use(rehypeStringify)
        .process(mdFile);

      const htmlString = String(renderedMarkdown);
      const div = document.createElement("div");
      div.innerHTML = htmlString;

      div.style.width = `${node.width}px`;
      div.style.height = `${node.height}px`;
      div.style.color = "black";
      div.style.backgroundColor = "red";
      div.style.position = "absolute";
      //   div.style.left = "-9999px";
      document.body.appendChild(div);

      // Use html2canvas to render the div to an image
      const canvasElement = await html2canvas(div);
      const img = new Image(node.width, node.height) as any;
      img.onload = async () => {
        await ctx.drawImage(
          img,
          node.x + canvas.width / 2,
          node.y + canvas.height / 2,
          node.width,
          node.height
        );

        console.log("Markdown", img);

        // Cleanup
        document.body.removeChild(div);
      };
      img.src = canvasElement.toDataURL();
      imagesLoaded.push(img);
    }
  }
}
