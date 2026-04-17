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

function openPost(filename) {
  const existing = document.getElementById('post-script');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = 'post-script';
  script.src = `blog/posts/${filename}`;
  script.onload = () => {
    const post = window.currentPost;
    if (!post) return;
    const reg = (window.blogRegistry || []).find(x => x.file === filename);
    const themeStr = reg ? themeLabel(reg) : '';

    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-meta').innerHTML = `
      <span class="blog-post-date">${post.date}</span>
      ${themeStr ? `<span class="blog-card-theme blog-post-theme-inline">${themeStr}</span>` : ''}
    `;
    const el = document.getElementById('post-content');
    const md = typeof marked !== 'undefined' ? marked : null;
    if (md && md.parse) el.innerHTML = md.parse(post.content);
    else if (typeof md === 'function') el.innerHTML = md(post.content);
    else el.innerHTML = post.content.replace(/</g, '&lt;');

    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-post').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = filename;
  };
  document.body.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
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

  initSakura();
  initSidebar();
  renderViewSwitch();
  renderThemeFilters();
  renderBlogList();

  const hash = window.location.hash.slice(1);
  if (hash && hash.endsWith('.js')) openPost(hash);
});
