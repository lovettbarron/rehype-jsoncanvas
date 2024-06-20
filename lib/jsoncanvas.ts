import type { Plugin } from "unified";
import type { ElementContent, Root } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { visit } from "unist-util-visit";

export const rehypeJsonCanvas: Plugin<[], Root> = () => {};
