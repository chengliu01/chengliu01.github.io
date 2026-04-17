/**
 * Floating blog admin FAB (depends on data/site.js)
 */
(function () {
  function injectBlogAdminFab() {
    const s = window.siteSettings;
    if (!s || !s.showBlogAdminFab) return;
    if (document.getElementById("blog-admin-fab")) return;

    const wrap = document.createElement("div");
    wrap.id = "blog-admin-fab";
    wrap.className = "site-admin-fab";
    wrap.innerHTML = `
<button type="button" class="site-admin-fab__btn" id="blog-admin-fab-trigger" aria-expanded="false" title="Blog settings">Blog</button>
<div class="site-admin-fab__panel" id="blog-admin-fab-panel" hidden>
  <p class="site-admin-fab__title">Blog access</p>
  <p class="site-admin-fab__row">
    <span class="site-admin-fab__label">Config file</span>
    <code class="site-admin-fab__code">data/site.js</code>
    <span class="site-admin-fab__hint">Set <strong>blogEnabled</strong> to <strong>false</strong> and redeploy to hide the blog for everyone.</span>
  </p>
  <label class="site-admin-fab__preview">
    <input type="checkbox" id="blog-admin-preview-closed" />
    <span>Preview “blog closed” in this browser only (session)</span>
  </label>
  <p class="site-admin-fab__status" id="blog-admin-status"></p>
</div>`;

    document.body.appendChild(wrap);

    const panel = wrap.querySelector("#blog-admin-fab-panel");
    const trigger = wrap.querySelector("#blog-admin-fab-trigger");
    const cb = wrap.querySelector("#blog-admin-preview-closed");
    const status = wrap.querySelector("#blog-admin-status");

    function syncPreviewCheckbox() {
      try {
        cb.checked = sessionStorage.getItem("blog_preview_closed") === "1";
      } catch (e) {
        cb.disabled = true;
      }
    }

    function refreshStatus() {
      const fileOn = (window.siteSettings && window.siteSettings.blogEnabled !== false);
      const eff = typeof window.isBlogOpen === "function" && window.isBlogOpen();
      status.innerHTML =
        "Config (file): " + (fileOn ? '<em class="site-admin-fab__on">on</em>' : '<em class="site-admin-fab__off">off</em>') + "<br/>" +
        "Effective now: " + (eff ? '<em class="site-admin-fab__on">open</em>' : '<em class="site-admin-fab__off">closed</em>');
    }

    syncPreviewCheckbox();
    refreshStatus();

    cb.addEventListener("change", function () {
      try {
        if (cb.checked) sessionStorage.setItem("blog_preview_closed", "1");
        else sessionStorage.removeItem("blog_preview_closed");
      } catch (e) { /* ignore */ }
      window.location.reload();
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      const open = panel.hidden;
      panel.hidden = !open;
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) refreshStatus();
    });

    document.addEventListener("click", function () {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBlogAdminFab);
  } else {
    injectBlogAdminFab();
  }
})();
