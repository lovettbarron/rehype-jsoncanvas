import { JSONCanvas, Edge, GenericNode } from "@trbn/jsoncanvas";
import { createCanvas, Canvas, CanvasRenderingContext2D } from "canvas";

export function validate(jsonCanvasData: JSONCanvas) {
  // Use the typescript lib to vlaidate?
  console.log(jsonCanvasData.toString());
  return true;
}
export function render(jsc: JSONCanvas, options: object): String | null {
  console.log("render", jsc, options);

  // Init Canvas objects
  const { canvas, ctx } = initRender("jsc", 1280, 960);

  if (canvas === null || ctx === null) return null;

  // Draw nodes
  jsc.getNodes().forEach((node) => {
    drawNode(canvas, ctx, node);
  });

  // Draw Edges
  jsc.getEdges().forEach((edge) => {
    const fromNode = jsc.getNodes().find((node) => node.id === edge.fromNode);
    const toNode = jsc.getNodes().find((node) => node.id === edge.toNode);
    if (toNode !== undefined && fromNode !== undefined)
      drawEdge(canvas, ctx, toNode, fromNode, edge);
  });

  return canvas.toDataURL();
}

function initRender(id: string, width: number, height: number) {
  const canvas = createCanvas(width, height);
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

  return {
    canvas,
    ctx,
  };
}

function drawNode(
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  node: GenericNode | any
) {
  console.log("Drawing Node", node);

  ctx.fillStyle = "rgba(255, 255, 255, .5)";

  ctx.beginPath();
  if (node.color === "1") {
    ctx.fillStyle = "rgba(255, 0, 0, .5)";
  } else if (node.color === "2") {
    ctx.fillStyle = "rgba(255, 100, 0, .5)";
  } else if (node.color === "3") {
    ctx.fillStyle = "rgba(255, 255, 0, .5)";
  } else if (node.color === "4") {
    ctx.fillStyle = "rgba(0, 255, 100, .5)";
  } else if (node.color === "5") {
    ctx.fillStyle = "rgba(0, 255, 255, .5)";
  } else if (node.color === "6") {
    ctx.fillStyle = "rgba(100, 10, 100, .5)";
  }
  ctx.roundRect(
    node.x + canvas.width / 2,
    node.y + canvas.height / 2,
    node.width,
    node.height,
    [5]
  );
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "rgba(0, 0, 0, .5)";
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
  edge: Edge | any
) {
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
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();

    // Draw arrowhead
    const headlen = 10; // length of head in pixels
    const angle = Math.atan2(endY - startY, endX - startX);
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
