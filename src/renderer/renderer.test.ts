import { describe, expect, it } from 'vitest';
import about from '../shared/content/fixtures/about.json';
import avedastudio from '../shared/content/fixtures/avedastudio.json';
import cksteele from '../shared/content/fixtures/cksteele.json';
import contact from '../shared/content/fixtures/contact.json';
import home from '../shared/content/fixtures/home.json';
import hydroviv from '../shared/content/fixtures/hydroviv.json';
import siteConfig from '../shared/content/fixtures/site-config.json';
import { relativeAssetUrl } from './assets.js';
import { renderSite } from './site.js';

const fixtureInput = {
  projects: [hydroviv, cksteele, avedastudio],
  pages: [home, about, contact],
  siteConfig,
};

describe('site renderer', () => {
  it('produces a deterministic and uniquely addressed artifact set', () => {
    const first = renderSite(fixtureInput);
    const second = renderSite(structuredClone(fixtureInput));
    expect(second).toEqual(first);
    expect(first).toHaveLength(8);
    expect(new Set(first.map((artifact) => artifact.path)).size).toBe(first.length);
  });

  it('renders every canonical page and project document', () => {
    const paths = renderSite(fixtureInput).map((artifact) => artifact.path);
    expect(paths).toEqual([
      'generated-preview/renderer.css',
      'generated-preview/gallery-switcher.js',
      'generated-preview/home.html',
      'generated-preview/about.html',
      'generated-preview/contact.html',
      'generated-preview/avedastudio.html',
      'generated-preview/hydroviv.html',
      'generated-preview/cksteele.html',
    ]);
  });

  it('escapes authored text rather than treating it as HTML', () => {
    const unsafe = structuredClone(home);
    unsafe.hero.headline = [{ type: 'text', text: '<script>alert("no")</script>' }];
    const html = artifactContent(renderSite({ ...fixtureInput, pages: [unsafe, about, contact] }), 'home.html');
    expect(html).toContain('&lt;script&gt;alert(&quot;no&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("no")</script>');
  });

  it('renders stable heading anchors and real design-project structures', () => {
    const artifacts = renderSite(fixtureInput);
    const hydrovivHtml = artifactContent(artifacts, 'hydroviv.html');
    const cksteeleHtml = artifactContent(artifacts, 'cksteele.html');
    expect(hydrovivHtml).toContain('<h2 id="brochure">The brochure</h2>');
    expect(hydrovivHtml).toContain('class="plate-pair"');
    expect(cksteeleHtml).toContain('class="baPair plate"');
    expect(cksteeleHtml).toContain('style="--strip-cols:4"');
  });

  it('renders all five gallery modes and accessible carousel controls', () => {
    const html = artifactContent(renderSite(fixtureInput), 'avedastudio.html');
    for (const mode of ['grid', 'natural', 'strip', 'story', 'carousel']) {
      expect(html).toContain(`data-set-view="${mode}"`);
    }
    expect(html).toContain('aria-label="Previous image"');
    expect(html).toContain('4 of 44');
  });

  it('declares every selected Home image as an artifact dependency', () => {
    const homeArtifact = renderSite(fixtureInput).find((artifact) => artifact.path.endsWith('home.html'));
    expect(homeArtifact?.dependencies).toEqual(expect.arrayContaining([
      'portfolio/assets/images/avedastudio/avedastudio-01.jpg',
      'portfolio/assets/graphics/hydroviv/hydroviv-01.png',
      'portfolio/assets/graphics/cksteele/cksteele-07.jpg',
    ]));
  });

  it('uses the committed Sohum adapter without introducing a renderer dependency', () => {
    const htmlArtifacts = renderSite(fixtureInput).filter((artifact) => artifact.contentType === 'text/html');
    for (const artifact of htmlArtifacts) {
      expect(artifact.content).toContain('sohum-glass.css');
      expect(artifact.content).toContain('sohum-glass.js');
      expect(artifact.content).not.toContain('ybouane');
    }
  });
});

describe('asset URL resolution', () => {
  it('resolves repository assets relative to each generated artifact', () => {
    expect(relativeAssetUrl('generated-preview/hydroviv.html', 'portfolio/assets/photo.jpg'))
      .toBe('../portfolio/assets/photo.jpg');
  });
});

function artifactContent(
  artifacts: ReturnType<typeof renderSite>,
  suffix: string,
): string {
  const artifact = artifacts.find((item) => item.path.endsWith(suffix));
  if (!artifact) throw new Error(`Missing artifact ending in ${suffix}`);
  return artifact.content;
}
