// RankSEO SERP Overlay
// Injects result numbers + Moz DA / KE-style stats under each Google search result
(function () {
  'use strict';

  if (window.__rankseoSerpLoaded) return;
  window.__rankseoSerpLoaded = true;

  // Only run on Google/Bing search result pages
  const host = location.hostname;
  const isGoogle = host.includes('google.');
  const isBing = host.includes('bing.com');
  if (!isGoogle && !isBing) return;
  if (isGoogle && !location.pathname.startsWith('/search')) return;
  if (isBing && !location.pathname.startsWith('/search')) return;

  // Only run the overlay on the standard web ("All"/"Web") results page on
  // Google. Images/Videos/News/Forums/etc. set a `udm` parameter (Images =
  // udm=2) or the legacy `tbm` parameter — skip those. Bing is left untouched
  // because it does not use these parameters. Google controls these values and
  // has changed them before, so verify per-tab after installing.
  function isWebResultsPage() {
    if (!isGoogle) return true;
    const params = new URLSearchParams(location.search);
    if (params.get('tbm')) return false;
    const udm = params.get('udm');
    if (udm && udm !== '14') return false;
    return true;
  }

  // ─── Inject CSS ────────────────────────────────────────────────────────────
  if (!document.getElementById('rs-serp-style')) {
    const style = document.createElement('style');
    style.id = 'rs-serp-style';
    style.textContent = `
      .rs-serp-num {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 22px !important;
        height: 22px !important;
        border-radius: 50% !important;
        background: #0D9488 !important;
        color: #fff !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        font-style: normal !important;
        line-height: 1 !important;
        padding: 0 3px !important;
        box-sizing: border-box !important;
        /* Absolute positioning so it never inherits parent flex/transform */
        position: absolute !important;
        top: 4px !important;
        left: -32px !important;
        z-index: 99999 !important;
        transform: none !important;
        -webkit-transform: none !important;
        rotate: none !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
        direction: ltr !important;
        unicode-bidi: normal !important;
        pointer-events: none !important;
      }
      /* Rank change vs previous SERP scan — sits under the # badge */
      .rs-rank-change {
        position: absolute !important;
        top: 28px !important;
        left: -38px !important;
        z-index: 99999 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 28px !important;
        max-width: 42px !important;
        height: 14px !important;
        padding: 0 3px !important;
        border-radius: 4px !important;
        font-size: 9px !important;
        font-weight: 800 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        line-height: 1 !important;
        white-space: nowrap !important;
        pointer-events: auto !important;
        direction: ltr !important;
        text-align: center !important;
        box-sizing: border-box !important;
        letter-spacing: -0.02em !important;
      }
      .rs-rank-change.up {
        color: #166534 !important;
        background: #dcfce7 !important;
        border: 1px solid #86efac !important;
      }
      .rs-rank-change.down {
        color: #991b1b !important;
        background: #fee2e2 !important;
        border: 1px solid #fca5a5 !important;
      }
      .rs-rank-change.same {
        color: #64748b !important;
        background: #f1f5f9 !important;
        border: 1px solid #e2e8f0 !important;
      }
      .rs-rank-change.new {
        color: #0369a1 !important;
        background: #e0f2fe !important;
        border: 1px solid #7dd3fc !important;
        font-size: 8px !important;
      }
      /* Ensure result containers are position:relative so our badge positions correctly */
      .rs-serp-anchor {
        position: relative !important;
      }
      .rs-serp-wrapper {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
        transform: none !important;
        -webkit-transform: none !important;
        writing-mode: horizontal-tb !important;
        float: none !important;
        clear: both !important;
        position: static !important;
        flex-basis: 100% !important;
        flex-shrink: 0 !important;
        order: initial !important;
      }
      /* ── Weak (low DA/DR) competitor highlight ── */
      .rs-weak-result {
        background: rgba(5,150,105,0.06) !important;
        border: 1.5px solid rgba(5,150,105,0.28) !important;
        border-radius: 10px !important;
        padding: 10px 14px !important;
      }
      .rs-weak-flag {
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        z-index: 99999 !important;
        display: inline-flex !important;
        align-items: center !important;
        font-family: 'Inter', Arial, Helvetica, sans-serif !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        padding: 4px 10px !important;
        border-radius: 20px !important;
        background: rgba(5,150,105,0.14) !important;
        color: #059669 !important;
        border: 1px solid rgba(5,150,105,0.30) !important;
        white-space: nowrap !important;
        pointer-events: none !important;
        direction: ltr !important;
      }
      .rs-serp-row, .rs-serp-row[dir="ltr"] {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        overflow-y: visible !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        margin: 3px 0 5px 0 !important;
        padding: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
        text-align: left !important;
        transform: none !important;
        -webkit-transform: none !important;
        writing-mode: horizontal-tb !important;
      }
      /* Force every descendant of the badge row to stay LTR regardless of
         any dir="rtl" or transform Google applies to the result block */
      .rs-serp-row, .rs-serp-row *:not(.rs-mini-spinner) {
        direction: ltr !important;
        unicode-bidi: isolate !important;
        writing-mode: horizontal-tb !important;
        transform: none !important;
        -webkit-transform: none !important;
      }
      .rs-serp-row::-webkit-scrollbar { display: none !important; }
      .rs-serp-badge {
        display: inline-flex !important;
        align-items: center !important;
        gap: 3px !important;
        padding: 2px 6px !important;
        border-radius: 4px !important;
        border: 1px solid #e2e8f0 !important;
        background: #f8fafc !important;
        font-size: 10.5px !important;
        font-weight: 600 !important;
        cursor: default !important;
        white-space: nowrap !important;
        color: #475569 !important;
        line-height: 1.4 !important;
        text-decoration: none !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
        transform: none !important;
        -webkit-transform: none !important;
        writing-mode: horizontal-tb !important;
        text-orientation: mixed !important;
      }
      .rs-badge-label {
        font-size: 9px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: #94a3b8 !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
      }
      .rs-badge-val, .rs-age-val, .rs-pages-val {
        direction: ltr !important;
        unicode-bidi: isolate !important;
      }
      .rs-badge-val { font-weight: 800 !important; }
      .rs-da-high .rs-badge-val { color: #16a34a !important; }
      .rs-da-med  .rs-badge-val { color: #ca8a04 !important; }
      .rs-da-fair .rs-badge-val { color: #ea580c !important; }
      .rs-da-low  .rs-badge-val { color: #dc2626 !important; }
      .rs-da-na   .rs-badge-val { color: #94a3b8 !important; }
      .rs-spam-high .rs-badge-val { color: #dc2626 !important; }
      .rs-spam-med  .rs-badge-val { color: #ea580c !important; }
      .rs-spam-low  .rs-badge-val { color: #16a34a !important; }
      .rs-traffic-badge .rs-badge-label { color: #6366f1 !important; }
      .rs-traffic-badge .rs-badge-val   { color: #6366f1; font-weight: 600; }
      .rs-age-badge .rs-badge-label { color: #2563eb !important; }
      .rs-age-val { color: #2563eb; font-weight: 600; }
      .rs-pages-badge .rs-badge-label { color: #0d9488 !important; }
      .rs-dr-badge .rs-badge-label { color: #f97316 !important; }
      .rs-dr-badge { border-color: #fed7aa !important; background: #fff7ed !important; }
      .rs-pages-val { color: #0d9488 !important; font-weight: 700 !important; }
      .rs-words-badge .rs-badge-label { color: #9333ea !important; }
      .rs-words-val, .rs-badge-val.rs-words-val { direction: ltr !important; unicode-bidi: isolate !important; color: #9333ea !important; font-weight: 700 !important; }

      /* ── KWScanner-style green pills (main stats on site-name line) ── */
      .rs-kws-pill {
        display: inline-flex !important;
        align-items: center !important;
        gap: 3px !important;
        margin-left: 4px !important;
        padding: 1px 7px !important;
        border-radius: 4px !important;
        vertical-align: middle !important;
        white-space: nowrap !important;
        font-family: arial, sans-serif !important;
        font-size: 11px !important;
        line-height: 16px !important;
        font-weight: 400 !important;
        background: #0f766e !important;
        color: #ffffff !important;
        user-select: none !important;
        border: none !important;
        text-decoration: none !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
        transform: none !important;
        -webkit-transform: none !important;
        writing-mode: horizontal-tb !important;
        pointer-events: none !important;
      }
      .rs-kws-pill:first-of-type { margin-left: 6px !important; }
      .rs-kws-pill b {
        font-weight: 600 !important;
        font-variant-numeric: tabular-nums !important;
        color: #ffffff !important;
      }
      .rs-kws-pill span {
        color: #ffffff !important;
        font-weight: 400 !important;
      }

      .rs-serp-loading {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
        color: #94a3b8 !important;
        font-size: 10px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        margin: 3px 0 5px 0 !important;
      }
      @keyframes rs-spin { to { transform: rotate(360deg); } }
      .rs-mini-spinner {
        width: 10px !important; height: 10px !important;
        border: 1.5px solid #e2e8f0 !important;
        border-top-color: #6366f1 !important;
        border-radius: 50% !important;
        animation: rs-spin 0.7s linear infinite !important;
        flex-shrink: 0 !important;
      }
      .rs-ahrefs-row {
        display: flex !important;
        align-items: center !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        margin: 0 0 6px 0 !important;
        padding: 0 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        direction: ltr !important;
        unicode-bidi: isolate !important;
        transform: none !important;
        -webkit-transform: none !important;
        writing-mode: horizontal-tb !important;
      }
      .rs-ahrefs-row, .rs-ahrefs-row * {
        direction: ltr !important;
        unicode-bidi: isolate !important;
        writing-mode: horizontal-tb !important;
        transform: none !important;
        -webkit-transform: none !important;
      }
      .rs-ahrefs-group {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 4px 8px !important;
        background: #f8f9fa !important;
        border: 1px solid #e8eaed !important;
        border-radius: 6px !important;
      }
      .rs-ahrefs-label {
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #5f6368 !important;
        margin-right: 2px !important;
        white-space: nowrap !important;
      }
      .rs-ahrefs-btn {
        font-size: 12px !important;
        font-weight: 400 !important;
        text-decoration: none !important;
        cursor: pointer !important;
        padding: 2px 8px !important;
        border: 1px solid #dadce0 !important;
        border-radius: 4px !important;
        background: #fff !important;
        display: inline-block !important;
        line-height: normal !important;
        white-space: nowrap !important;
        transition: background-color 0.15s, box-shadow 0.15s !important;
      }
      .rs-ahrefs-btn:hover {
        background: #f8f9fa !important;
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3) !important;
      }
      .rs-ahrefs-btn-both     { color: #1a73e8 !important; font-weight: 500 !important; }
      .rs-ahrefs-btn-traffic  { color: #5f6368 !important; }
      .rs-ahrefs-btn-links    { color: #34a853 !important; }
      .rs-ahrefs-btn-age      { color: #b06000 !important; font-weight: 500 !important; }
      .rs-ahrefs-btn-dr       { color: #7362BF !important; font-weight: 600 !important; }
    `;
    document.head.appendChild(style);
  }

  // ─── SERP Info Panel CSS ───────────────────────────────────────────────────
  if (!document.getElementById('rs-serp-info-style')) {
    const s = document.createElement('style');
    s.id = 'rs-serp-info-style';
    s.textContent = `
      .rs-info-panel {
        margin: 4px 0 8px 0 !important;
        background: #eef4fb !important;
        border: 1px solid #d0e2f5 !important;
        border-radius: 6px !important;
        padding: 8px 12px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
        font-size: 11.5px !important;
        color: #1e293b !important;
        line-height: 1.5 !important;
        pointer-events: none !important;
        user-select: text !important;
      }
      /* Block ALL links/anchors inside the panel from being clickable */
      .rs-info-panel a,
      .rs-info-panel * {
        pointer-events: none !important;
      }
      /* Re-enable only JSON toggle link and URL value link */
      .rs-info-json-link,
      .rs-info-url-link {
        pointer-events: all !important;
      }
      .rs-info-note {
        font-size: 10.5px !important;
        color: #2563eb !important;
        margin-bottom: 6px !important;
        font-style: italic !important;
      }
      .rs-info-row {
        margin: 4px 0 !important;
        display: flex !important;
        gap: 6px !important;
        align-items: flex-start !important;
      }
      .rs-info-label {
        font-weight: 700 !important;
        color: #1e293b !important;
        min-width: 70px !important;
        flex-shrink: 0 !important;
      }
      .rs-info-val {
        color: #334155 !important;
        word-break: break-word !important;
      }
      .rs-info-json-link {
        color: #2563eb !important;
        cursor: pointer !important;
        text-decoration: underline !important;
        font-weight: 600 !important;
      }
      .rs-info-json-box {
        display: none !important;
        margin-top: 4px !important;
        background: #1e293b !important;
        color: #a5f3fc !important;
        border-radius: 4px !important;
        padding: 6px 8px !important;
        font-family: monospace !important;
        font-size: 10px !important;
        white-space: pre-wrap !important;
        word-break: break-all !important;
        max-height: 140px !important;
        overflow-y: auto !important;
      }
      .rs-info-json-box.open { display: block !important; }
      .rs-heading-tree {
        margin: 0 !important; padding: 0 !important; list-style: none !important;
        pointer-events: none !important;
      }
      .rs-heading-tree li {
        display: flex !important; align-items: flex-start !important; gap: 4px !important; margin: 1px 0 !important;
        pointer-events: none !important;
        user-select: text !important;
      }
      .rs-h-tag {
        font-size: 9px !important; font-weight: 700 !important; text-transform: uppercase !important;
        border-radius: 3px !important; padding: 0 4px !important; flex-shrink: 0 !important;
        line-height: 16px !important; height: 16px !important;
      }
      .rs-h1-tag { background:#0d9488 !important; color:#fff !important; }
      .rs-h2-tag { background:#2563eb !important; color:#fff !important; margin-left:12px !important; }
      .rs-h3-tag { background:#7c3aed !important; color:#fff !important; margin-left:24px !important; }
      .rs-h-text {
        font-size:11px !important;
        color:#334155 !important;
        line-height:1.4 !important;
        text-decoration:none !important;
        cursor:default !important;
        font-weight:normal !important;
        background:none !important;
        border:none !important;
        -webkit-text-fill-color:#334155 !important;
      }
      .rs-heading-tree li a,
      .rs-heading-tree a {
        color:#334155 !important;
        text-decoration:none !important;
        pointer-events:none !important;
        -webkit-text-fill-color:#334155 !important;
      }
      .rs-info-loading {
        display: flex !important; align-items: center !important; gap: 5px !important;
        color: #64748b !important; font-size: 10.5px !important; padding: 4px 0 !important;
      }
    `;
    document.head.appendChild(s);
  }

  // ─── SERP Info cache ───────────────────────────────────────────────────────
  const infoCache = {};

  const infoPending = {};
  function fetchPageInfo(url) {
    if (!url) return Promise.resolve(null);
    try {
      const h = new URL(url).hostname.toLowerCase();
      if (h.includes('chromewebstore.google') || h.includes('chrome.google.com') ||
          h.includes('accounts.google') || h.includes('play.google')) {
        return Promise.resolve(null);
      }
    } catch (_) { return Promise.resolve(null); }
    if (infoCache[url] != null) return Promise.resolve(infoCache[url]);
    if (infoPending[url]) return infoPending[url];

    infoPending[url] = new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 4;

      function attempt() {
        attempts++;
        const timer = setTimeout(() => {
          if (attempts < maxAttempts) setTimeout(attempt, 800 * attempts);
          else { delete infoPending[url]; resolve(null); }
        }, 12000);

        try {
          chrome.runtime.sendMessage({ action: 'SERP_PAGE_INFO', url }, (res) => {
            clearTimeout(timer);
            if (chrome.runtime.lastError || !res || !res.ok) {
              if (attempts < maxAttempts) { setTimeout(attempt, 1000 * attempts); return; }
              delete infoPending[url];
              resolve(null);
              return;
            }
            infoCache[url] = res;
            delete infoPending[url];
            resolve(res);
          });
        } catch (e) {
          clearTimeout(timer);
          if (attempts < maxAttempts) setTimeout(attempt, 1000 * attempts);
          else { delete infoPending[url]; resolve(null); }
        }
      }
      attempt();
    });
    return infoPending[url];
  }

  function buildInfoPanel(info, opts) {
    const parts = [];
    parts.push(`<div class="rs-info-note">Note: All data is fetched using server-side rendering (SSR).</div>`);

    if (opts.showUrl) {
      parts.push(`<div class="rs-info-row"><span class="rs-info-label">URL:</span><span class="rs-info-val"><a class="rs-info-url-link" href="${escHtml(info._url)}" target="_blank" style="color:#2563eb;text-decoration:underline;cursor:pointer;">${escHtml(info._url)}</a></span></div>`);
    }
    if (opts.showTitle && info.title) {
      parts.push(`<div class="rs-info-row"><span class="rs-info-label">Original Title:</span><span class="rs-info-val">${escHtml(info.title)}</span></div>`);
    }
    if (opts.showDescription && info.description) {
      parts.push(`<div class="rs-info-row"><span class="rs-info-label">Original Description:</span><span class="rs-info-val">${escHtml(info.description)}</span></div>`);
    }
    if (opts.showJsonLd && info.jsonLd && info.jsonLd.length > 0) {
      const jsonStr = JSON.stringify(info.jsonLd, null, 2);
      const pid = 'rs-json-' + Math.random().toString(36).slice(2);
      parts.push(`<div class="rs-info-row"><span class="rs-info-label">JSON LD Code:</span><span class="rs-info-val"><span class="rs-info-json-link" data-json-id="${pid}">Click to see <strong>JSON</strong></span><pre class="rs-info-json-box" id="${pid}">${escHtml(jsonStr)}</pre></span></div>`);
    }
    if (opts.showHeadings && info.headings && info.headings.length > 0) {
      const hItems = info.headings.map(h => {
        const cls = h.level === 'h1' ? 'rs-h1-tag' : h.level === 'h2' ? 'rs-h2-tag' : 'rs-h3-tag';
        return `<li><span class="rs-h-tag ${cls}">${h.level.toUpperCase()}</span><span class="rs-h-text">${escHtml(h.text)}</span></li>`;
      }).join('');
      parts.push(`<div class="rs-info-row"><span class="rs-info-label">Headings:</span><span class="rs-info-val"><ul class="rs-heading-tree">${hItems}</ul></span></div>`);
    }

    return parts.join('');
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Weak (low DA/DR) competitor highlight ─────────────────────────────────
  // A result is "weak" (easy to outrank) when DA or DR is under the threshold.
  const WEAK_DA = 20, WEAK_DR = 20;
  function applyWeakHighlight(el, da, dr) {
    if (!el) return;
    const daN = (da != null && da > 0) ? Math.round(da) : null;
    const drN = (dr != null && dr > 0) ? Math.round(dr) : null;
    const weak = (daN != null && daN < WEAK_DA) || (drN != null && drN < WEAK_DR);
    if (!weak) return;
    el.classList.add('rs-serp-anchor', 'rs-weak-result');
    let flag = el.querySelector(':scope > .rs-weak-flag');
    if (!flag) {
      flag = document.createElement('span');
      flag.className = 'rs-weak-flag';
      flag.setAttribute('dir', 'ltr');
      el.appendChild(flag);
    }
    flag.textContent = `⚡ DA ${daN != null ? daN : '?'} · DR ${drN != null ? drN : '?'} — Weak!`;
  }

  // ─── DA / DR cache ─────────────────────────────────────────────────────────
  const daCache = {};
  const drCache = {};
  const trafficCache = {};
  const ageCache = {};
  const pagesCache = {};       // domain -> number (success only)
  const pagesFailAt = {};      // domain -> timestamp of last hard fail (short cooldown)

  // ── Pages count via sitemap ────────────────────────────────────────────────
  const pagesPending = {};
  function rootDomainLocal(domain) {
    const d = String(domain || '').toLowerCase().replace(/^www\./, '').replace(/\/.*$/, '').trim();
    const parts = d.split('.').filter(Boolean);
    if (parts.length <= 2) return d;
    const lastTwo = parts.slice(-2).join('.');
    const twoLevel = new Set(['co.uk','com.pk','com.au','co.in','com.br','co.jp','com.mx','com.tr','com.sg']);
    if (twoLevel.has(lastTwo)) return parts.slice(-3).join('.');
    return parts.slice(-2).join('.');
  }

  function fetchPages(domain, opts) {
    const force = !!(opts && opts.force);
    const clean = domain.replace(/^www\./, '').toLowerCase().trim();
    if (!clean) return Promise.resolve(null);
    if (!force && pagesCache[clean] != null) return Promise.resolve(pagesCache[clean]);
    if (!force && pagesFailAt[clean] && (Date.now() - pagesFailAt[clean] < 45000)) {
      return Promise.resolve(null);
    }
    if (pagesPending[clean]) return pagesPending[clean];

    // Try host first, then registrable root (softonic.com vs sub.softonic.com)
    const hostsToTry = [clean];
    const root = rootDomainLocal(clean);
    if (root && root !== clean) hostsToTry.push(root);

    pagesPending[clean] = new Promise((resolve) => {
      const tryHost = (hostIdx, attempt) => {
        if (hostIdx >= hostsToTry.length) {
          pagesFailAt[clean] = Date.now();
          delete pagesPending[clean];
          resolve(null);
          return;
        }
        const host = hostsToTry[hostIdx];
        try {
          chrome.runtime.sendMessage({ action: 'FETCH_SITEMAP_PAGES', domain: host }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok || !(res.pages > 0)) {
              // retry same host a few times, then next host
              if (attempt < 2) {
                setTimeout(() => tryHost(hostIdx, attempt + 1), [2000, 5000][attempt] || 4000);
                return;
              }
              tryHost(hostIdx + 1, 0);
              return;
            }
            pagesCache[clean] = res.pages;
            if (host !== clean) pagesCache[host] = res.pages;
            delete pagesFailAt[clean];
            delete pagesPending[clean];
            resolve(res.pages);
          });
        } catch (e) {
          tryHost(hostIdx + 1, 0);
        }
      };
      tryHost(0, 0);
    });
    return pagesPending[clean];
  }

  const agePending = {};
  function formatDomainAgeLabel(createdDate) {
    const created = createdDate instanceof Date ? createdDate : new Date(createdDate);
    if (isNaN(created.getTime())) return null;
    const ms = Date.now() - created.getTime();
    if (ms < 0) return '0d';
    const days = Math.floor(ms / (24 * 3600 * 1000));
    const years = ms / (365.25 * 24 * 3600 * 1000);
    if (days < 30) return Math.max(0, days) + 'd';
    if (years < 1) return Math.max(1, Math.round(years * 12)) + 'm';
    const yWhole = Math.floor(years);
    const months = Math.round((years - yWhole) * 12);
    return yWhole + 'y' + (months > 0 ? ' ' + months + 'm' : '');
  }

  function fetchAge(domain) {
    const clean = domain.replace(/^www\./, '').toLowerCase().trim();
    if (!clean) return Promise.resolve(null);
    if (ageCache[clean] != null) return Promise.resolve(ageCache[clean]);
    if (agePending[clean]) return agePending[clean];
    agePending[clean] = new Promise((resolve) => {
      const tryFetch = (attempt) => {
        try {
          chrome.runtime.sendMessage({ action: 'RDAP_LOOKUP', domain: clean }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok || !res.createdDate) {
              if (attempt < 3) { setTimeout(() => tryFetch(attempt + 1), 1500 * (attempt + 1)); return; }
              delete agePending[clean];
              resolve(null);
              return;
            }
            const created = new Date(res.createdDate);
            const now = new Date();
            const ms = now - created;
            const yearsFloat = ms / (365.25 * 24 * 3600 * 1000);
            const years = Math.floor(yearsFloat);
            const months = Math.floor((ms % (365.25 * 24 * 3600 * 1000)) / (30.44 * 24 * 3600 * 1000));
            const days = Math.floor(ms / (24 * 3600 * 1000));
            const label = formatDomainAgeLabel(created);
            const val = { years, months, days, yearsFloat, label, createdDate: res.createdDate };
            ageCache[clean] = val;
            delete agePending[clean];
            resolve(val);
          });
        } catch (e) { delete agePending[clean]; resolve(null); }
      };
      tryFetch(0);
    });
    return agePending[clean];
  }

  // In-flight maps: parallel results for the same domain share one request.
  // Old code set cache=null while pending → 2nd result resolved null immediately.
  const daPending = {};
  const trafficPending = {};
  const drPending = {};

  function serpCountryCode() {
    try {
      const gl = new URLSearchParams(location.search).get('gl');
      if (gl && /^[a-z]{2}$/i.test(gl)) return gl.toLowerCase();
    } catch (_) {}
    return 'us';
  }

  function fetchTraffic(domain) {
    const clean = domain.replace(/^www\./, '').toLowerCase().trim();
    if (!clean) return Promise.resolve(null);
    if (trafficCache[clean] != null) return Promise.resolve(trafficCache[clean]);
    if (trafficPending[clean]) return trafficPending[clean];
    trafficPending[clean] = new Promise((resolve) => {
      const tryFetch = (attempt) => {
        try {
          chrome.runtime.sendMessage({ action: 'TRAFFIC_FETCH', domain: clean, country: serpCountryCode() }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok || res.visits == null) {
              if (attempt < 2) { setTimeout(() => tryFetch(attempt + 1), 1500 * (attempt + 1)); return; }
              delete trafficPending[clean];
              resolve(null);
              return;
            }
            trafficCache[clean] = res;
            delete trafficPending[clean];
            resolve(res);
          });
        } catch (e) { delete trafficPending[clean]; resolve(null); }
      };
      tryFetch(0);
    });
    return trafficPending[clean];
  }

  function fetchDA(domain) {
    const clean = domain.replace(/^www\./, '').toLowerCase().trim();
    if (!clean) return Promise.resolve(null);
    if (daCache[clean] != null) return Promise.resolve(daCache[clean]);
    if (daPending[clean]) return daPending[clean];
    daPending[clean] = new Promise((resolve) => {
      const tryFetch = (attempt) => {
        try {
          chrome.runtime.sendMessage({ action: 'MOZ_FETCH', domain: clean }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok) {
              if (attempt < 3) { setTimeout(() => tryFetch(attempt + 1), 1200 * (attempt + 1)); return; }
              delete daPending[clean];
              resolve(null);
              return;
            }
            daCache[clean] = res;
            delete daPending[clean];
            resolve(res);
          });
        } catch (e) { delete daPending[clean]; resolve(null); }
      };
      tryFetch(0);
    });
    return daPending[clean];
  }

  function fetchDR(domain) {
    const clean = domain.replace(/^www\./, '').toLowerCase().trim();
    if (!clean) return Promise.resolve(null);
    if (drCache[clean] != null) return Promise.resolve(drCache[clean]);
    if (drPending[clean]) return drPending[clean];
    if (Array.isArray(window.__rsDomainData)) {
      const entry = window.__rsDomainData.find(d => d && d.domain && d.domain.replace(/^www\./, '').toLowerCase() === clean);
      if (entry && typeof entry.dr === 'number') {
        const cached = { ok: true, domainRating: entry.dr };
        drCache[clean] = cached;
        return Promise.resolve(cached);
      }
    }
    drPending[clean] = new Promise((resolve) => {
      const tryFetch = (attempt) => {
        try {
          chrome.runtime.sendMessage({ action: 'AHREFS_DR_FETCH', domain: clean }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok || res.domainRating == null) {
              if (attempt < 3) { setTimeout(() => tryFetch(attempt + 1), 1800 * (attempt + 1)); return; }
              delete drPending[clean];
              resolve(null);
              return;
            }
            drCache[clean] = res;
            delete drPending[clean];
            resolve(res);
          });
        } catch (e) { delete drPending[clean]; resolve(null); }
      };
      tryFetch(0);
    });
    return drPending[clean];
  }

  function daColorClass(da) {
    if (!da || da <= 0) return 'rs-da-na';
    if (da >= 71) return 'rs-da-high';
    if (da >= 51) return 'rs-da-med';
    if (da >= 31) return 'rs-da-fair';
    return 'rs-da-low';
  }
  function drColorClass(dr) {
    if (dr == null || dr <= 0) return 'rs-da-na';
    if (dr >= 71) return 'rs-da-high';
    if (dr >= 51) return 'rs-da-med';
    if (dr >= 31) return 'rs-da-fair';
    return 'rs-da-low';
  }
  function spamColorClass(spam) {
    if (spam >= 8) return 'rs-spam-high';
    if (spam >= 4) return 'rs-spam-med';
    return 'rs-spam-low';
  }
  function fmtNum(n) {
    if (!n || n <= 0) return '--';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function buildStatsRow(moz, traffic, trBadgeId, age, ageBadgeId, pagesBadgeId, dr, wordsBadgeId) {
    const hasMoz = moz && (moz.domainAuthority > 0 || moz.spamScore != null || moz.backlinks > 0 || moz.pageAuthority > 0);
    if (!hasMoz) {
      return `<div class="rs-serp-row" dir="ltr"><span class="rs-serp-badge rs-da-na"><span class="rs-badge-label">DA</span><span class="rs-badge-val">N/A</span></span><span class="rs-serp-badge rs-age-badge" id="${ageBadgeId || ''}" title="Domain Age"><span class="rs-badge-label">AGE</span><span class="rs-badge-val rs-age-val">—</span></span><span class="rs-serp-badge rs-pages-badge" id="${pagesBadgeId || ''}" title="Total Pages (from sitemap)"><span class="rs-badge-label">PGS</span><span class="rs-badge-val rs-pages-val">—</span></span><span class="rs-serp-badge rs-words-badge" id="${wordsBadgeId || ''}" title="Content Word Count"><span class="rs-badge-label">WORDS</span><span class="rs-badge-val rs-words-val">—</span></span></div>`;
    }
    const da   = moz.domainAuthority || 0;
    const pa   = moz.pageAuthority   || 0;
    const spam = moz.spamScore       || 0;
    const bl   = moz.backlinks       || 0;
    const rd   = moz.referringDomains|| 0;

    // DR badge (Ahrefs Free)
    const drVal = (dr && dr.domainRating != null) ? Math.round(dr.domainRating) : null;
    const drBadge = drVal != null
      ? `<span class="rs-serp-badge rs-dr-badge ${drColorClass(drVal)}" title="Ahrefs Domain Rating (Free)"><span class="rs-badge-label">DR</span><span class="rs-badge-val">${drVal}</span></span>`
      : `<span class="rs-serp-badge rs-dr-badge rs-da-na" title="Ahrefs Domain Rating"><span class="rs-badge-label">DR</span><span class="rs-badge-val">…</span></span>`;

    // Traffic badge — show if available, else show placeholder to fill later
    let trVal  = '--';
    let trColor = '';
    let trTitle = 'Monthly traffic — waiting…';
    if (traffic && traffic.visits) {
      const v = traffic.visits;
      trVal = v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : String(v);
      if (traffic.visitsChangePercent != null) {
        trColor = traffic.visitsChangePercent >= 0 ? 'color:#16a34a;' : 'color:#dc2626;';
      }
      const src = traffic.source || 'Unknown';
      trTitle = 'Monthly traffic · Source: ' + src + (traffic.visitsChangePercent != null
        ? ' · Change: ' + (traffic.visitsChangePercent >= 0 ? '+' : '') + Math.round(traffic.visitsChangePercent) + '%'
        : '');
    }

    return `<div class="rs-serp-row" dir="ltr">
      <span class="rs-serp-badge ${daColorClass(da)}" title="Moz Domain Authority"><span class="rs-badge-label">DA</span><span class="rs-badge-val">${da || '--'}</span></span>
      <span class="rs-serp-badge" title="Moz Page Authority"><span class="rs-badge-label">PA</span><span class="rs-badge-val">${pa || '--'}</span></span>
      ${drBadge}
      <span class="rs-serp-badge ${spamColorClass(spam)}" title="Spam Score"><span class="rs-badge-label">SPAM</span><span class="rs-badge-val">${spam}%</span></span>
      <span class="rs-serp-badge" title="Backlinks"><span class="rs-badge-label">BL</span><span class="rs-badge-val">${fmtNum(bl)}</span></span>
      <span class="rs-serp-badge" title="Referring Domains"><span class="rs-badge-label">RD</span><span class="rs-badge-val">${fmtNum(rd)}</span></span>
      <span class="rs-serp-badge rs-traffic-badge" id="${trBadgeId || ''}" title="${trTitle.replace(/"/g, '&quot;')}" data-tr-source="${(traffic && traffic.source) ? String(traffic.source).replace(/"/g, '') : ''}"><span class="rs-badge-label">TR</span><span class="rs-badge-val" style="${trColor}">${trVal}</span></span>
      <span class="rs-serp-badge rs-age-badge" id="${ageBadgeId || ''}" title="Domain Age"><span class="rs-badge-label">AGE</span><span class="rs-badge-val rs-age-val">—</span></span>
      <span class="rs-serp-badge rs-pages-badge" id="${pagesBadgeId || ''}" title="Total Pages indexed in sitemap"><span class="rs-badge-label">PGS</span><span class="rs-badge-val rs-pages-val">—</span></span>
      <span class="rs-serp-badge rs-words-badge" id="${wordsBadgeId || ''}" title="Content Word Count"><span class="rs-badge-label">WORDS</span><span class="rs-badge-val rs-words-val">—</span></span>
    </div>`;
  }

  // ─── Ahrefs Quick-Check buttons (Page + Domain always) ──
  function buildAhrefsButtonsRow(pageUrl) {
    let rootDomain = '';
    let pageTarget = pageUrl || '';
    try {
      const u = new URL(pageUrl);
      rootDomain = u.protocol + '//' + u.hostname;
      pageTarget = pageUrl;
    } catch (e) {
      // domain-only fallback
      const host = String(pageUrl || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
      rootDomain = host ? ('https://' + host) : '';
      pageTarget = rootDomain;
    }

    const esc = s => String(s).replace(/"/g, '&quot;');
    if (!rootDomain && !pageTarget) return '';

    // Always show Page + Domain groups (homepage: Page still targets full URL / Domain targets host)
    let html = `<div class="rs-ahrefs-row" dir="ltr">
      <div class="rs-ahrefs-group">
        <span class="rs-ahrefs-label">Page:</span>
        <a href="#" class="rs-ahrefs-btn rs-ahrefs-btn-both" data-rs-mode="both" data-rs-url="${esc(pageTarget)}">Both</a>
        <a href="#" class="rs-ahrefs-btn rs-ahrefs-btn-traffic" data-rs-mode="traffic" data-rs-url="${esc(pageTarget)}">Traffic</a>
        <a href="#" class="rs-ahrefs-btn rs-ahrefs-btn-links" data-rs-mode="backlinks" data-rs-url="${esc(pageTarget)}">Links</a>
      </div>
      <div class="rs-ahrefs-group">
        <span class="rs-ahrefs-label">Domain:</span>
        <a href="#" class="rs-ahrefs-btn rs-ahrefs-btn-both" data-rs-mode="both" data-rs-url="${esc(rootDomain)}">Both</a>
        <a href="#" class="rs-ahrefs-btn rs-ahrefs-btn-traffic" data-rs-mode="traffic" data-rs-url="${esc(rootDomain)}">Traffic</a>
        <a href="#" class="rs-ahrefs-btn rs-ahrefs-btn-links" data-rs-mode="backlinks" data-rs-url="${esc(rootDomain)}">Links</a>
      </div>
    </div>`;
    return html;
  }

  // Event delegation for Ahrefs quick-check buttons (row is rebuilt/replaced often)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.rs-ahrefs-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const mode = btn.dataset.rsMode;
    const url = btn.dataset.rsUrl;
    if (!mode || !url) return;
    const original = btn.textContent;
    btn.style.backgroundColor = '#e8f0fe';
    setTimeout(() => { btn.style.backgroundColor = ''; }, 200);
    try {
      chrome.runtime.sendMessage({ action: 'AHREFS_OPEN_CHECK', mode, url }, () => {
        if (chrome.runtime.lastError) { /* ignore */ }
      });
    } catch (_) { /* extension context gone */ }
  }, true);

  // ─── KWScanner-style site-name target (for green DR/Age pills) ─────────────
  // Finds the short source/site-name line (e.g. .VuuXrf or the cite-adjacent
  // label) so we can append the compact green pills next to it — same position
  // KWScanner uses.
  function getSiteNameTarget(resultEl) {
    if (!resultEl) return null;
    // Standard organic: site name chip
    const vuu = resultEl.querySelector('.VuuXrf');
    if (vuu && vuu.textContent?.trim()) return vuu;
    // YouTube / video cards often use different chips
    const yt = resultEl.querySelector('.zLoP8b, .EyBRub, span[role="text"]');
    // Prefer cite-adjacent brand line
    const cite = resultEl.querySelector('cite');
    if (cite) {
      let o = cite.parentElement;
      while (o && o !== resultEl) {
        const prev = o.previousElementSibling;
        if (prev instanceof HTMLElement && prev.textContent?.trim() && !prev.querySelector('cite')) {
          return prev;
        }
        o = o.parentElement;
      }
      return cite.parentElement || cite;
    }
    // Fallback: first short text near title
    const h3 = resultEl.querySelector('h3');
    if (h3) {
      const row = h3.closest('div');
      if (row && row.parentElement) return row.parentElement;
    }
    return null;
  }

  function createKwsPill(label, value, title) {
    const e = document.createElement('span');
    e.className = 'rs-kws-pill';
    if (title) e.title = title;
    const lbl = document.createElement('span');
    lbl.textContent = label + ':';
    const b = document.createElement('b');
    b.textContent = value != null && value !== '' ? String(value) : '…';
    e.append(lbl, b);
    return e;
  }

  // ─── SERP rank history (previous position for same keyword) ───────────────
  function getSerpQuery() {
    try {
      const u = new URL(location.href);
      const q = u.searchParams.get('q') || u.searchParams.get('query') || '';
      return q.trim().toLowerCase().slice(0, 120);
    } catch (_) { return ''; }
  }

  function getSerpSnapKey(query) {
    // Include gl/hl so US vs PK snapshots don't collide
    let region = '';
    try {
      const u = new URL(location.href);
      region = (u.searchParams.get('gl') || '') + ':' + (u.searchParams.get('hl') || '');
    } catch (_) {}
    return 'rsSerpSnap:' + (query || '') + ':' + region;
  }

  // In-memory cache for this page load so every inject doesn't re-read storage
  let _prevSnap = null;       // { positions: {domain: pos}, ts }
  let _prevSnapLoaded = false;
  let _newPositions = {};     // domain -> current pos
  let _snapSaveTimer = null;

  function loadPrevSnap(query, cb) {
    if (_prevSnapLoaded) { cb(_prevSnap); return; }
    const key = getSerpSnapKey(query);
    try {
      chrome.storage.local.get([key], (res) => {
        _prevSnap = (res && res[key]) || null;
        _prevSnapLoaded = true;
        cb(_prevSnap);
      });
    } catch (_) {
      _prevSnapLoaded = true;
      cb(null);
    }
  }

  function scheduleSaveSnap(query) {
    clearTimeout(_snapSaveTimer);
    const save = () => {
      if (!query || Object.keys(_newPositions).length === 0) return;
      const key = getSerpSnapKey(query);
      const payload = { ts: Date.now(), positions: { ..._newPositions } };
      try { chrome.storage.local.set({ [key]: payload }); } catch (_) {}
    };
    // Save once positions settle (SERP can re-render)
    _snapSaveTimer = setTimeout(save, 800);
    setTimeout(save, 3500);
  }

  function applyRankChange(el, domain, curPos, prevSnap) {
    // Remove old indicator if any
    const old = el.querySelector('.rs-rank-change');
    if (old) old.remove();

    // No previous snapshot for this keyword → first scan; nothing to compare yet
    if (!domain || !prevSnap || !prevSnap.positions) return;

    const prevPos = prevSnap.positions[domain];
    const ind = document.createElement('span');
    if (prevPos == null || prevPos === 0) {
      ind.className = 'rs-rank-change new';
      ind.textContent = 'NEW';
      ind.title = 'New on this keyword (not in previous RankSEO SERP scan)';
      el.appendChild(ind);
      return;
    }

    const diff = prevPos - curPos; // + = improved (lower number)
    if (diff > 0) {
      ind.className = 'rs-rank-change up';
      ind.textContent = '▲' + diff;
      ind.title = 'Was #' + prevPos + ' → now #' + curPos + ' (up ' + diff + ' positions)';
    } else if (diff < 0) {
      ind.className = 'rs-rank-change down';
      ind.textContent = '▼' + (-diff);
      ind.title = 'Was #' + prevPos + ' → now #' + curPos + ' (down ' + (-diff) + ' positions)';
    } else {
      ind.className = 'rs-rank-change same';
      ind.textContent = '=';
      ind.title = 'Still #' + curPos + ' (no change since last scan)';
    }
    el.appendChild(ind);
  }

  // ─── Extract domain from result el ────────────────────────────────────────
  function hostFromHref(href) {
    if (!href || typeof href !== 'string') return null;
    try {
      let h = href.trim();
      // Google redirect: /url?q=https://example.com/...
      if (h.includes('/url?') || h.includes('google.') && h.includes('url?')) {
        const u0 = new URL(h, location.origin);
        const q = u0.searchParams.get('q') || u0.searchParams.get('url');
        if (q) h = q;
      }
      const u = new URL(h, location.origin);
      let host = (u.hostname || '').replace(/^www\./, '').toLowerCase();
      if (!host || host.includes('gstatic') || host.includes('googleusercontent')) return null;
      // Pure google.com search host → skip (unless Play / Maps / etc.)
      const isGoogleProp = /^(play|chromewebstore|docs|drive|maps|news|books|scholar)\.google\./.test(host)
        || host === 'youtube.com' || host.endsWith('.youtube.com')
        || host === 'blogger.com' || host.endsWith('.blogger.com');
      if ((/^(www\.)?google\.[a-z.]+$/.test(host) || host.startsWith('google.')) && !isGoogleProp) return null;
      return host;
    } catch (e) {
      return null;
    }
  }

  /** Unwrap Google /url?q=… and relative hrefs → absolute http(s) page URL for SSR fetch */
  function resolveResultUrl(href) {
    if (!href || typeof href !== 'string') return null;
    try {
      let h = href.trim();
      if (!h || h.startsWith('#') || h.startsWith('javascript:')) return null;
      // Absolute or relative against current origin
      let u;
      try { u = new URL(h, location.origin); } catch (_) { return null; }
      // Google redirect wrappers
      if (u.pathname === '/url' || u.pathname.endsWith('/url') || u.searchParams.has('q') || u.searchParams.has('url')) {
        if (u.hostname.includes('google.') || u.pathname.includes('/url')) {
          const q = u.searchParams.get('q') || u.searchParams.get('url');
          if (q && /^https?:/i.test(q)) {
            try { u = new URL(q); } catch (_) { /* keep u */ }
          }
        }
      }
      if (!/^https?:$/i.test(u.protocol)) return null;
      const host = (u.hostname || '').toLowerCase();
      if (!host || host.includes('gstatic') || host.includes('googleusercontent')) return null;
      if (/^(www\.)?google\.[a-z.]+$/.test(host) && !/^(play|docs|maps|news)\./.test(host)) return null;
      // Drop tracking params
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','gclid','si','ved','usg','sa','source'].forEach(p => u.searchParams.delete(p));
      return u.toString();
    } catch (_) {
      return null;
    }
  }

  function getDomain(el) {
    // 1) Visible site name (modern SERP): .VuuXrf
    const siteName = el.querySelector('.VuuXrf');
    if (siteName) {
      const t = (siteName.textContent || '').trim().toLowerCase().replace(/^www\./, '');
      if (t && t.includes('.') && !/\s/.test(t) && t.length < 80) return t;
    }
    // 2) Cite text — "example.com › path" or "https://example.com › …"
    const cite = el.querySelector('cite');
    if (cite) {
      let txt = (cite.textContent || '').trim().replace(/\u00a0/g, ' ');
      // strip protocol then take host-ish first token
      txt = txt.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
      const part = txt.split(/[›»>|\s\/]/)[0].trim().toLowerCase();
      if (part && part.includes('.') && !part.includes(' ') && part.length < 80) return part;
    }
    // 3) Title link href (handles /url?q= redirects)
    const titleA = el.querySelector('h3 a, a h3')?.closest('a') || el.querySelector('a[href^="http"]');
    if (titleA) {
      const host = hostFromHref(titleA.getAttribute('href') || titleA.href);
      if (host) return host;
    }
    // 4) Any external link
    const links = el.querySelectorAll('a[href]');
    for (const a of links) {
      const host = hostFromHref(a.getAttribute('href') || a.href);
      if (host) return host;
    }
    return null;
  }

  function setKwsPill(id, value, titleOpt) {
    const pill = document.getElementById(id);
    if (!pill) return;
    const b = pill.querySelector('b');
    if (b) b.textContent = value != null && value !== '' ? String(value) : '—';
    if (titleOpt != null && titleOpt !== '') pill.title = titleOpt;
  }

  function fmtTrafficPill(traffic) {
    if (traffic == null) return '—';
    let v = null;
    if (typeof traffic === 'number') v = traffic;
    else if (traffic && traffic.visits != null) v = traffic.visits;
    if (v == null || v < 0) return '—';
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return String(v);
  }

  function trafficSourceTitle(traffic) {
    if (!traffic || traffic.visits == null || traffic.visits <= 0) {
      return 'Monthly traffic — no data (tried Keywords Everywhere API → SimilarWeb → SEMrush)';
    }
    const src = traffic.source || 'Unknown';
    let t = 'Monthly traffic · Source: ' + src;
    if (traffic.visitsChangePercent != null) {
      t += ' · Change: ' + (traffic.visitsChangePercent >= 0 ? '+' : '') + Math.round(traffic.visitsChangePercent) + '%';
    }
    return t;
  }

  // ─── Google autocomplete / suggestion guard ───────────────────────────────
  // Never treat Google's search suggestions, recent-search rows, trending
  // suggestions, or the search input shell as organic SERP results. Older
  // versions scanned broad parts of #search/document and could inject our
  // result-number / DA / DR badges into the autocomplete dropdown.
  function isSuggestionNode(el) {
    if (!el || el.nodeType !== 1) return false;
    const bad = [
      '[role=option]', '[role=listbox]', '[aria-autocomplete=list]',
      '[role=combobox]', '#searchform', '.RNNXgb', '.a4bIc', '.gLFyf',
      '#aajZCb', '.aajZCb', '.sbct', '.sbl1', '.wM6W7d',
      '[jsname=erkvQe]', '[jsname=VlcLAe]', '[jsname=RZJ9jb]',
      '[id^=Alh6id]', '[class*="autocomplete"]', '[class*="suggest"]'
    ];
    try {
      if (el.matches(bad.join(',')) || el.closest(bad.join(','))) return true;
    } catch (_) {}

    // Google sometimes wraps the suggestion list in a shell identified only
    // by an aria label / searchbox relationship. These checks are intentionally
    // conservative so real organic result cards are not excluded.
    const role = (el.getAttribute('role') || '').toLowerCase();
    if (role === 'option' || role === 'listbox') return true;
    if (el.closest('[aria-label*="suggest" i], [aria-label*="recent search" i], [aria-label*="trending" i]')) return true;

    return false;
  }

  function isOrganicResultCandidate(el, root) {
    if (!el || isSuggestionNode(el)) return false;
    if (root && !root.contains(el)) return false;
    return true;
  }

  // ─── Find good results ─────────────────────────────────────────────────────
  function collectResults() {
    const seen = new WeakSet();
    const seenHrefs = new Set();
    const out = [];
    const rso = document.getElementById('rso') || document.querySelector('#search #rso');
    const resultsRoot = rso || document.getElementById('search');

    function isValidHref(href) {
      if (!href) return false;
      if (href.startsWith('/search') || href.startsWith('#')) return false;
      // Allow Google redirect wrappers (/url?q=…) — real destination checked via hostFromHref
      if (href.includes('/url?') || href.includes('url?q=') || href.includes('url?url=')) return true;
      if (href.includes('google.com/search')) return false;
      // Reject pure google.com / www.google.* but allow play/docs/maps/etc.
      try {
        const host = hostFromHref(href);
        if (host) return true;
      } catch (_) {}
      if (/^https?:\/\/(www\.)?google\.[a-z.]+(\/|$)/i.test(href) && !/play\.google|docs\.google|maps\.google|chromewebstore/i.test(href)) {
        return false;
      }
      return href.startsWith('http') || href.startsWith('/');
    }

    function addEl(el) {
      if (!isOrganicResultCandidate(el, resultsRoot)) return;
      if (seen.has(el)) return;
      // Skip if this node is nested inside an already-collected result (prevents #3+#4 on same card)
      for (const prev of out) {
        if (prev.contains(el) || el.contains(prev)) return;
      }
      const a = el.querySelector('h3')
        ? (el.querySelector('h3 a, a h3')?.closest('a') || el.querySelector('a[href^="http"]'))
        : el.querySelector('a[href^="http"]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!isValidHref(href)) return;
      // Normalize href for dedupe (unwrap /url?q=)
      let normHref = href;
      try {
        const h = hostFromHref(href);
        if (h) normHref = h + '|' + (el.querySelector('h3')?.textContent || '').trim().slice(0, 60).toLowerCase();
      } catch (_) {}
      if (seenHrefs.has(normHref) || seenHrefs.has(href)) return;
      seenHrefs.add(normHref);
      seenHrefs.add(href);
      seen.add(el);
      out.push(el);
    }

    // Strategy 0 — modern organic cards (2024+ Google)
    document.querySelectorAll('div.N54PNb, div.MjjYud').forEach(el => {
      if (el.parentElement?.closest('div.N54PNb, div.MjjYud, div.g')) return;
      if (!el.querySelector('h3')) return;
      if (el.closest('[aria-label="AI Overview"], [id="related-questions"], .related-question-pair, g-accordion-expander')) return;
      if ((el.textContent || '').includes('People also ask')) return;
      addEl(el);
    });

    // Strategy 1 — div.g (classic, works for standard results)
    document.querySelectorAll('div.g').forEach(el => {
      // Must not be nested inside another .g (sitelinks etc.)
      if (el.parentElement?.closest('div.g')) return;
      if (!el.querySelector('h3')) return;
      
      // Enhanced AI Overview exclusion — check multiple possible selectors
      // AI Overview can use various attributes and structures
      if (el.closest('[aria-label="AI Overview"]')) return;
      if (el.closest('[id="m-x-content"]')) return;
      if (el.closest('[jsname="zqMFFb"]')) return;
      if (el.closest('[data-attrid]')) return;
      if (el.closest('.kp-wholepage')) return;
      if (el.closest('[data-hveid][data-ved]')?.querySelector('[aria-label="AI Overview"]')) return;
      
      // Check if parent container has AI Overview indicators
      const parent = el.closest('div[data-hveid]');
      if (parent) {
        // Skip if parent contains AI Overview text or specific AI markers
        const parentText = parent.textContent || '';
        if (parentText.includes('AI Overview') || parentText.includes('Generative AI')) return;
        // Skip if parent has specific AI Overview classes or attributes
        if (parent.querySelector('[jsname="zqMFFb"]') || parent.querySelector('[data-attrid*="ai"]')) return;
      }
      
      // Skip div.g inside People Also Ask boxes (enhanced detection)
      if (el.closest('[id="related-questions"]')) return;
      if (el.closest('[jsname="yEVEwb"]')) return; // PAA container
      if (el.closest('[jscontroller="HsHBtd"]')) return; // PAA controller
      if (el.closest('[data-q]')) return; // PAA question attribute
      if (el.closest('.related-question-pair')) return; // PAA class
      if (el.closest('.kno-ftr')) return; // Knowledge panel footer (can contain PAA)
      if (el.closest('g-accordion-expander')) return; // PAA accordion
      if (el.closest('[role="heading"][aria-level]')?.closest('div[jsname]')) return; // PAA heading structure
      
      // Check if parent is a PAA container by looking for PAA indicators
      const parentContainer = el.closest('div[data-hveid]');
      if (parentContainer) {
        // Skip if contains "People also ask" text or PAA markers
        const containerText = parentContainer.textContent || '';
        if (containerText.includes('People also ask') || containerText.includes('People also search')) return;
        // Skip if has PAA-specific elements
        if (parentContainer.querySelector('[jsname="yEVEwb"]')) return;
        if (parentContainer.querySelector('.related-question-pair')) return;
        if (parentContainer.querySelector('g-accordion-expander')) return;
      }
      
      addEl(el);
    });

    // Strategy 2 — data-hveid containers (used in AI Overview + modern layouts)
    // Run ALWAYS (not only as fallback) to catch results below AI Overview
    if (resultsRoot) {
      resultsRoot.querySelectorAll('div[data-hveid]').forEach(el => {
        if (seen.has(el)) return;
        // Skip if a parent is already captured
        if (el.parentElement?.closest('[data-hveid]')) return;
        if (!el.querySelector('h3')) return;
        // Skip AI Overview blocks and knowledge panels (not organic results)
        if (el.closest('[data-attrid]') || el.closest('.kp-wholepage') || el.closest('[aria-label="AI Overview"]') || el.closest('[id="m-x-content"]') || el.closest('[jsname="zqMFFb"]')) return;
        // Skip People Also Ask boxes (enhanced detection)
        if (el.closest('[id="related-questions"]')) return;
        if (el.closest('[jsname="yEVEwb"]')) return;
        if (el.closest('.related-question-pair')) return;
        if (el.closest('[id="rso"] > div:has([data-q])')) return;
        
        // Check if element itself is a PAA container
        if (el.querySelector('[jsname="yEVEwb"]')) return;
        if (el.querySelector('.related-question-pair')) return;
        const elText = el.textContent || '';
        if (elText.includes('People also ask') || elText.includes('People also search')) return;
        addEl(el);
      });
    }

    // Strategy 3 — #rso direct children (modern layout, replaces old [jscontroller] approach)
    if (out.length < 3 && resultsRoot) {
      resultsRoot.querySelectorAll(':scope > div').forEach(el => {
        if (seen.has(el)) return;
        if (!el.querySelector('h3') || !el.querySelector('a[href]')) return;
        
        // Skip AI Overview containers
        if (el.querySelector('[aria-label="AI Overview"]')) return;
        if (el.querySelector('[jsname="zqMFFb"]')) return;
        if (el.querySelector('[data-attrid*="ai"]')) return;
        const elText = el.textContent || '';
        if (elText.includes('AI Overview') || elText.includes('Generative AI')) return;
        
        addEl(el);
      });
    }

    // Strategy 4 — any div with h3 + cite inside #search (last resort)
    if (out.length < 3 && resultsRoot) {
      resultsRoot.querySelectorAll('div:has(h3):has(cite)').forEach(el => {
          if (seen.has(el)) return;
          // Prefer innermost: skip if a child already qualifies
          if (el.querySelector('div:has(h3):has(cite)')) return;
          
          // Skip AI Overview elements
          if (el.closest('[aria-label="AI Overview"]')) return;
          if (el.closest('[jsname="zqMFFb"]')) return;
          if (el.closest('[data-attrid]')) return;
          
          // Skip People Also Ask elements
          if (el.closest('[id="related-questions"]')) return;
          if (el.closest('[jsname="yEVEwb"]')) return;
          if (el.closest('.related-question-pair')) return;
          if (el.closest('[data-q]')) return;
          
        addEl(el);
      });
    }

    return out;
  }

  // ─── Counter Google's anti-scrape obfuscation transforms ──────────────────
  // Google applies scaleX(-1), scaleY(-1), or both to some result sub-blocks
  // and pre-reverses its own text so humans read it normally. Our injected
  // badges inherit the transform and appear mirrored/flipped.
  // A child's `transform: none` CANNOT undo an ancestor's transform, so we
  // detect the flip and apply the inverse (double flip cancels out).
  // Tight threshold (≤ -0.9) avoids false positives from hover/3D animations.
  function neutralizeAncestorFlip(rowEl, stopAt) {
    if (!rowEl) return;
    let flipX = 1, flipY = 1;
    let node = rowEl.parentElement;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      const t = cs.transform;
      if (t && t !== 'none') {
        const m = t.match(/matrix(3d)?\(([^)]+)\)/);
        if (m) {
          const v = m[2].split(',').map(parseFloat);
          const a = v[0];
          const d = m[1] === '3d' ? v[5] : v[3];
          if (a <= -0.9) flipX = -flipX;
          if (d <= -0.9) flipY = -flipY;
        }
      }
      // Also check modern CSS `scale` property (separate from transform)
      const sc = cs.scale;
      if (sc && sc !== 'none') {
        const parts = sc.split(/\s+/).map(parseFloat);
        if (parts[0] <= -0.9) flipX = -flipX;
        if (parts.length > 1 && parts[1] <= -0.9) flipY = -flipY;
      }
      node = node.parentElement;
    }
    if (flipX === -1 || flipY === -1) {
      rowEl.style.setProperty('transform', `scaleX(${flipX}) scaleY(${flipY})`, 'important');
      rowEl.style.setProperty('transform-origin', 'center center', 'important');
    } else {
      rowEl.style.removeProperty('transform');
      rowEl.style.removeProperty('transform-origin');
    }
  }
  // Re-check after Google may apply late transforms (race guard)
  function scheduleFlipRecheck(rowEl) {
    requestAnimationFrame(() => neutralizeAncestorFlip(rowEl));
    setTimeout(() => neutralizeAncestorFlip(rowEl), 300);
  }

  // ─── Inject into one result ────────────────────────────────────────────────
  const statsInjected = new WeakSet();

  async function inject(el, idx, infoOpts) {
    if (isSuggestionNode(el)) return;
    const domain = getDomain(el);

    // 1. Number badge — absolutely positioned relative to the result container
    let badge = el.querySelector('.rs-serp-num');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'rs-serp-num';
      // Make the result container the positioning parent
      el.classList.add('rs-serp-anchor');
      // Insert badge as FIRST child of the result container (el)
      // position:absolute so it floats to the left of the result, unaffected by inner layouts
      el.insertBefore(badge, el.firstChild);
    }
    badge.textContent = String(idx + 1);
    neutralizeAncestorFlip(badge);
    scheduleFlipRecheck(badge);

    // Rank change vs previous SERP snapshot for this keyword
    const curPos = idx + 1;
    if (domain) {
      _newPositions[domain] = curPos;
      // Apply after snap is loaded (or immediately if already loaded)
      const apply = (snap) => applyRankChange(el, domain, curPos, snap);
      if (_prevSnapLoaded) apply(_prevSnap);
      else loadPrevSnap(getSerpQuery(), apply);
    }

    // 1b. KWScanner-style green pills on site-name line: DR, DA, Spam, Age, TR
    const kwsDrId   = 'rs-kws-dr-'   + idx;
    const kwsDaId   = 'rs-kws-da-'   + idx;
    const kwsSpamId = 'rs-kws-spam-' + idx;
    const kwsAgeId  = 'rs-kws-age-'  + idx;
    const kwsTrId   = 'rs-kws-tr-'   + idx;
    if (!el.querySelector('.rs-kws-pill')) {
      const siteTarget = getSiteNameTarget(el);
      if (siteTarget) {
        const pills = [
          createKwsPill('DR',   null, 'Ahrefs Domain Rating (0–100)'),
          createKwsPill('DA',   null, 'Moz Domain Authority'),
          createKwsPill('Spam', null, 'Moz Spam Score'),
          createKwsPill('Age',  null, 'Domain age (RDAP)'),
          createKwsPill('TR',   null, 'Monthly traffic · Source: Keywords Everywhere (if key) → SimilarWeb → SEMrush'),
        ];
        pills[0].id = kwsDrId;
        pills[1].id = kwsDaId;
        pills[2].id = kwsSpamId;
        pills[3].id = kwsAgeId;
        pills[4].id = kwsTrId;
        pills.forEach(p => {
          siteTarget.appendChild(p);
          neutralizeAncestorFlip(p);
        });
      }
    }

    // 2. Stats row — only inject once per element
    if (statsInjected.has(el)) return;
    statsInjected.add(el);

    // 2. Stats row — insert after the cite/domain line
    const statsId = 'rs-stats-' + idx;
    if (document.getElementById(statsId)) return;

    // ── Find insertion point: BETWEEN title and snippet ──────────────────────
    // Target position:  [URL/cite row] → [H3 title] → [STATS HERE] → [snippet]
    //
    // Strategy borrowed from Keywords Everywhere (a battle-tested Google SERP
    // extension): instead of walking up looking for a "top-level" ancestor or
    // anchoring directly off h3 (both proved unreliable across Google's many
    // result-card DOM variants), climb a FIXED number of levels from h3's
    // link wrapper — exactly 3 — and append our row as the LAST CHILD of that
    // block. Google's result-card nesting depth for the title block is
    // consistent (.g > div > div[title-wrapper] > a > h3), so a fixed climb +
    // append-as-last-child reliably lands right after the title block and
    // before the snippet, without any content-based heuristics that can
    // misfire (e.g. picking a snippet element that lives in an unexpected
    // container on some layouts).

    const h3 = el.querySelector('h3');
    // Snippet selectors — organic + video + rich results
    const realSnippet = el.querySelector(
      '.VwiC3b, [data-sncf="1"], [data-sncf="2"], .IsZvec, .aCOpRe, .ITZIwc, .yXK7lf, em'
    );
    // Prefer a real text snippet node (not a single <em> inside title)
    let snippetNode = el.querySelector('.VwiC3b, [data-sncf="1"], [data-sncf="2"], .IsZvec, .aCOpRe, .ITZIwc');
    if (snippetNode && h3 && h3.contains(snippetNode)) snippetNode = null;

    // Wrapper holds [stats row] then [ahrefs buttons row]
    const wrapperId = 'rs-wrap-' + statsId;
    const wrapper = document.createElement('div');
    wrapper.id = wrapperId;
    wrapper.className = 'rs-serp-wrapper';
    wrapper.setAttribute('dir', 'ltr');
    wrapper.style.cssText = [
      'display:block!important',
      'width:100%!important',
      'max-width:100%!important',
      'margin:6px 0 8px 0!important',
      'padding:0!important',
      'position:relative!important',
      'order:initial!important',
      'flex:none!important',
      'clear:both!important',
      'float:none!important',
      'grid-column:1/-1!important'
    ].join(';');

    const loading = document.createElement('div');
    loading.id = statsId;
    loading.className = 'rs-serp-loading';
    loading.setAttribute('dir', 'ltr');
    loading.innerHTML = `<div class="rs-mini-spinner"></div><span>Loading\u2026</span>`;
    wrapper.appendChild(loading);

    // ── Placement (2024–2026 Google SERP) ────────────────────────────────
    // Real DOM inside each result:
    //   div.yuRUbf
    //     a.zReHs
    //       h3          (title)
    //       div.ESMNde  (site name + cite)  ← CSS flex often shows THIS above h3
    //   …snippet…
    // Inserting after h3 puts stats BETWEEN title and site-name in the flex
    // order → stats appear ABOVE everything. Always insert AFTER .yuRUbf.
    function placeWrapper() {
      // 1) After entire title block (.yuRUbf) — correct for modern Google
      const yu = el.querySelector('.yuRUbf');
      if (yu && el.contains(yu)) {
        try {
          yu.insertAdjacentElement('afterend', wrapper);
          return true;
        } catch (e) {}
      }

      // 2) After title link <a> that wraps h3 + site line
      if (h3) {
        const link = h3.closest('a.zReHs, a') || h3.closest('a');
        if (link && el.contains(link)) {
          try {
            // Prefer parent of link if it's b8lM7 / title wrapper
            const block = link.closest('.b8lM7, .yuRUbf') || link;
            block.insertAdjacentElement('afterend', wrapper);
            return true;
          } catch (e) {}
        }
      }

      // 3) Before snippet
      if (snippetNode && el.contains(snippetNode)) {
        try {
          snippetNode.insertAdjacentElement('beforebegin', wrapper);
          return true;
        } catch (e) {}
      }

      // 4) After h3's outermost title wrapper (still prefer after, not inside a)
      if (h3) {
        try {
          const after = h3.closest('.yuRUbf, .b8lM7') || h3.closest('a') || h3;
          after.insertAdjacentElement('afterend', wrapper);
          return true;
        } catch (e) {}
      }

      el.appendChild(wrapper);
      return true;
    }

    placeWrapper();

    // Safety: if wrapper is still inside .yuRUbf / before site name visually, move after .yuRUbf
    (function fixIfInsideTitleBlock() {
      const yu = el.querySelector('.yuRUbf');
      if (yu && yu.contains(wrapper)) {
        try { yu.insertAdjacentElement('afterend', wrapper); } catch (e) {}
        return;
      }
      const site = el.querySelector('.VuuXrf, cite');
      const title = h3;
      const beforeSite = site && (wrapper.compareDocumentPosition(site) & Node.DOCUMENT_POSITION_FOLLOWING);
      const beforeTitle = title && (wrapper.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (beforeSite || beforeTitle) {
        const anchor = yu || (title && title.closest('a')) || site;
        if (anchor && el.contains(anchor)) {
          try { anchor.insertAdjacentElement('afterend', wrapper); } catch (e) {}
        }
      }
    })();

    neutralizeAncestorFlip(wrapper);
    scheduleFlipRecheck(wrapper);

    if (!domain) {
      // No domain extracted — clear loading dots on green pills
      setKwsPill(kwsDrId, '—');
      setKwsPill(kwsDaId, '—');
      setKwsPill(kwsSpamId, '—');
      setKwsPill(kwsAgeId, '—');
      setKwsPill(kwsTrId, '—');
    }

    if (domain) {
      const trBadgeId    = 'rs-tr-'  + statsId;
      const ageBadgeId   = 'rs-age-' + statsId;
      const pagesBadgeId = 'rs-pg-'  + statsId;
      const wordsBadgeId = 'rs-wc-'  + statsId;

      // DA + Traffic — fast, render immediately
      const [moz, traffic] = await Promise.all([fetchDA(domain), fetchTraffic(domain)]);
      const placeholder = document.getElementById(statsId);
      if (placeholder) {
        // Parse the stats row HTML and replace the loading placeholder in-place
        const tmp = document.createElement('div');
        tmp.innerHTML = buildStatsRow(moz, traffic, trBadgeId, null, ageBadgeId, pagesBadgeId, null, wordsBadgeId);
        const rowEl = tmp.firstElementChild || tmp;
        rowEl.id = statsId;
        placeholder.replaceWith(rowEl);
        neutralizeAncestorFlip(rowEl);
        scheduleFlipRecheck(rowEl);

        // Ahrefs quick-check buttons (Page:/Domain: Both/Traffic/Links)
        // Google often uses /url?q=https://… — must unwrap before startsWith('http') check
        const ahrefsRowId = 'rs-ahrefs-' + statsId;
        const wrapperEl = document.getElementById(wrapperId);
        if (wrapperEl && !document.getElementById(ahrefsRowId)) {
          const linkA = el.querySelector('h3 a, a h3')?.closest('a')
            || el.querySelector('a[href^="http"]')
            || el.querySelector('a[href*="/url?"]')
            || el.querySelector('a[href^="/url"]');
          const rawHref = linkA ? (linkA.getAttribute('href') || linkA.href || '').trim() : '';
          let resultUrl = (typeof resolveResultUrl === 'function' ? resolveResultUrl(rawHref) : null)
            || (rawHref.startsWith('http') ? rawHref : null);
          // Fallback: domain-only root so Domain: buttons still appear
          if (!resultUrl && domain) {
            resultUrl = 'https://' + String(domain).replace(/^www\./, '');
          }
          if (resultUrl && /^https?:/i.test(resultUrl)) {
            const ahTmp = document.createElement('div');
            ahTmp.innerHTML = buildAhrefsButtonsRow(resultUrl);
            const ahRowEl = ahTmp.firstElementChild || ahTmp;
            ahRowEl.id = ahrefsRowId;
            wrapperEl.appendChild(ahRowEl);
            neutralizeAncestorFlip(ahRowEl);
            scheduleFlipRecheck(ahRowEl);
          }
        }
      }
      // Highlight weak competitors as soon as DA is known (DR may arrive later).
      applyWeakHighlight(el, moz && moz.domainAuthority, null);

      // Update KWScanner-style green pills for DA / Spam / TR (never leave "…")
      if (moz && moz.domainAuthority != null && moz.domainAuthority !== '') {
        setKwsPill(kwsDaId, moz.domainAuthority);
      } else {
        setKwsPill(kwsDaId, '—');
      }
      if (moz && moz.spamScore != null) {
        setKwsPill(kwsSpamId, moz.spamScore + '%');
      } else {
        setKwsPill(kwsSpamId, '—');
      }
      setKwsPill(kwsTrId, fmtTrafficPill(traffic), trafficSourceTitle(traffic));
      // Keep stats-row TR title in sync with real source
      if (traffic && traffic.source) {
        const trBadge = document.getElementById(trBadgeId);
        if (trBadge) {
          trBadge.title = trafficSourceTitle(traffic);
          trBadge.setAttribute('data-tr-source', traffic.source);
        }
      }

      // DR — async Ahrefs call, update DR badge when ready (one retry on miss)
      const updateDR = (dr) => {
        if (!dr || dr.domainRating == null) return false;
        const drRound = Math.round(dr.domainRating);
        // Update detailed DR badge in stats row
        const rowEl = document.getElementById(statsId);
        if (rowEl) {
          const drBadges = rowEl.querySelectorAll('.rs-dr-badge');
          if (drBadges.length) {
            const drBadge = drBadges[0];
            drBadge.className = 'rs-serp-badge rs-dr-badge ' + drColorClass(drRound);
            const val = drBadge.querySelector('.rs-badge-val');
            if (val) val.textContent = drRound;
          }
        }
        // Update KWScanner-style green DR pill on site-name line
        setKwsPill(kwsDrId, drRound);
        // Re-evaluate weakness now that DR is known (and refresh the flag text).
        applyWeakHighlight(el, moz && moz.domainAuthority, drRound);
        return true;
      };
      fetchDR(domain).then(dr => {
        if (updateDR(dr)) return;
        // Retry — sidebar may still be loading its DR data; poll at 2s, 5s, 9s
        const retryDelays = [2000, 5000, 9000];
        let attempt = 0;
        const retry = () => {
          if (attempt >= retryDelays.length) {
            // Final: stop showing "…" — mark as unavailable
            setKwsPill(kwsDrId, '—');
            return;
          }
          setTimeout(() => {
            // Clear the drCache entry so fetchDR re-checks __rsDomainData
            const clean = domain.replace(/^www\./, '').toLowerCase().trim();
            delete drCache[clean];
            fetchDR(domain).then(dr2 => {
              if (!updateDR(dr2)) { attempt++; retry(); }
            });
          }, retryDelays[attempt++]);
        };
        retry();
      });

      // Age — RDAP can be slow, inject separately when ready (retry a few times on miss)
      const updateAge = (age) => {
        if (!age) return false;
        const ageText = age.label || (age.years > 0
          ? age.years + 'y' + (age.months > 0 ? ' ' + age.months + 'm' : '')
          : (age.days != null && age.days < 30 ? age.days + 'd' : age.months + 'm'));
        // Update detailed AGE badge in stats row
        const badge = document.getElementById(ageBadgeId);
        if (badge) {
          const val = badge.querySelector('.rs-age-val');
          if (val) val.textContent = ageText;
        }
        // Update KWScanner-style green Age pill on site-name line
        setKwsPill(kwsAgeId, ageText);
        return true;
      };
      fetchAge(domain).then(age => {
        if (updateAge(age)) return;
        const retryDelays = [1500, 4000, 8000];
        let attempt = 0;
        const retry = () => {
          if (attempt >= retryDelays.length) {
            setKwsPill(kwsAgeId, '—');
            return;
          }
          setTimeout(() => {
            const clean = domain.replace(/^www\./, '').toLowerCase().trim();
            delete ageCache[clean];
            fetchAge(domain).then(age2 => {
              if (!updateAge(age2)) { attempt++; retry(); }
            });
          }, retryDelays[attempt++]);
        };
        retry();
      });

      // Pages — sitemap fetch with retries + delayed re-try if still empty
      const applyPages = (pages) => {
        const pgBadge = document.getElementById(pagesBadgeId);
        if (!pgBadge) return false;
        const val = pgBadge.querySelector('.rs-pages-val');
        if (!pages || pages <= 0) {
          if (val) val.textContent = '—';
          pgBadge.title = 'Pages in sitemap — not found (no public sitemap / blocked). Retried automatically.';
          return false;
        }
        const pagesText = pages >= 1000000
          ? (pages / 1000000).toFixed(1) + 'M'
          : pages >= 1000
          ? (pages / 1000).toFixed(1) + 'K'
          : String(pages);
        if (val) val.textContent = '~' + pagesText;
        pgBadge.title = 'Approx. URLs in public sitemap: ' + pages.toLocaleString();
        return true;
      };
      fetchPages(domain).then(pages => {
        if (applyPages(pages)) return;
        // Extra delayed force-retries (large sites / slow robots.txt)
        [5000, 14000, 28000].forEach((ms) => {
          setTimeout(() => {
            const clean = domain.replace(/^www\./, '').toLowerCase().trim();
            delete pagesPending[clean];
            // Allow retry even after fail cooldown
            delete pagesFailAt[clean];
            fetchPages(domain, { force: true }).then(applyPages);
          }, ms);
        });
      });

      // WORDS badge — SSR fetch (unwrap Google /url?q= redirects first)
      {
        const wcA = el.querySelector('h3 a, a h3')?.closest('a')
          || el.querySelector('a[href^="http"]')
          || el.querySelector('a[href*="/url?"]')
          || el.querySelector('a[href^="/url"]');
        const rawHref = wcA ? (wcA.getAttribute('href') || wcA.href || '').trim() : '';
        const wcUrl = resolveResultUrl(rawHref) || (rawHref.startsWith('http') ? rawHref : null);
        const applyWords = (info) => {
          if (!info || !info.ok) return false;
          const wc = Number(info.wordCount) || 0;
          if (wc < 30) return false; // noise / empty shell
          const badge = document.getElementById(wordsBadgeId);
          if (!badge) return false;
          const wcText = wc >= 1000 ? (wc / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(wc);
          const val = badge.querySelector('.rs-words-val');
          if (val) {
            val.textContent = wcText;
            badge.title = 'Content ~' + wc.toLocaleString() + ' words (SSR)';
          }
          return true;
        };
        if (wcUrl) {
          // Stagger slightly so 10 parallel SERP fetches don't hammer at once
          const delay = (idx % 5) * 350;
          setTimeout(() => {
            fetchPageInfo(wcUrl).then(info => {
              if (applyWords(info)) return;
              [5000, 12000, 22000].forEach((ms) => {
                setTimeout(() => {
                  delete infoCache[wcUrl];
                  delete infoPending[wcUrl];
                  fetchPageInfo(wcUrl).then(applyWords);
                }, ms);
              });
            });
          }, delay);
        }
      }

      // TR late refresh — if traffic pill still empty, retry a few times
      {
        const applyTr = (traffic) => {
          if (!traffic || traffic.visits == null) return false;
          setKwsPill(kwsTrId, fmtTrafficPill(traffic), trafficSourceTitle(traffic));
          const trEl = document.getElementById(trBadgeId);
          if (trEl && traffic.visits > 0) {
            const valEl = trEl.querySelector('.rs-badge-val');
            if (valEl) valEl.textContent = fmtTrafficPill(traffic);
            trEl.title = trafficSourceTitle(traffic);
            if (traffic.source) trEl.setAttribute('data-tr-source', traffic.source);
          }
          return true;
        };
        // Initial traffic already applied above; schedule follow-ups if dash
        const trNow = document.getElementById(kwsTrId);
        if (trNow && (trNow.textContent === '—' || trNow.textContent === '…' || trNow.textContent === '...')) {
          [2500, 6000, 12000].forEach((ms) => {
            setTimeout(() => {
              const clean = domain.replace(/^www\./, '').toLowerCase().trim();
              delete trafficCache[clean];
              delete trafficPending[clean];
              fetchTraffic(domain).then(applyTr);
            }, ms);
          });
        }
      }

      // SERP Info Panel — SSR fetch: title, description, JSON-LD, headings
      if (infoOpts) {
        const a = el.querySelector('h3 a, a h3')?.closest('a')
          || el.querySelector('a[href^="http"]')
          || el.querySelector('a[href*="/url?"]')
          || el.querySelector('a[href^="/url"]');
        const rawPage = a ? (a.getAttribute('href') || a.href || '').trim() : '';
        const pageUrl = resolveResultUrl(rawPage) || (rawPage.startsWith('http') ? rawPage : '');
        if (pageUrl && pageUrl.startsWith('http')) {
          const infoPanelId = 'rs-info-panel-' + idx;
          if (!document.getElementById(infoPanelId)) {
            // Info panel goes at the bottom of the result (after snippet)
            const infoPanelParent = realSnippet ? realSnippet.parentElement : el;
            const loadingDiv = document.createElement('div');
            loadingDiv.id = infoPanelId;
            loadingDiv.className = 'rs-info-loading';
            loadingDiv.innerHTML = `<div class="rs-mini-spinner"></div><span>Fetching page info…</span>`;
            infoPanelParent.appendChild(loadingDiv);

            fetchPageInfo(pageUrl).then(info => {
              const placeholder = document.getElementById(infoPanelId);
              if (!placeholder) return;
              if (!info) { placeholder.remove(); return; }
              info._url = pageUrl;
              const panel = document.createElement('div');
              panel.id = infoPanelId;
              panel.className = 'rs-info-panel';
              panel.innerHTML = buildInfoPanel(info, infoOpts);
              placeholder.replaceWith(panel);

              // Block ALL clicks on panel from bubbling to Google result links
              panel.addEventListener('click', (e) => {
                const isUrlLink  = e.target.closest('.rs-info-url-link');
                const isJsonLink = e.target.closest('.rs-info-json-link');
                if (!isUrlLink && !isJsonLink) {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }
              }, true); // capture phase — fires before Google's handlers

              // JSON-LD toggle
              panel.querySelectorAll('.rs-info-json-link').forEach(link => {
                link.addEventListener('click', () => {
                  const box = document.getElementById(link.dataset.jsonId);
                  if (box) box.classList.toggle('open');
                });
              });
            });
          }
        }
      }
    } else {
      const wrapperEl = document.getElementById(wrapperId);
      if (wrapperEl) { wrapperEl.remove(); }
      else {
        const placeholder = document.getElementById(statsId);
        if (placeholder) placeholder.remove();
      }
    }
  }

  // ─── Main run ──────────────────────────────────────────────────────────────
  function run() {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.log('[RS SERP] Extension context invalidated - skipping');
      return;
    }

    // Skip Images/Videos/News/Forums/etc. — standard web results only.
    if (!isWebResultsPage()) return;
    
    chrome.storage.local.get(['toolbarEnabled', 'serpInfoEnabled', 'serpInfoUrl', 'serpInfoTitle', 'serpInfoDescription', 'serpInfoJsonLd', 'serpInfoHeadings'], (prefs) => {
      // Handle extension context invalidation
      if (chrome.runtime.lastError) {
        console.log('[RS SERP] Storage access failed:', chrome.runtime.lastError.message);
        return;
      }
      
      if (prefs.toolbarEnabled === false) return;
      const results = collectResults();
      console.log('[RS SERP] Found', results.length, 'results on', location.href);

      // SERP Info panel options (default all OFF)
      const infoEnabled = prefs.serpInfoEnabled === true;
      const infoOpts = {
        showUrl:         prefs.serpInfoUrl         === true,
        showTitle:       prefs.serpInfoTitle        === true,
        showDescription: prefs.serpInfoDescription  === true,
        showJsonLd:      prefs.serpInfoJsonLd       === true,
        showHeadings:    prefs.serpInfoHeadings     === true,
      };
      const anyInfoEnabled = infoEnabled && Object.values(infoOpts).some(Boolean);

      const query = getSerpQuery();
      // Reset positions for this run; load previous snapshot once, then inject
      _newPositions = {};
      loadPrevSnap(query, () => {
        // Prefetch DA + TR for all result domains in parallel (fills caches before per-row inject)
        const domains = [...new Set(results.map(el => getDomain(el)).filter(Boolean))];
        if (domains.length) {
          try {
            chrome.runtime.sendMessage({ action: 'MOZ_FETCH_BATCH', domains }, (res) => {
              void chrome.runtime.lastError;
              if (res && res.ok && res.results) {
                Object.entries(res.results).forEach(([dom, row]) => {
                  if (row && row.ok) daCache[dom] = row;
                });
              }
            });
            chrome.runtime.sendMessage({
              action: 'TRAFFIC_BATCH',
              domains,
              country: serpCountryCode()
            }, (res) => {
              void chrome.runtime.lastError;
              if (res && res.ok && res.results) {
                Object.entries(res.results).forEach(([dom, row]) => {
                  if (row && row.ok && row.visits != null) trafficCache[dom] = row;
                });
              }
            });
          } catch (_) {}
        }
        results
          .filter(el => !isSuggestionNode(el) && (!rso || rso.contains(el)))
          .forEach((el, i) => inject(el, i, anyInfoEnabled ? infoOpts : null));
        // Persist current positions after injects (debounced)
        scheduleSaveSnap(query);
      });
    });
  }

  let debounce = null;
  function schedule(ms) { clearTimeout(debounce); debounce = setTimeout(run, ms); }

  // Initial run — try multiple times with increasing delays
  // AI Overview pages load organic results AFTER AI block, so we need patience
  schedule(1000);
  setTimeout(run, 2500);
  setTimeout(run, 4500);  // Extra retry for AI Overview pages

  // Watch for DOM + SPA navigation
  // Throttle MutationObserver to avoid excessive calls on AI Overview pages
  let lastHref = location.href;
  let lastMutationTime = 0;
  new MutationObserver(() => {
    const now = Date.now();
    if (location.href !== lastHref) {
      lastHref = location.href;
      window.__rankseoSerpLoaded = false;
      // New keyword / region → clear rank-history cache so we load the right snapshot
      _prevSnap = null;
      _prevSnapLoaded = false;
      _newPositions = {};
      schedule(1000);
    } else if (now - lastMutationTime > 600) {
      // Throttle: only re-run if 600ms have passed since last mutation fire
      lastMutationTime = now;
      schedule(600);
    }
  }).observe(document.body, { childList: true, subtree: true });

})();