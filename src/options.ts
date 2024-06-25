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
  };
}
