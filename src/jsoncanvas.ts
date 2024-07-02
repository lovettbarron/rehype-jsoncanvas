import { JSONCanvas, Edge, GenericNode } from "@trbn/jsoncanvas";

import { createCanvas, Canvas, CanvasRenderingContext2D } from "canvas";
import { applyDefaults, Options } from "./options";

export function validate(jsonCanvasData: JSONCanvas) {
  // Use the typescript lib to vlaidate?
  console.log("Validate!", jsonCanvasData);
  return true;
}

import { drawEmbedded, drawMarkdownEmbed, checkImagesLoaded } from "./embed";

export function render(
  jsc: JSONCanvas,
  config?: Partial<Options>
): String | any | null {
  const options = applyDefaults(config);
  console.log("render", jsc);

  const { canvasWidth, canvasHeight, offsetX, offsetY } =
    calculateMinimumCanvasSize(jsc);

  console.log(canvasWidth, canvasHeight, offsetX, offsetY);

  // Init Canvas objects
  const { canvas, ctx } = initRender(
    "jsc",
    canvasWidth + offsetX,
    canvasHeight + offsetY
  );

  if (canvas === null || ctx === null) return null;

  // Draw nodes
  jsc.getNodes().forEach((node) => {
    drawNode(canvas, ctx, node, options);
  });

  // Draw Edges
  jsc.getEdges().forEach((edge) => {
    const fromNode = jsc.getNodes().find((node) => node.id === edge.fromNode);
    const toNode = jsc.getNodes().find((node) => node.id === edge.toNode);
    if (toNode !== undefined && fromNode !== undefined)
      drawEdge(canvas, ctx, toNode, fromNode, edge, options);
  });

  return checkImagesLoaded(() => renderToBuffer(canvas));
}

function renderToBuffer(canvas: Canvas, config?: Partial<Options>) {
  const options = applyDefaults(config);

  if (options.renderMode == "svg" || options.renderMode == "canvas") {
    if (typeof window !== "undefined") {
      return canvas.toDataURL(); // This isn't the right approach
    } else {
      return canvas && canvas.toBuffer(); // svg declaration is on canvas
    }
  } else return canvas.toDataURL();
}

function initRender(
  id: string,
  width: number,
  height: number,
  config?: Partial<Options>
) {
  const options = applyDefaults(config);

  const canvas = createCanvas(
    width,
    height,
    options.renderMode === "svg" ? "svg" : undefined
  ); // This basically sets up the render mode as SVG if its defined as such, which impacts how it is exprted as a buffer

  if (!canvas) {
    console.error(`Canvas element with id '${id}' not found.`);
    return { canvas: null, ctx: null };
  }
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Unable to get canvas context.");
    return { canvas, ctx: null };
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `32px`;

  return {
    canvas,
    ctx,
  };
}

async function drawNode(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  node: GenericNode | any,
  config?: Partial<Options>
) {
  const options = applyDefaults(config);

  console.log("Drawing Node", node);

  ctx.fillStyle = "rgba(255, 255, 255, .5)";
  ctx.strokeStyle = "rgba(0,0,0,1)";

  ctx.beginPath();
  if (node.color === "1") {
    ctx.fillStyle = "rgba(255, 0, 0, .5)";
    ctx.strokeStyle = "rgba(255,0,0,1)";
  } else if (node.color === "2") {
    ctx.fillStyle = "rgba(255, 100, 0, .5)";
    ctx.strokeStyle = "rgba(255,100,0,1)";
  } else if (node.color === "3") {
    ctx.fillStyle = "rgba(255, 255, 0, .5)";
    ctx.strokeStyle = "rgba(255,255,0,1)";
  } else if (node.color === "4") {
    ctx.fillStyle = "rgba(0, 255, 100, .5)";
    ctx.strokeStyle = "rgba(0,100,0,1)";
  } else if (node.color === "5") {
    ctx.fillStyle = "rgba(0, 255, 255, .5)";
    ctx.strokeStyle = "rgba(0,255,255,1)";
  } else if (node.color === "6") {
    ctx.fillStyle = "rgba(100, 10, 100, .5)";
    ctx.strokeStyle = "rgba(100,10,100,1)";
  }
  ctx.roundRect(
    node.x + canvas.width / 2,
    node.y + canvas.height / 2,
    node.width,
    node.height,
    [5]
  );

  drawEmbedded(canvas, ctx, node);
  drawMarkdownEmbed(canvas, ctx, node);

  ctx.lineWidth = options.nodeStrokeWidth;
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  if (node.label) {
    ctx.fillText(
      node.label,
      node.x + 5 + canvas.width / 2,
      node.y + 20 + canvas.height / 2
    );
  }

  if (node.type === "text" && node.text) {
    ctx.fillText(
      node.text,
      node.x + 5 + canvas.width / 2,
      node.y + 40 + canvas.height / 2
    );
  }
}

function drawEdge(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  toNode: GenericNode,
  fromNode: GenericNode,
  edge: Edge | any,
  config?: Partial<Options>
) {
  const options = applyDefaults(config);

  ctx.lineWidth = options.lineStrokeWidth;
  ctx.strokeStyle = "rgba(0,0,0,1)";

  if (fromNode && toNode) {
    let startX =
      fromNode.x +
      (edge.fromSide == "top" || edge.fromSide == "bottom"
        ? fromNode.width / 2
        : fromNode.width) +
      canvas.width / 2;
    let startY = fromNode.y + fromNode.height / 2 + canvas.height / 2;
    let endX =
      toNode.x +
      (edge.toSide == "top" || edge.toSide == "bottom"
        ? toNode.width / 2
        : toNode.width) +
      canvas.width / 2;
    let endY = toNode.y + toNode.height / 2 + canvas.height / 2;

    if (edge.fromSide === "left") {
      startX = fromNode.x + canvas.width / 2;
    } else if (edge.fromSide === "top") {
      startY = fromNode.y + canvas.height / 2;
    } else if (edge.fromSide === "bottom") {
      startY = fromNode.y + fromNode.height + canvas.height / 2;
    }

    if (edge.toSide === "right") {
      endX = toNode.x + toNode.width + canvas.width / 2;
    } else if (edge.toSide === "top") {
      endY = toNode.y + canvas.height / 2;
    } else if (edge.toSide === "bottom") {
      endY = toNode.y + toNode.height + canvas.height / 2;
    } else if (edge.toSide === "left") {
      endX = toNode.x + canvas.width / 2;
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    // ctx.lineTo(endX, endY);
    const cp1 = {
      x: startX,
      y: endY,
    };

    const cp2 = {
      x: endX,
      y: startY,
    };

    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, endX, endY);
    ctx.stroke();
    ctx.closePath();

    const t = 1.0; // At the end of the curve
    const dx =
      3 * (1 - t) * (1 - t) * (cp1.x - startX) +
      6 * (1 - t) * t * (cp2.x - cp1.x) +
      3 * t * t * (endX - cp2.x);
    const dy =
      3 * (1 - t) * (1 - t) * (cp1.y - startY) +
      6 * (1 - t) * t * (cp2.y - cp1.y) +
      3 * t * t * (endY - cp2.y);
    const angle = Math.atan2(dy, dx);

    // Draw arrowhead
    const headlen = 20; // length of head in pixels
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(angle - Math.PI / 6),
      endY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - headlen * Math.cos(angle + Math.PI / 6),
      endY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(angle - Math.PI / 6),
      endY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.stroke();
    ctx.fill();
  }
}

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
