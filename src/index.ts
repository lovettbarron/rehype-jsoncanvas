import { rehypeJsonCanvas } from "./plugin"

export type { Options } from "./options"

export { rehypeJsonCanvas }
export default rehypeJsonCanvas

// CommonJS default export hack
/* eslint-env commonjs */
// if (typeof module === "object" && typeof module.exports === "object") {
//   module.exports = Object.assign(module.exports.default, module.exports);
// }
