/**
 * Site-wide settings (read by the homepage and blog)
 * ─────────────────────────────────────────────
 * blogEnabled: false hides the Blog nav link and shows a closed message on blog.html
 * blogClosedMessage: plain text when the blog is disabled
 * showBlogAdminFab: floating admin button (set false on public sites if you prefer)
 */
window.siteSettings = {
  blogEnabled: true,
  blogClosedMessage: "The blog is temporarily unavailable. Please check back later or reach out via the homepage.",
  showBlogAdminFab: false,
};

window.isBlogOpen = function isBlogOpen() {
  const s = window.siteSettings || {};
  if (s.blogEnabled === false) return false;
  try {
    if (typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem("blog_preview_closed") === "1") {
      return false;
    }
  } catch (e) { /* private mode */ }
  return true;
};
