import type { RichText } from '../shared/content/types.js';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderRichText(content: RichText): string {
  return content.map((node) => {
    let rendered = escapeHtml(node.text);
    for (const mark of node.marks ?? []) {
      rendered = mark === 'strong' ? `<strong>${rendered}</strong>` : `<em>${rendered}</em>`;
    }
    if (node.type === 'link') {
      const external = /^https?:/i.test(node.href);
      const rel = external ? ' rel="noopener noreferrer"' : '';
      rendered = `<a href="${escapeHtml(node.href)}"${rel}>${rendered}</a>`;
    }
    return rendered;
  }).join('');
}
