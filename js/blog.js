/* Blog list: by topic (category / subcategory) or by year */

/** Year from registry (prefer dateSort) */
function postYear(p) {
  if (p.dateSort && /^\d{4}/.test(p.dateSort)) return p.dateSort.slice(0, 4);
  const parts = String(p.date || '').trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return /^\d{4}$/.test(last) ? last : '';
}

/** Newest first */
function sortByDateDesc(a, b) {
  const da = a.dateSort || a.date || '';
  const db = b.dateSort || b.date || '';
  return db.localeCompare(da);
}

/** Breadcrumb: topic · subtopic */
function themeLabel(p) {
  const tax = window.blogTaxonomy || [];
  const major = tax.find(t => t.id === p.cat);
  const mLabel = major ? major.label : (p.cat || '');
  if (!p.sub || !major || !major.subs || !major.subs.length) return mLabel;
  const sub = major.subs.find(s => s.id === p.sub);
  return sub ? `${mLabel} · ${sub.label}` : mLabel;
}

/** Post index: edit blog/registry.json and push — no rebuild. */
async function loadBlogRegistry() {
  window.blogRegistry = [];
  try {
    const res = await fetch('blog/registry.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.posts) ? data.posts : null);
    if (!Array.isArray(list))
      console.warn('[blog] registry.json: use an array, or an object with a "posts" array.');
    else window.blogRegistry = list;
  } catch (e) {
    console.warn('[blog] Could not load blog/registry.json:', e.message);
    window.blogRegistry = [];
  }
}

let viewMode = 'theme'; // 'theme' | 'time'
let themeCat = null;
let themeSub = null;

function initSakura() {
  const layer = document.getElementById('sakura');
  if (!layer) return;
  const colors = ['#93c5fd', '#7dd3fc', '#bae6fd', '#a5b4fc', '#c7d2fe'];
  function spawnPetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 6 + Math.random() * 8;
    const dur = 7 + Math.random() * 8;
    const delay = Math.random() * 6;
    p.style.cssText = `
      left:${Math.random() * 100}vw;width:${size}px;height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > .35 ? '0' : (Math.random() > .5 ? '50% 0 50% 0' : '0 50% 0 50%')};
      animation-duration:${dur}s;animation-delay:${delay}s;
    `;
    layer.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000);
  }
  setInterval(spawnPetal, 500);
  for (let i = 0; i < 8; i++) setTimeout(spawnPetal, i * 300);
}

function initSidebar() {
  const d = window.sidebarData;
  if (!d) return;
  document.querySelector('.side-links').innerHTML = (d.links || [])
    .map(l => `<a class="side-link" href="${l.href}">${l.text}</a>`).join('');
  document.querySelector('.side-status').innerHTML = `<div class="sdot"></div>${d.status}`;
  document.querySelector('.side-quote').innerHTML = d.quote.replace('\n', '<br/>');
}

function filterPostsTheme(posts) {
  return posts.filter(p => {
    if (themeCat == null) return true;
    if (p.cat !== themeCat) return false;
    if (themeSub == null) return true;
    return p.sub === themeSub;
  });
}

function renderViewSwitch() {
  const el = document.getElementById('blog-view-switch');
  if (!el) return;
  el.innerHTML = `
    <span class="blog-view-hint">Browse</span>
    <div class="blog-seg" role="tablist">
      <button type="button" class="blog-seg-btn${viewMode === 'theme' ? ' active' : ''}" data-mode="theme">By topic</button>
      <button type="button" class="blog-seg-btn${viewMode === 'time' ? ' active' : ''}" data-mode="time">By time</button>
    </div>
  `;
  el.querySelectorAll('.blog-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      viewMode = btn.getAttribute('data-mode');
      if (viewMode === 'time') {
        themeCat = null;
        themeSub = null;
      }
      renderViewSwitch();
      renderThemeFilters();
      renderBlogList();
    });
  });
}

function renderThemeFilters() {
  const wrap = document.getElementById('blog-theme-filters');
  if (!wrap) return;
  if (viewMode !== 'time') {
    const tax = window.blogTaxonomy || [];
    const catRow = `
      <div class="blog-filter-row">
        <span class="blog-filter-label">Topic</span>
        <div class="blog-filter-btns">
          <button type="button" class="blog-filter-btn${themeCat == null ? ' active' : ''}" data-cat="">All</button>
          ${tax.map(t => `
            <button type="button" class="blog-filter-btn${themeCat === t.id ? ' active' : ''}" data-cat="${t.id}">${t.label}</button>
          `).join('')}
        </div>
      </div>`;
    const major = tax.find(t => t.id === themeCat);
    const subs = major && major.subs && major.subs.length ? major.subs : [];
    const subRow = subs.length
      ? `
      <div class="blog-filter-row">
        <span class="blog-filter-label">Sub</span>
        <div class="blog-filter-btns">
          <button type="button" class="blog-filter-btn${themeSub == null ? ' active' : ''}" data-sub="">All</button>
          ${subs.map(s => `
            <button type="button" class="blog-filter-btn${themeSub === s.id ? ' active' : ''}" data-sub="${s.id}">${s.label}</button>
          `).join('')}
        </div>
      </div>`
      : '';
    wrap.innerHTML = catRow + subRow;
    wrap.querySelectorAll('[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        themeCat = btn.getAttribute('data-cat') || null;
        themeSub = null;
        renderThemeFilters();
        renderBlogList();
      });
    });
    wrap.querySelectorAll('[data-sub]').forEach(btn => {
      btn.addEventListener('click', () => {
        themeSub = btn.getAttribute('data-sub') || null;
        renderThemeFilters();
        renderBlogList();
      });
    });
    wrap.style.display = '';
  } else {
    wrap.innerHTML = '<p class="blog-time-hint">Newest year first.</p>';
  }
}

function cardHtml(p) {
  const theme = themeLabel(p);
  return `
    <a class="blog-card" href="#" data-post-file="${p.file}">
      <div class="blog-card-header">
        <span class="blog-card-date">${p.date}</span>
        <span class="blog-card-theme">${theme}</span>
      </div>
      <div class="blog-card-title">${p.title}</div>
      <div class="blog-card-excerpt">${p.excerpt}</div>
      <div class="blog-card-footer">
        <span class="blog-read-more">Read →</span>
      </div>
    </a>`;
}

function renderBlogList() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;
  const posts = window.blogRegistry || [];
  if (!posts.length) {
    grid.innerHTML = '<p class="blog-empty">No posts yet.</p>';
    return;
  }

  if (viewMode === 'theme') {
    const filtered = filterPostsTheme(posts).sort(sortByDateDesc);
    if (!filtered.length) {
      grid.innerHTML = '<p class="blog-empty">No posts in this category.</p>';
      return;
    }
    grid.innerHTML = filtered.map(cardHtml).join('');
  } else {
    const sorted = [...posts].sort(sortByDateDesc);
    const byYear = {};
    sorted.forEach(p => {
      const y = postYear(p) || '?';
      if (!byYear[y]) byYear[y] = [];
      byYear[y].push(p);
    });
    const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
    grid.innerHTML = years.map(y => `
      <div class="blog-time-group">
        <div class="blog-time-year">${y}</div>
        <div class="blog-time-list">
          ${byYear[y].map(cardHtml).join('')}
        </div>
      </div>
    `).join('');
  }

  grid.querySelectorAll('.blog-card[data-post-file]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      openPost(a.getAttribute('data-post-file'));
    });
  });
}

/** Reject path traversal and absolute paths; allow nested dirs like foo/bar.md */
function isSafePostRelativePath(filename) {
  if (!filename || typeof filename !== 'string') return false;
  const t = filename.trim();
  if (t.includes('..')) return false;
  if (t.startsWith('/') || t.startsWith('\\')) return false;
  return /\.(md|js)$/i.test(t);
}

function encodeBlogPostFetchUrl(filename) {
  const parts = filename.split('/').map(encodeURIComponent);
  return `blog/posts/${parts.join('/')}`;
}

/**
 * Minimal YAML-ish frontmatter: leading --- block, key: value lines.
 * Overrides registry title/date only when keys are present.
 */
function parseMarkdownWithFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\n/);
  if (!lines.length || lines[0].trim() !== '---')
    return { meta: {}, body: text.trim() };
  const meta = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') {
      i++;
      break;
    }
    const m = /^([\w-]+)\s*:\s*(.+)$/.exec(line);
    if (m) {
      let v = m[2].trim().replace(/^["']|["']$/g, '');
      meta[m[1]] = v;
    }
  }
  const body = lines.slice(i).join('\n').replace(/^\n+/, '').trimEnd();
  return { meta, body };
}

function renderMarkdownToEl(el, markdown) {
  const md = typeof marked !== 'undefined' ? marked : null;
  if (md && md.parse) el.innerHTML = md.parse(markdown);
  else if (typeof md === 'function') el.innerHTML = md(markdown);
  else el.innerHTML = markdown.replace(/</g, '&lt;');
}

function mergePostPayload(reg, meta, body) {
  const title =
    meta.title || (reg && reg.title) || 'Untitled';
  const date =
    meta.date || (reg && reg.date) || '';
  return {
    title,
    date,
    dateSort: meta.dateSort || (reg && reg.dateSort) || '',
    content: body,
  };
}

function showPostShell(reg, post) {
  const themeStr = reg ? themeLabel(reg) : '';
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-meta').innerHTML = `
      <span class="blog-post-date">${post.date}</span>
      ${themeStr ? `<span class="blog-card-theme blog-post-theme-inline">${themeStr}</span>` : ''}`;
  const el = document.getElementById('post-content');
  renderMarkdownToEl(el, post.content || '');
}

function navigateToPostInUi(filename) {
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-post').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.location.hash = encodeURIComponent(filename);
}

function openPost(filename) {
  if (!isSafePostRelativePath(filename)) return;

  const reg = (window.blogRegistry || []).find(x => x.file === filename);

  const existingScript = document.getElementById('post-script');
  if (existingScript) existingScript.remove();

  if (/\.md$/i.test(filename)) {
    delete window.currentPost;

    navigateToPostInUi(filename);

    document.getElementById('post-title').textContent = '\u2026';
    document.getElementById('post-meta').innerHTML = reg
      ? `
      <span class="blog-post-date">${reg.date}</span>
      ${themeLabel(reg) ? `<span class="blog-card-theme blog-post-theme-inline">${themeLabel(reg)}</span>` : ''}`
      : '';
    const loadingEl = document.getElementById('post-content');
    loadingEl.innerHTML = '<p class="blog-post-loading">Loading…</p>';

    fetch(encodeBlogPostFetchUrl(filename))
      .then(r => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then(raw => {
        const { meta, body } = parseMarkdownWithFrontmatter(raw);
        const post = mergePostPayload(reg || {}, meta, body);
        showPostShell(reg, post);
      })
      .catch(() => {
        document.getElementById('post-title').textContent = 'Failed to load';
        loadingEl.innerHTML =
          '<p class="blog-post-error">Could not load this post. Refresh and try again, or open from the blog index.</p>';
      });
    return;
  }

  if (!/\.js$/i.test(filename)) return;

  const script = document.createElement('script');
  script.id = 'post-script';
  script.src = encodeBlogPostFetchUrl(filename);
  script.onload = () => {
    const post = window.currentPost;
    if (!post) {
      document.getElementById('post-title').textContent = 'Failed to load';
      document.getElementById('post-content').innerHTML =
        '<p class="blog-post-error">This script did not expose <code>window.currentPost</code>.</p>';
      navigateToPostInUi(filename);
      return;
    }
    showPostShell(reg, post);
    navigateToPostInUi(filename);
  };
  script.onerror = () => {
    document.getElementById('post-title').textContent = 'Failed to load';
    document.getElementById('post-content').innerHTML =
      '<p class="blog-post-error">Could not load this script. The post file may be missing.</p>';
    navigateToPostInUi(filename);
  };
  document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', async () => {
  const gate = document.getElementById('blog-gate');
  const app = document.getElementById('blog-app');
  if (typeof window.isBlogOpen === 'function' && !window.isBlogOpen()) {
    if (gate) {
      gate.style.display = 'flex';
      const msg = document.getElementById('blog-gate-msg');
      if (msg) {
        msg.textContent = (window.siteSettings && window.siteSettings.blogClosedMessage) || 'Unavailable.';
      }
    }
    if (app) app.style.display = 'none';
    return;
  }

  const back = document.getElementById('back-btn');
  if (back) {
    back.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('view-post').style.display = 'none';
      document.getElementById('view-list').style.display = 'block';
      history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  await loadBlogRegistry();

  initSakura();
  initSidebar();
  renderViewSwitch();
  renderThemeFilters();
  renderBlogList();

  let hash = window.location.hash.slice(1);
  if (!hash) return;
  try {
    hash = decodeURIComponent(hash);
  } catch (_) { /* keep raw */ }
  if (isSafePostRelativePath(hash) && (/\.js$/i.test(hash) || /\.md$/i.test(hash))) openPost(hash);
});
