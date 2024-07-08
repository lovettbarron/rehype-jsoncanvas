import type { Element } from "hast"
import { s } from "hastscript"

import type { Edge, GenericNode, JSONCanvas } from "@trbn/jsoncanvas"

import { type Options, applyDefaults } from "./options"

import { drawEmbedded, drawMarkdownEmbed } from "./embed"

function calculateMinimumCanvasSize(jsc: JSONCanvas) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const node of jsc.getNodes()) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.width)
    maxY = Math.max(maxY, node.y + node.height)
  }

  const canvasWidth = maxX - minX
  const canvasHeight = maxY - minY

  return { canvasWidth, canvasHeight, offsetX: -minX, offsetY: -minY }
}

export function validate(jsonCanvasData: JSONCanvas) {
  // Use the typescript lib to vlaidate?
  console.log("Validate!", jsonCanvasData)
  return true
}

export function render(
  jsc: JSONCanvas,
  config?: Partial<Options>,
): Element | null {
  const options = applyDefaults(config)

  const { canvasWidth, canvasHeight, offsetX, offsetY } =
    calculateMinimumCanvasSize(jsc)

  // Init Canvas objects
  const svg = initRender(canvasWidth + offsetX, canvasHeight + offsetY)

  if (svg === null) return null

  // Draw nodes
  for (const node of jsc.getNodes()) {
    drawNode(svg, node, options)
  }

  // Draw Edges
  for (const edge of jsc.getEdges()) {
    const fromNode = jsc.getNodes().find((node) => node.id === edge.fromNode)
    const toNode = jsc.getNodes().find((node) => node.id === edge.toNode)
    if (toNode !== undefined && fromNode !== undefined)
      drawEdge(svg, toNode, fromNode, edge, options)
  }

  return svg
}

function initRender(
  width: number,
  height: number,
  config?: Partial<Options>,
): Element {
  const options = applyDefaults(config)
  const BASE_SVG_PROPS = {
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "stroke-width": options.lineStrokeWidth,
    "fill-rule": "evenodd",
    fill: "currentColor",
    stroke: "currentColor",
  }

  const props = {
    ...BASE_SVG_PROPS,
    width: "100%",
    height: "100%",
    renWidth: width as number,
    renHeight: height as number,
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: "none",
  }

  const svg = s("svg", props)
  svg.properties
  return svg
}

async function drawNode(
  svg: Element,
  node: GenericNode | any,
  config?: Partial<Options>,
) {
  const options = applyDefaults(config)

  let fillStyle = "rgba(255, 255, 255, .5)"
  let strokeStyle = "rgba(0,0,0,1)"

  if (node.color === "1") {
    fillStyle = "rgba(255, 0, 0, .5)"
    strokeStyle = "rgba(255,0,0,1)"
  } else if (node.color === "2") {
    fillStyle = "rgba(255, 100, 0, .5)"
    strokeStyle = "rgba(255,100,0,1)"
  } else if (node.color === "3") {
    fillStyle = "rgba(255, 255, 0, .5)"
    strokeStyle = "rgba(255,255,0,1)"
  } else if (node.color === "4") {
    fillStyle = "rgba(0, 255, 100, .5)"
    strokeStyle = "rgba(0,100,0,1)"
  } else if (node.color === "5") {
    fillStyle = "rgba(0, 255, 255, .5)"
    strokeStyle = "rgba(0,255,255,1)"
  } else if (node.color === "6") {
    fillStyle = "rgba(100, 10, 100, .5)"
    strokeStyle = "rgba(100,10,100,1)"
  }

  const group = s("g")

  const rect = s("rect", {
    x: node.x + <number>svg.properties.renWidth / 2,
    y: node.y + <number>svg.properties.renHeight / 2,
    width: node.width,
    height: node.height,
    rx: 5,
    ry: 5,
    stroke: strokeStyle,
    fill: fillStyle,
    "stroke-width": options.lineStrokeWidth,
  })

  group.children.push(rect)

  drawEmbedded(svg, group, node, config)
  drawMarkdownEmbed(svg, group, node, config)

  // Group Label
  if (node.label) {
    const t = s(
      "text",
      {
        x: node.x + 5 + <number>svg.properties.renWidth / 2,
        y: node.y - 10 + <number>svg.properties.renHeight / 2,
        "font-family": "monospace",
        "font-size": 20,
        "stroke-width": 1,
      },
      node.label,
    )
    group.children.push(t)
  }

  // Node within a rect
  if (node.type === "text" && node.text) {
    const t = s(
      "text",
      {
        x: node.x + 5 + <number>svg.properties.renWidth / 2,
        y:
          node.y +
          5 +
          <number>node.height / 2 +
          <number>svg.properties.renHeight / 2,
        "font-family": "monospace",
        "font-size": 20,
        "stroke-width": 1,
      },
      node.text,
    )
    group.children.push(t)
  }

  svg.children.push(group)
}

function drawEdge(
  svg: Element,
  toNode: GenericNode,
  fromNode: GenericNode,
  edge: Edge | any,
  config?: Partial<Options>,
) {
  const options = applyDefaults(config)
  if (svg === null || svg === undefined) return

  const cWidth = <number>svg.properties.renWidth || (1 as number)
  const cHeight = <number>svg.properties.renHeight || (1 as number)

  if (fromNode && toNode) {
    let startX =
      fromNode.x +
      (edge.fromSide === "top" || edge.fromSide === "bottom"
        ? fromNode.width / 2
        : fromNode.width) +
      cWidth / 2
    let startY = fromNode.y + fromNode.height / 2 + cHeight / 2
    let endX =
      toNode.x +
      (edge.toSide === "top" || edge.toSide === "bottom"
        ? toNode.width / 2
        : toNode.width) +
      cWidth / 2
    let endY = toNode.y + toNode.height / 2 + cHeight / 2

    if (edge.fromSide === "left") {
      startX = fromNode.x + cWidth / 2
    } else if (edge.fromSide === "top") {
      startY = fromNode.y + cHeight / 2
    } else if (edge.fromSide === "bottom") {
      startY = fromNode.y + fromNode.height + cHeight / 2
    }

    if (edge.toSide === "right") {
      endX = toNode.x + toNode.width + cWidth / 2
    } else if (edge.toSide === "top") {
      endY = toNode.y + cHeight / 2
    } else if (edge.toSide === "bottom") {
      endY = toNode.y + toNode.height + cHeight / 2
    } else if (edge.toSide === "left") {
      endX = toNode.x + cWidth / 2
    }

    // Change the control point logic based on fromSide/toSide
    const cp1 = {
      x: startX,
      y: endY,
    }

    const cp2 = {
      x: endX,
      y: startY,
    }

    const line = s("path", {
      d: `M ${startX} ${startY} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${endX} ${endY}`,
      stroke: "black",
      "stroke-width": options.lineStrokeWidth,
      fill: "none",
    })
    svg.children.push(line)
  }
}
