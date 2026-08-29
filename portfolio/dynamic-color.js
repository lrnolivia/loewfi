// Samples a small downscaled copy of each frame/plate image on a canvas
// and sets both the average color (--frame-color) AND a readable text
// color for content sitting on that color (--frame-text) on the
// containing element. Local same-origin images only (no CORS concerns).
// Runs once per image load, not continuously — a one-time style
// computation, not an animation.
(function () {
  function averageColor(img) {
    var c = document.createElement('canvas');
    var w = (c.width = 24), h = (c.height = 24);
    var ctx = c.getContext('2d');
    try {
      ctx.drawImage(img, 0, 0, w, h);
      var data = ctx.getImageData(0, 0, w, h).data;
      var r = 0, g = 0, b = 0, n = 0;
      for (var i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
      }
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
      // Nudge toward the site's cream so frames never go fully saturated
      // or too dark to hold caption text — a tint of the photo's color,
      // not a literal swatch of it.
      var mix = 0.55;
      r = Math.round(r * mix + 241 * (1 - mix));
      g = Math.round(g * mix + 236 * (1 - mix));
      b = Math.round(b * mix + 223 * (1 - mix));
      return { r: r, g: g, b: b };
    } catch (e) {
      return null; // e.g. file:// canvas security restrictions — fall back to CSS default
    }
  }

  // Standard relative-luminance threshold to pick readable text over an
  // arbitrary background color — same test browsers/design tools use for
  // contrast, not something invented for this.
  function readableTextFor(rgb) {
    var lum = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return lum > 0.6 ? '#3E3B33' /* ink, for light frames */ : '#F1ECDF' /* cream, for dark frames */;
  }

  function apply(img, target) {
    var rgb = averageColor(img);
    if (!rgb) return;
    target.style.setProperty('--frame-color', 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
    target.style.setProperty('--frame-text', readableTextFor(rgb));
  }

  function wire(selectorImg, selectorTarget) {
    document.querySelectorAll(selectorImg).forEach(function (img) {
      var target = img.closest(selectorTarget);
      if (!target) return;
      if (img.complete && img.naturalWidth) {
        apply(img, target);
      } else {
        img.addEventListener('load', function () { apply(img, target); });
      }
    });
  }

  wire('.teaser-card__frame-inner img', '.teaser-card__frame');
  wire('.plate img', '.plate');
})();
