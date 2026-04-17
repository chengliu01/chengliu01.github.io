/**
 * New post template
 * 1. Copy to blog/posts/YYYY-MM-slug.js
 * 2. Set title, date, content (Markdown)
 * 3. Add a row to blog/registry.js (with cat/sub/dateSort/excerpt)
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
