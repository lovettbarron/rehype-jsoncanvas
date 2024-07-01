/**
 * Options for the jsoncanvas
 */
export interface Options {
  /**
   * Open links in a new tab
   *
   * Defaults to true
   */
  openEmbededInNewTab: boolean;

  /**
   * Render mode. Determines the canvas output mode
   *
   * Defaults to canvas
   */
  renderMode: "svg" | "image" | "canvas";

  /**
   * Canvas Buffer
   *
   * Defaults to 30
   */
  canvasBuffer: number;

  /**
   * Canvas node stroke width
   *
   * Defaults to 3
   */
  nodeStrokeWidth: number;

  /**
   * Canvas line stroke width
   *
   * Defaults to 5
   */
  lineStrokeWidth: number;
}

/**
 * Applies default values for any unspecified options
 */
export function applyDefaults(config: Partial<Options> = {}): Options {
  return {
    openEmbededInNewTab:
      config.openEmbededInNewTab === undefined
        ? true
        : config.openEmbededInNewTab,
    renderMode: config.renderMode === undefined ? "canvas" : config.renderMode,
    canvasBuffer: config.canvasBuffer === undefined ? 30 : config.canvasBuffer,
    nodeStrokeWidth:
      config.nodeStrokeWidth === undefined ? 3 : config.nodeStrokeWidth,
    lineStrokeWidth:
      config.lineStrokeWidth === undefined ? 5 : config.lineStrokeWidth,
  };
}
