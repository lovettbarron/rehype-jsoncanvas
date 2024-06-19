import { jsonCanvas } from "./jsoncanvas";

export { Options } from "./options";
export { jsonCanvas };

// Export `inlineSVG` as the default export
export default jsonCanvas;

// CommonJS default export hack
/* eslint-env commonjs */
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = Object.assign(module.exports.default, module.exports);
}
