import type { ContentBlock, Figure } from '../shared/content/types.js';
import { escapeHtml, renderRichText } from './escape.js';
import { renderLinkedImage } from './partials.js';
import type { RenderContext } from './types.js';

export function renderBlocks(blocks: ContentBlock[], context: RenderContext): string {
  return blocks.map((block) => renderBlock(block, context)).join('\n\n      ');
}

export function renderOnThisPage(blocks: ContentBlock[]): string {
  const headings = blocks.filter((block) => block.type === 'heading');
  if (!headings.length) return '';
  return `<nav aria-label="On this page">
        ${headings.map((heading, index) => `<a href="#${escapeHtml(heading.id)}"${index === 0 ? ' class="is-active"' : ''}>${escapeHtml(heading.text)}</a>`).join('\n        ')}
      </nav>`;
}

function renderBlock(block: ContentBlock, context: RenderContext): string {
  switch (block.type) {
    case 'headline':
      return `<h1 id="${escapeHtml(block.id)}">${renderRichText(block.content)}</h1>`;
    case 'paragraph':
      return `<p id="${escapeHtml(block.id)}"${block.treatment === 'lede' ? ' class="lede"' : ''}>${renderRichText(block.content)}</p>`;
    case 'heading':
      return `<h2 id="${escapeHtml(block.id)}">${escapeHtml(block.text)}</h2>`;
    case 'figure':
      return renderFigure(block.figure, context, `plate plate--${block.layout}`);
    case 'figure-pair':
      return `<div class="plate-pair">
        ${block.figures.map((figure) => renderFigure(figure, context, 'plate')).join('\n        ')}
      </div>`;
    case 'comparison':
      return `<figure class="baPair plate">
        <div class="baPair-imgs">
          <div><span class="lbl">${escapeHtml(block.before.label)}</span>${renderLinkedImage(block.before.image, context)}</div>
          <div><span class="lbl">${escapeHtml(block.after.label)}</span>${renderLinkedImage(block.after.image, context)}</div>
        </div>${block.caption ? `
        <figcaption>${renderRichText(block.caption)}</figcaption>` : ''}
      </figure>`;
    case 'figure-strip':
      return `<div class="panelStrip" style="--strip-cols:${block.figures.length}">
        ${block.figures.map((figure) => renderFigure(figure, context, 'plate')).join('\n        ')}
      </div>`;
    case 'image-break':
      return `<div class="pull">${renderLinkedImage(block.image, context)}</div>`;
  }
}

function renderFigure(figure: Figure, context: RenderContext, className: string): string {
  return `<figure class="${className}">
          ${renderLinkedImage(figure.image, context)}${figure.caption ? `
          <figcaption>${renderRichText(figure.caption)}</figcaption>` : ''}
        </figure>`;
}
