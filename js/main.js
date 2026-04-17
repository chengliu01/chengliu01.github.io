/* Main page: load data/*.js and render */

/* Default avatar (pixel shiba) */
const SHIBA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <style>
    .eo{animation:eb 5s ease-in-out infinite}
    .ec{opacity:0;animation:ec 5s ease-in-out infinite}
    @keyframes eb{0%,85%,100%{opacity:1}91%,95%{opacity:0}}
    @keyframes ec{0%,85%,100%{opacity:0}91%,95%{opacity:1}}
    .tl{transform-origin:68px 44px;animation:wg 1.3s ease-in-out infinite}
    @keyframes wg{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(16deg)}}
  </style>
  <rect x="8"  y="5"  width="12" height="16" rx="4" fill="#F5C87A"/>
  <rect x="11" y="8"  width="7"  height="9"  rx="3" fill="#D87060"/>
  <rect x="58" y="5"  width="12" height="16" rx="4" fill="#F5C87A"/>
  <rect x="60" y="8"  width="7"  height="9"  rx="3" fill="#D87060"/>
  <rect x="8"  y="15" width="62" height="46" rx="12" fill="#F5C87A"/>
  <rect x="18" y="38" width="42" height="20" rx="8"  fill="#FDECD4"/>
  <g class="eo">
    <rect x="19" y="24" width="16" height="14" rx="5" fill="#2A1808"/>
    <rect x="44" y="24" width="16" height="14" rx="5" fill="#2A1808"/>
    <rect x="21" y="25" width="5"  height="5"  rx="2" fill="#fff" opacity=".5"/>
    <rect x="46" y="25" width="5"  height="5"  rx="2" fill="#fff" opacity=".5"/>
  </g>
  <g class="ec">
    <rect x="19" y="30" width="16" height="5" rx="2" fill="#2A1808"/>
    <rect x="44" y="30" width="16" height="5" rx="2" fill="#2A1808"/>
  </g>
  <rect x="32" y="40" width="14" height="9" rx="4" fill="#3A1005"/>
  <ellipse cx="14" cy="46" rx="6" ry="4" fill="#F4A0B0" opacity=".6"/>
  <ellipse cx="64" cy="46" rx="6" ry="4" fill="#F4A0B0" opacity=".6"/>
  <rect x="10" y="56" width="58" height="20" rx="10" fill="#F5C87A"/>
  <rect x="22" y="58" width="34" height="15" rx="7"  fill="#FFF4E8" opacity=".6"/>
  <g class="tl">
    <circle cx="68" cy="44" r="6" fill="#F5C87A"/>
    <circle cx="70" cy="37" r="5" fill="#D8952A"/>
  </g>
  <rect x="12" y="70" width="14" height="8" rx="4" fill="#D8952A"/>
  <rect x="52" y="70" width="14" height="8" rx="4" fill="#D8952A"/>
</svg>`;

/* Helpers */
function renderAuthors(raw) {
  return raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function escapeAttr(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Primary URL: paperUrl → arxiv → first badge with link */
function getPublicationPrimaryLink(p) {
  if (p.paperUrl) return p.paperUrl;
  if (p.arxiv) return p.arxiv;
  const b = (p.badges || []).find(x => x && x.link);
  return b ? b.link : null;
}

function venueShortLabel(venue) {
  if (!venue) return "·";
  if (/INFOCOM/i.test(venue)) return "INFOCOM";
  if (/\bCCS\b/i.test(venue)) return "CCS";
  if (/NSDI/i.test(venue)) return "NSDI";
  return venue.length > 10 ? venue.slice(0, 9) + "…" : venue;
}

/** Publication thumb inner HTML */
function renderPubThumbInner(p) {
  if (p.thumb) {
    return `<img class="pub-thumb" src="${escapeAttr(p.thumb)}" alt="" loading="lazy"/>`;
  }
  if (p.arxiv) {
    return `<a class="pub-thumb-fallback pub-thumb-fallback--arxiv" href="${escapeAttr(p.arxiv)}" target="_blank" rel="noopener noreferrer" aria-label="arXiv abstract"><span class="pub-thumb-fallback__arxiv-strip">arXiv</span><span class="pub-thumb-fallback__hint">Abstract</span></a>`;
  }
  return `<div class="pub-thumb-fallback pub-thumb-fallback--venue"><span>${venueShortLabel(p.venue)}</span></div>`;
}

/** Wrap thumb in <a> when needed */
function renderPubThumb(p, primaryHref) {
  const inner = renderPubThumbInner(p);
  if (!primaryHref) return inner;
  if (p.arxiv && primaryHref === p.arxiv && inner.includes("pub-thumb-fallback--arxiv")) {
    return inner;
  }
  if (/^<a\s/i.test(inner.trim())) return inner;
  return `<a class="pub-thumb-link" href="${escapeAttr(primaryHref)}" target="_blank" rel="noopener noreferrer" aria-label="Open paper">${inner}</a>`;
}

function applyBlogNav() {
  const a = document.querySelector('nav a[href="blog.html"]');
  if (!a) return;
  if (typeof window.isBlogOpen === "function" && !window.isBlogOpen()) {
    a.remove();
  }
}

function renderSidebar() {
  const d = window.sidebarData;
  if (!d) return;

  const linksWrap = document.querySelector('.side-links');
  if (linksWrap && d.links) {
    linksWrap.innerHTML = d.links
      .map(l => `<a class="side-link" href="${l.href}">${l.text}</a>`)
      .join('');
  }

  const statusEl = document.querySelector('.side-status');
  if (statusEl && d.status) {
    statusEl.innerHTML = `<div class="sdot"></div>${d.status}`;
  }

  const quoteEl = document.querySelector('.side-quote');
  if (quoteEl && d.quote) {
    quoteEl.innerHTML = d.quote.replace('\n', '<br/>');
  }
}

function renderHero() {
  const d = window.heroData;
  if (!d) return;

  const avatarEl = document.querySelector('.hero-avatar');
  if (avatarEl) {
    avatarEl.innerHTML = d.avatar
      ? `<img src="${d.avatar}" alt="Avatar"/>`
      : SHIBA_SVG;
  }

  const nameEl = document.querySelector('.hero-name');
  if (nameEl) nameEl.innerHTML = `${d.nameFirst} <em>${d.nameLast}</em>`;

  const subEl = document.querySelector('.hero-sub');
  if (subEl) subEl.innerHTML = d.description || '';

  const pillsEl = document.querySelector('.hero-pills');
  if (pillsEl && d.pills) {
    pillsEl.innerHTML = d.pills
      .map(p => `<span class="pill">${p.icon} ${p.text}</span>`)
      .join('');
  }
}

function renderAbout() {
  const d = window.aboutData;
  if (!d) return;
  const grid = document.querySelector('.about-grid');
  if (!grid) return;
  grid.innerHTML = d.cards.map(c => `
    <div class="about-card ${c.color}">
      <div class="about-card-icon">${c.icon}</div>
      <div class="about-card-title">${c.title}</div>
      <div class="about-card-sub">${c.content}</div>
    </div>
  `).join('');
}

function renderExperience() {
  const data = window.experienceData;
  if (!data) return;
  const list = document.querySelector('.exp-list');
  if (!list) return;

  list.innerHTML = data
    .map(item => {
      const titleHtml = item.title
        ? `<div class="exp-item-title">${escapeHtml(item.title)}</div>`
        : '';
      return `
        <div class="exp-item">
          <div class="exp-date">${item.date}</div>
          <div class="exp-body">${titleHtml}${item.text}</div>
        </div>
      `;
    })
    .join('');
}

function renderPublications() {
  const data = window.publicationsData;
  if (!data) return;
  const list = document.querySelector('.pub-list');
  if (!list) return;
  list.innerHTML = data.map((p, i) => {
    const primary = getPublicationPrimaryLink(p);
    const badgesHtml = (p.badges || []).map(b => {
      const t = b.type || "pdf";
      const cls = `badge badge-${t}`;
      const href = b.link ? escapeAttr(b.link) : "";
      return b.link
        ? `<a href="${href}" class="${cls}" target="_blank" rel="noopener noreferrer">${escapeHtml(b.text)}</a>`
        : `<span class="${cls}">${escapeHtml(b.text)}</span>`;
    }).join('');
    const sameArxiv =
      p.paperUrl &&
      p.arxiv &&
      String(p.paperUrl).replace(/\/+$/, "") === String(p.arxiv).replace(/\/+$/, "");
    const arxivBtn =
      p.arxiv && !sameArxiv
        ? `<a href="${escapeAttr(p.arxiv)}" class="badge badge-arxiv" target="_blank" rel="noopener noreferrer">arXiv</a>`
        : "";
    const titleHtml = primary
      ? `<a class="pub-title-link" href="${escapeAttr(primary)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a>`
      : escapeHtml(p.title);
    const venueHtml = primary
      ? `<a class="pub-venue pub-venue--link" href="${escapeAttr(primary)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.venue)}</a>`
      : `<span class="pub-venue">${escapeHtml(p.venue)}</span>`;
    const extraRow = `${arxivBtn}${badgesHtml}`;
    const badgesRow = extraRow.trim()
      ? `<div class="pub-badges">${arxivBtn}${badgesHtml}</div>`
      : "";
    return `
      <div class="pub-card">
        <div class="pub-thumb-wrap">${renderPubThumb(p, primary)}</div>
        <div class="pub-main">
          <div class="pub-number">${String(i + 1).padStart(2, '0')}</div>
          <div class="pub-body">
            <h3 class="pub-title">${titleHtml}</h3>
            <div class="pub-authors">${renderAuthors(p.authors)}</div>
            ${venueHtml}
            ${badgesRow}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderProjects() {
  const data = window.projectsData;
  if (!data) return;
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;
  grid.innerHTML = data.map(p => {
    const linksHtml = p.links
      .map(l => `<a class="project-link" href="${l.href}" target="_blank">${l.text}</a>`)
      .join('');
    const tagsHtml = p.tags
      .map(t => `<span class="project-tag">${t}</span>`)
      .join('');
    return `
      <div class="project-card">
        <div class="project-header">
          <div class="project-icon">${p.icon}</div>
          <div class="project-links">${linksHtml}</div>
        </div>
        <div class="project-name">${p.name}</div>
        <div class="project-desc">${p.description}</div>
        <div class="project-tags">${tagsHtml}</div>
      </div>
    `;
  }).join('');
}

function renderNews() {
  const data = window.newsData;
  if (!data) return;
  const list = document.querySelector('.news-list');
  if (!list) return;

  const groups = {};
  data.forEach(item => {
    const year = item.year || (item.date.split(/\s+/).pop() || '');
    if (!groups[year]) groups[year] = [];
    groups[year].push(item);
  });

  list.innerHTML = Object.keys(groups)
    .sort((a, b) => b - a)
    .map(year => {
      const rows = groups[year].map(item => `
        <div class="news-item">
          <div class="news-date">${item.date}</div>
          <div class="news-text">${item.text}</div>
        </div>
      `).join('');
      return `
        <div class="news-year-group">
          <div class="news-year-label">${year}</div>
          ${rows}
        </div>
      `;
    }).join('');
}

function renderContact() {
  const d = window.contactData;
  if (!d) return;

  const introEl = document.querySelector('.contact-intro');
  if (introEl) introEl.textContent = d.intro;

  const emailEl = document.querySelector('.contact-email');
  if (emailEl && d.email) {
    const mail = escapeAttr(`mailto:${d.email}`);
    emailEl.innerHTML = `<a href="${mail}">${escapeHtml(d.email)}</a>`;
  }

  const linksEl = document.querySelector('.contact-links');
  if (linksEl && d.links) {
    linksEl.innerHTML = d.links
      .map(l => {
        const href = escapeAttr(l.href);
        const text = escapeHtml(l.text);
        return `<a class="contact-link" href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      })
      .join('');
  }
}

function initSakura() {
  const layer  = document.getElementById('sakura');
  if (!layer) return;
  const colors = ['#93c5fd','#7dd3fc','#bae6fd','#a5b4fc','#c7d2fe'];
  function spawnPetal() {
    const p     = document.createElement('div');
    p.className = 'petal';
    const size  = 6 + Math.random() * 8;
    const left  = Math.random() * 100;
    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 6;
    const shape = Math.random() > .35 ? '0' : (Math.random() > .5 ? '50% 0 50% 0' : '0 50% 0 50%');
    p.style.cssText = `
      left:${left}vw; width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${shape};
      animation-duration:${dur}s; animation-delay:${delay}s;
    `;
    layer.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000);
  }
  setInterval(spawnPetal, 500);
  for (let i = 0; i < 8; i++) setTimeout(spawnPetal, i * 300);
}

/* ── Pixel-art bicycle canvas ─────────────────── */
function initPixelBike() {
  const canvas = document.querySelector('.pixel-bike-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const PS = 3; // one art-pixel = 3×3 real pixels
  const AW = (canvas.width  / PS) | 0; // 58
  const AH = (canvas.height / PS) | 0; // 26

  // Palette
  const TI = '#0c0d14'; // tire
  const RI = '#c0c8d0'; // rim
  const SP = '#7a8898'; // spoke
  const HU = '#f59e0b'; // hub amber
  const FR = '#2563eb'; // frame blue
  const FD = '#1740a8'; // frame shadow
  const CH = '#2d3748'; // chain/crank
  const SA = '#0f172a'; // saddle
  const HB = '#1e293b'; // handlebar
  const SH = '#dc2626'; // shirt red
  const PA = '#1e3a5f'; // pants navy
  const PD = '#162f4f'; // pants dark
  const SK = '#fcd9b6'; // skin
  const HM = '#dc2626'; // helmet
  const HV = '#fbbf24'; // visor

  function px(x, y, c, w = 1, h = 1) {
    if (x + w <= 0 || y + h <= 0 || x >= AW || y >= AH) return;
    ctx.fillStyle = c;
    ctx.fillRect(x * PS, y * PS, w * PS, h * PS);
  }

  function circ(cx, cy, r, c, fill = false) {
    for (let dy = -r; dy <= r; dy++) {
      const dx = Math.round(Math.sqrt(r * r - dy * dy));
      if (fill) { px(cx - dx, cy + dy, c, dx * 2 + 1); }
      else { px(cx + dx, cy + dy, c); if (dx > 0) px(cx - dx, cy + dy, c); }
    }
  }

  function ln(x1, y1, x2, y2, c) {
    let dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1;
    let dy = -Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      px(x1, y1, c);
      if (x1 === x2 && y1 === y2) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x1 += sx; }
      if (e2 <= dx) { err += dx; y1 += sy; }
    }
  }

  function ln2(x1, y1, x2, y2, c) {
    ln(x1, y1, x2, y2, c);
    const adx = x2 - x1, ady = y2 - y1;
    const len = Math.hypot(adx, ady) || 1;
    const nx = Math.round(-ady / len), ny = Math.round(adx / len);
    ln(x1 + nx, y1 + ny, x2 + nx, y2 + ny, c);
  }

  const noMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0, rafId = 0;

  // Geometry (art pixels, 58×26 grid)
  const WR=6, RWX=9, RWY=18, FWX=49, FWY=18;
  const BBX=27, BBY=18;
  const STX=24, STY=8;   // seat-tube top
  const HTX=38, HTY=7;   // head-tube top
  const HBX=40, HBY=12;  // head-tube bottom
  const CL=3;            // crank arm length

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const wa  = t * 0.055;
    const p1x = BBX + Math.round(CL * Math.cos(wa));
    const p1y = BBY + Math.round(CL * Math.sin(wa));
    const p2x = BBX - Math.round(CL * Math.cos(wa));
    const p2y = BBY - Math.round(CL * Math.sin(wa));
    const hipX = STX, hipY = STY + 2;
    const shlX = 36,  shlY = 4;
    const hdX  = 39,  hdY  = 2; // head center

    // ── Rear wheel ──────────────────────────────
    circ(RWX, RWY, WR,     TI);
    circ(RWX, RWY, WR - 1, TI);
    circ(RWX, RWY, WR - 2, RI);
    for (let i = 0; i < 4; i++) {
      const a = wa + i * Math.PI / 2;
      for (let r = 2; r <= WR - 2; r++)
        px(RWX + Math.round(r * Math.cos(a)), RWY + Math.round(r * Math.sin(a)), SP);
    }
    circ(RWX, RWY, 1, HU, true);

    // ── Frame ────────────────────────────────────
    ln2(RWX, RWY,  BBX, BBY,  FD); // chain stays
    ln2(STX, STY,  RWX, RWY,  FD); // seat stays
    ln2(BBX, BBY,  STX, STY,  FR); // seat tube
    ln2(STX, STY,  HTX, HTY,  FR); // top tube
    ln2(BBX, BBY,  HBX, HBY,  FR); // down tube
    ln2(HTX, HTY,  HBX, HBY,  FR); // head tube
    ln2(HBX, HBY,  FWX, FWY,  FD); // fork

    // Saddle
    px(STX - 4, STY - 2, SA, 8, 1);
    px(STX - 3, STY - 1, SA, 6, 1);

    // Handlebar stem + drop bars
    px(HTX, HTY - 4, HB, 2, 4);
    px(HTX - 3, HTY - 4, HB, 8, 1);
    px(HTX - 3, HTY - 3, HB, 1, 2);
    px(HTX + 4, HTY - 3, HB, 1, 2);

    // ── Chainring + cranks ───────────────────────
    circ(BBX, BBY, 3, CH);
    ln(BBX, BBY, p1x, p1y, CH);
    ln(BBX, BBY, p2x, p2y, CH);
    px(p1x - 1, p1y, HB, 3, 1); // pedal 1
    px(p2x - 1, p2y, HB, 3, 1); // pedal 2
    circ(BBX, BBY, 1, HU, true);

    // ── Legs ─────────────────────────────────────
    const k1x = ((hipX + p1x) / 2 + 2 * Math.sin(wa))  | 0;
    const k1y = ((hipY + p1y) / 2 + 1)                  | 0;
    const k2x = ((hipX + p2x) / 2 - 2 * Math.sin(wa))  | 0;
    const k2y = ((hipY + p2y) / 2 + 1)                  | 0;
    ln2(hipX, hipY, k2x, k2y, PD); // back leg (behind)
    ln2(k2x,  k2y,  p2x, p2y, PD);
    ln2(hipX, hipY, k1x, k1y, PA); // front leg
    ln2(k1x,  k1y,  p1x, p1y, PA);

    // ── Rider body ───────────────────────────────
    ln2(hipX, hipY - 1, shlX, shlY, SH); // torso
    ln(shlX,     shlY, HTX,     HTY - 4, SK); // arms
    ln(shlX + 1, shlY, HTX + 2, HTY - 4, SK);

    // Head
    circ(hdX, hdY, 2, SK, true);
    px(hdX + 1, hdY - 1, '#0d0d1a', 1, 1); // eye

    // Helmet
    px(hdX - 2, hdY - 4, HM, 6, 2);
    px(hdX - 3, hdY - 2, HM, 7, 2);
    px(hdX - 3, hdY,     HM, 1, 1);
    px(hdX + 3, hdY,     HM, 1, 1);
    px(hdX + 1, hdY + 1, HV, 3, 1); // visor stripe

    // ── Front wheel ──────────────────────────────
    circ(FWX, FWY, WR,     TI);
    circ(FWX, FWY, WR - 1, TI);
    circ(FWX, FWY, WR - 2, RI);
    for (let i = 0; i < 4; i++) {
      const a = wa + Math.PI / 4 + i * Math.PI / 2;
      for (let r = 2; r <= WR - 2; r++)
        px(FWX + Math.round(r * Math.cos(a)), FWY + Math.round(r * Math.sin(a)), SP);
    }
    circ(FWX, FWY, 1, HU, true);

    if (!noMotion) t++;
    rafId = requestAnimationFrame(draw);
  }

  draw();
  window.addEventListener('pagehide', () => cancelAnimationFrame(rafId), { once: true });
}

/* ── Scroll reveal ────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Active nav ───────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  applyBlogNav();
  renderSidebar();
  renderHero();
  renderAbout();
  renderExperience();
  renderPublications();
  renderProjects();
  renderNews();
  renderContact();
  initSakura();
  initReveal();
  initActiveNav();
  initPixelBike();
});
