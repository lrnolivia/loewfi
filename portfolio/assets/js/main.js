/*
  loewfidelity portfolio — site behavior
  No frameworks, no third-party runtime. Three independent pieces:
    1. initNav()      mobile menu + tap-to-open dropdowns
    2. initLightbox()  click-through viewer for .gallery / .hub-grid figures
    3. initContactForm() posts the contact form to CONTACT_ENDPOINT
*/

(function () {
  "use strict";

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".primary-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    // Dropdown groups (Photo / Design) also need a tap target on touch devices,
    // since they normally open on hover.
    document.querySelectorAll(".nav-group > button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var group = btn.closest(".nav-group");
        var isOpen = group.classList.contains("is-open");
        document.querySelectorAll(".nav-group.is-open").forEach(function (g) {
          if (g !== group) g.classList.remove("is-open");
        });
        group.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-group")) {
        document.querySelectorAll(".nav-group.is-open").forEach(function (g) {
          g.classList.remove("is-open");
        });
      }
    });
  }

  function initLightbox() {
    var figures = Array.prototype.slice.call(document.querySelectorAll(".gallery figure[data-full]"));
    if (!figures.length) return;

    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lightbox-next" aria-label="Next image">&#8250;</button>' +
      '<span class="lightbox-counter"></span>';
    document.body.appendChild(lightbox);

    var imgEl = lightbox.querySelector("img");
    var counterEl = lightbox.querySelector(".lightbox-counter");
    var current = 0;

    function show(index) {
      current = (index + figures.length) % figures.length;
      var fig = figures[current];
      imgEl.src = fig.getAttribute("data-full");
      imgEl.alt = fig.querySelector("img") ? fig.querySelector("img").alt : "";
      counterEl.textContent = (current + 1) + " / " + figures.length;
    }

    function open(index) {
      show(index);
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    figures.forEach(function (fig, index) {
      fig.addEventListener("click", function () { open(index); });
    });

    lightbox.querySelector(".lightbox-close").addEventListener("click", close);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  // Swap this for the real Cloudflare Worker route that receives the contact form.
  var CONTACT_ENDPOINT = "/api/contact";

  function initContactForm() {
    var form = document.querySelector(".contact-form");
    if (!form) return;
    var status = form.querySelector(".form-status");
    var emailLink = document.querySelector("[data-contact-email]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "Sending\u2026";

      fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          status.textContent = "Thanks — message sent.";
          form.reset();
        })
        .catch(function () {
          var mailto = emailLink ? emailLink.getAttribute("href") : "mailto:";
          status.textContent = "Couldn't reach the server — you can email directly instead.";
          if (mailto) window.location.href = mailto;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initLightbox();
    initContactForm();
  });
})();
