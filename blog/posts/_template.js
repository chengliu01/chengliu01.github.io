/**
 * JavaScript-backed post template.
 *
 * Or use Markdown: save under blog/posts/ (subfolders OK), registry file: "subdir/slug.md".
 * Frontmatter optional: --- then title/date/dateSort lines, then ---
 *
 * Steps for this file:
 * 1. Copy to blog/posts/YYYY-MM-slug.js
 * 2. Set title, date, content (Markdown)
 * 3. Append an object to blog/registry.json (file/title/date/dateSort/cat/sub/excerpt)
 * 4. Reload blog.html
 */
window.currentPost = {
  title:   "Post title",
  date:    "May 1, 2025",
  content: `
## Section

Body text.

\`\`\`python
print("hello")
\`\`\`
  `,
};
