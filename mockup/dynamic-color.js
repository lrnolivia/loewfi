// Samples a small downscaled copy of each frame/plate image on a canvas
// and sets the average color as --frame-color on the containing element.
// Local same-origin images only (no CORS concerns). Runs once per image
// load, not continuously — this is a one-time style computation, not an
// animation.
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
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } catch (e) {
      return null; // e.g. file:// canvas security restrictions — fall back to CSS default
    }
  }

  function apply(img, target) {
    var color = averageColor(img);
    if (color) target.style.setProperty('--frame-color', color);
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
