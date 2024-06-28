export function validate(canvas: string) {
  // Use the typescript lib to vlaidate?
  return canvas || true;
}
export function render(canvas: string, options: object) {
  return `<div>Rendered Canvas${canvas}${options}</div>`;
}
