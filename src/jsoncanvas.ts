import * as path from "path";
import { Processor, Transformer } from "unified";
import { Node, Parent } from "unist";
import { VFile } from "vfile";
import { h, s } from "hastscript";
import { Element } from "hast";

import { JSONCanvas, Edge, GenericNode } from "@trbn/jsoncanvas";

import { applyDefaults, Options } from "./options";

import { drawEmbedded, drawMarkdownEmbed, checkImagesLoaded } from "./embed";

function calculateMinimumCanvasSize(canvas: JSONCanvas) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  canvas.getNodes().forEach((node) => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  const canvasWidth = maxX - minX;
  const canvasHeight = maxY - minY;

  return { canvasWidth, canvasHeight, offsetX: -minX, offsetY: -minY };
}

export function validate(jsonCanvasData: JSONCanvas) {
  // Use the typescript lib to vlaidate?
  console.log("Validate!", jsonCanvasData);
  return true;
}

export function render(
  jsc: JSONCanvas,
  config?: Partial<Options>
): String | any | null {
  const options = applyDefaults(config);

  const { canvasWidth, canvasHeight, offsetX, offsetY } =
    calculateMinimumCanvasSize(jsc);

  // Init Canvas objects
  const svg = initRender(canvasWidth + offsetX, canvasHeight + offsetY);

  if (svg === null) return null;

  // Draw nodes
  jsc.getNodes().forEach((node) => {
    drawNode(svg, node, options);
  });

  // Draw Edges
  jsc.getEdges().forEach((edge) => {
    const fromNode = jsc.getNodes().find((node) => node.id === edge.fromNode);
    const toNode = jsc.getNodes().find((node) => node.id === edge.toNode);
    if (toNode !== undefined && fromNode !== undefined)
      drawEdge(svg, toNode, fromNode, edge, options);
  });

  return checkImagesLoaded(() => renderToBuffer(svg));
}

function renderToBuffer(svg: Element, config?: Partial<Options>) {
  const options = applyDefaults(config);
  console.log("Rendering", svg, options);
  return null;
}

function initRender(
  width: number,
  height: number,
  config?: Partial<Options>
): Element {
  const options = applyDefaults(config);

  const BASE_SVG_PROPS = {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": "0",
    "fill-rule": "evenodd",
    fill: "currentColor",
    stroke: "currentColor",
  };

  const props = {
    ...BASE_SVG_PROPS,
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
  };

  const svg = s("svg", props);

  return svg;
}

async function drawNode(
  svg: Element,
  node: GenericNode | any,
  config?: Partial<Options>
) {
  const options = applyDefaults(config);

  let fillStyle = "rgba(255, 255, 255, .5)";
  let strokeStyle = "rgba(0,0,0,1)";

  if (node.color === "1") {
    fillStyle = "rgba(255, 0, 0, .5)";
    strokeStyle = "rgba(255,0,0,1)";
  } else if (node.color === "2") {
    fillStyle = "rgba(255, 100, 0, .5)";
    strokeStyle = "rgba(255,100,0,1)";
  } else if (node.color === "3") {
    fillStyle = "rgba(255, 255, 0, .5)";
    strokeStyle = "rgba(255,255,0,1)";
  } else if (node.color === "4") {
    fillStyle = "rgba(0, 255, 100, .5)";
    strokeStyle = "rgba(0,100,0,1)";
  } else if (node.color === "5") {
    fillStyle = "rgba(0, 255, 255, .5)";
    strokeStyle = "rgba(0,255,255,1)";
  } else if (node.color === "6") {
    fillStyle = "rgba(100, 10, 100, .5)";
    strokeStyle = "rgba(100,10,100,1)";
  }

  const group = s("g");

  const rect = s("rect", {
    x: node.x + svg.properties.width / 2,
    y: node.y + svg.properties.height / 2,
    width: node.width,
    height: node.height,
    rx: 5,
    ry: 5,
    stroke: strokeStyle,
    fill: fillStyle,
    "stroke-width": options.lineStrokeWidth,
  });

  group.children.push(rect);

  drawEmbedded(svg, node);
  drawMarkdownEmbed(svg, node);

  // ctx.fillStyle = "rgba(0, 0, 0, 1)";
  if (node.label) {
    // ctx.fillText(
    //   node.label,
    //   node.x + 5 + canvas.width / 2,
    //   node.y + 20 + canvas.height / 2
    // );
  }

  if (node.type === "text" && node.text) {
    // ctx.fillText(
    //   node.text,
    //   node.x + 5 + canvas.width / 2,
    //   node.y + 40 + canvas.height / 2
    // );
  }

  svg.children.push(group);
}

function drawEdge(
  svg: Element,
  toNode: GenericNode,
  fromNode: GenericNode,
  edge: Edge | any,
  config?: Partial<Options>
) {
  const options = applyDefaults(config);
  if (svg === null || svg == undefined) return null;
  else if (fromNode && toNode) {
    let startX =
      fromNode.x +
      (edge.fromSide == "top" || edge.fromSide == "bottom"
        ? fromNode.width / 2
        : fromNode.width) +
      svg.properties!.width / 2;
    let startY = fromNode.y + fromNode.height / 2 + svg.properties.height / 2;
    let endX =
      toNode.x +
      (edge.toSide == "top" || edge.toSide == "bottom"
        ? toNode.width / 2
        : toNode.width) +
      svg.properties.width / 2;
    let endY = toNode.y + toNode.height / 2 + svg.properties.height / 2;

    if (edge.fromSide === "left") {
      startX = fromNode.x + svg.properties.width / 2;
    } else if (edge.fromSide === "top") {
      startY = fromNode.y + svg.properties.height / 2;
    } else if (edge.fromSide === "bottom") {
      startY = fromNode.y + fromNode.height + svg.properties.height / 2;
    }

    if (edge.toSide === "right") {
      endX = toNode.x + toNode.width + svg.properties.width / 2;
    } else if (edge.toSide === "top") {
      endY = toNode.y + svg.properties.height / 2;
    } else if (edge.toSide === "bottom") {
      endY = toNode.y + toNode.height + svg.properties.height / 2;
    } else if (edge.toSide === "left") {
      endX = toNode.x + svg.properties.width / 2;
    }

    // Change the control point logic based on fromSide/toSide
    const cp1 = {
      x: startX,
      y: endY,
    };

    const cp2 = {
      x: endX,
      y: startY,
    };

    const line = s("path", {
      d: `M ${startX} ${startY} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endX} ${endY}`,
      stroke: "black",
      "stroke-width": options.lineStrokeWidth,
      fill: "none",
    });
    svg.children.push(line);
  }
}
