import {
  buildDisplacementLUT,
  dispersionScales,
  renderDisplacementMap,
} from '@sohumsuthar/liquid-glass/optics';

const SVG_NS = 'http://www.w3.org/2000/svg';
const lut = buildDisplacementLUT(255);
let surfaceId = 0;

function layer(className) {
  const element = document.createElement('div');
  element.className = className;
  return element;
}

function upgradeSurface(element) {
  const content = layer('liquid-glass-content');
  while (element.firstChild) content.append(element.firstChild);

  element.classList.add('liquid-glass');
  element.classList.add(element.classList.contains('view-switch') ? 'lg-macro' : 'lg-regular');
  element.prepend(
    layer('liquid-glass-effect'),
    layer('liquid-glass-tint'),
    layer('liquid-glass-shine'),
    content,
  );

  return element;
}

function mapDataUrl(width, height, radius, bezel) {
  const maxTexture = 1024;
  const divisor = Math.max(1, Math.max(width, height) / maxTexture);
  const mapWidth = Math.max(2, Math.round(width / divisor));
  const mapHeight = Math.max(2, Math.round(height / divisor));
  const canvas = document.createElement('canvas');
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext('2d');
  const image = context.createImageData(mapWidth, mapHeight);
  renderDisplacementMap(image.data, {
    width: mapWidth,
    height: mapHeight,
    radius: radius / divisor,
    bezel: bezel / divisor,
    lut: lut.lut,
  });
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

function addPhysicalLens(element) {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const id = `mockup-liquid-lens-${++surfaceId}`;
  const isPrimary = element.classList.contains('nav-pill');
  const bezel = isPrimary ? 16 : 12;
  const refraction = isPrimary ? 1.2 : 1.0;
  const dispersion = isPrimary ? 5 : 1;
  let lastSize = '';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, {
    position: 'absolute', width: '0', height: '0', overflow: 'hidden', pointerEvents: 'none',
  });
  element.prepend(svg);

  const render = () => {
    const rect = element.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const size = `${width}x${height}`;
    if (!width || !height || size === lastSize) return;
    lastSize = size;

    const radius = Math.min(parseFloat(getComputedStyle(element).borderRadius) || 22, width / 2, height / 2);
    const rim = Math.min(bezel, width / 2, height / 2);
    const href = mapDataUrl(width, height, radius, rim);
    const scale = 2.008 * lut.peak * rim * refraction;
    const channels = dispersionScales(dispersion);
    svg.innerHTML = `
      <filter id="${id}" x="0" y="0" width="${width}" height="${height}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${href}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale * channels.red}" xChannelSelector="R" yChannelSelector="G" result="dispR" />
        <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chR" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="dispG" />
        <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chG" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale * channels.blue}" xChannelSelector="R" yChannelSelector="G" result="dispB" />
        <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="chB" />
        <feBlend in="chR" in2="chG" mode="screen" result="rg" />
        <feBlend in="rg" in2="chB" mode="screen" />
      </filter>`;
    element.style.setProperty('--lg-refract', `url(#${id})`);
  };

  const observer = new ResizeObserver(() => requestAnimationFrame(render));
  observer.observe(element);
  requestAnimationFrame(render);
}

function trackIllumination(event) {
  const glass = event.target.closest('.liquid-glass');
  if (!glass) return;
  const rect = glass.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  glass.style.setProperty('--mx', `${x}px`);
  glass.style.setProperty('--my', `${y}px`);
  glass.style.setProperty('--lg-light-angle', `${Math.atan2(y - rect.height / 2, x - rect.width / 2) * 180 / Math.PI + 90}deg`);
}

document.documentElement.classList.add('dark');
document.documentElement.dataset.glassEngine = 'sohum';
const surfaces = [...document.querySelectorAll('.glass')].map(upgradeSurface);
surfaces.forEach(addPhysicalLens);
addEventListener('pointermove', trackIllumination, { passive: true });
