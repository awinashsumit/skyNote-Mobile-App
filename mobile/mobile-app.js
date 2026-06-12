/* ============================================================
   skyNote mobile — shell injector + helpers.
   <body data-mpage="home" data-mtitle="..." [data-mback="x.html"]>
     <div class="m-app"><div class="m-content"> ...content... </div></div>
   Injects status bar + app bar (top) and tab bar + sheets.
   ============================================================ */
(function () {
  function icon(name, size, variant) {
    var e = (window.ICONS || {})[name]; if (!e) return '';
    size = size || 24; var inner = (variant === 'f' && e.f) ? e.f : e.r;
    return '<svg viewBox="0 0 ' + e.s + ' ' + e.s + '" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true">' + inner + '</svg>';
  }
  window.micon = icon;

  // 5 bottom tabs with a center amber Record button
  var NAV = [
    { id: 'home',          label: 'Home',         icon: 'Home',          href: 'home.html' },
    { id: 'conversations', label: 'Conversation', icon: 'Chat Multiple', href: 'conversations.html' },
    { id: 'record',        label: 'Record',       icon: 'Mic',           href: 'live.html', fab: true },
    { id: 'calendar',      label: 'Calendar',     icon: 'Calendar Ltr',  href: 'calendar.html' },
    { id: 'skyagent',      label: 'skyAgent',     icon: 'Sparkle',       href: 'skyagent.html' }
  ];

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('skynote-theme', t); } catch (e) {}
    var b = document.querySelector('[data-theme-toggle]');
    if (b) b.innerHTML = icon(t === 'dark' ? 'Weather Sunny' : 'Weather Moon', 20);
  }
  function initTheme() { var t = 'light'; try { t = localStorage.getItem('skynote-theme') || 'light'; } catch (e) {} applyTheme(t); }
  window.mToggleTheme = function () { applyTheme((document.documentElement.getAttribute('data-theme') || 'light') === 'dark' ? 'light' : 'dark'); };

  function statusBar() {
    return '<div class="m-status"><span>9:41</span><span class="ms-icons">' + icon('Data Bar Vertical', 15) + '<span class="ms-bat"></span></span></div>';
  }

  function appBar() {
    var back = document.body.getAttribute('data-mback');
    var title = document.body.getAttribute('data-mtitle') || '';
    var plus = '<button class="m-capture" data-capture aria-label="Capture a meeting">' + icon('Add', 22) + '</button>';
    if (back) {
      return '<header class="m-appbar"><a class="m-iconbtn" href="' + back + '" aria-label="Back">' + icon('Chevron Left', 22) + '</a>' +
        '<span class="m-title">' + title + '</span><span class="m-spacer"></span>' + plus + '</header>';
    }
    return '<header class="m-appbar">' +
      '<button class="m-iconbtn" data-account aria-label="Menu">' + icon('Line Horizontal 3', 24) + '</button>' +
      (title ? '<span class="m-title" style="margin-left:var(--space-xs);">' + title + '</span>' : '') +
      '<span class="m-spacer"></span>' +
      '<button class="m-iconbtn" aria-label="Search">' + icon('Search', 22) + '</button>' +
      plus +
      '</header>';
  }

  function tabBar(active) {
    return '<nav class="m-tabbar">' + NAV.map(function (n) {
      if (n.fab) {
        return '<a class="m-fab-wrap" href="' + n.href + '" aria-label="' + n.label + '">' +
          '<span class="m-fab">' + icon(n.icon, 26) + '</span>' +
          '<span class="m-fab-label">' + n.label + '</span></a>';
      }
      var on = n.id === active;
      return '<a class="m-tab' + (on ? ' is-active' : '') + '" href="' + n.href + '">' +
        '<span class="m-tab-ic">' + icon(n.icon, 24) + '</span><span>' + n.label + '</span></a>';
    }).join('') + '</nav>';
  }

  function captureSheet() {
    return '<div class="m-sheet-ov" id="captureSheet" hidden><div class="m-sheet" role="dialog" aria-label="Capture a meeting">' +
      '<div class="m-sheet-handle"></div>' +
      '<div class="m-sheet-head"><span class="m-sheet-title">Capture a meeting</span><button class="m-iconbtn" data-close>' + icon('Dismiss', 20) + '</button></div>' +
      '<div class="m-seg seg"><button class="seg-btn is-active" data-mode="bot">' + icon('Bot', 18) + 'Send bot</button><button class="seg-btn" data-mode="upload">' + icon('Arrow Upload', 18) + 'Upload</button><button class="seg-btn" data-mode="record">' + icon('Mic', 18) + 'Record</button></div>' +
      '<div class="seg-panel" data-panel="bot" style="margin-top:var(--space-m);"><div class="field"><label class="field-label">Meeting URL</label><input class="input" placeholder="https://zoom.us/j/..." /></div><div class="field" style="margin-top:var(--space-m);"><label class="field-label">Title (optional)</label><input class="input" placeholder="Q2 customer review" /></div></div>' +
      '<div class="seg-panel" data-panel="upload" hidden style="margin-top:var(--space-m);"><button class="btn btn-secondary" style="width:100%;justify-content:center;">' + icon('Arrow Upload', 18) + ' Choose a file</button><p class="field-hint" style="margin-top:var(--space-s);">MP3, M4A, WAV, MP4, or MOV up to 500 MB.</p></div>' +
      '<div class="seg-panel" data-panel="record" hidden style="margin-top:var(--space-m);"><div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-m);padding:var(--space-l) 0;"><button style="width:72px;height:72px;border-radius:50%;border:0;background:var(--accent);color:var(--fg-on-accent);display:inline-flex;align-items:center;justify-content:center;">' + icon('Mic', 28) + '</button><p class="field-hint">Tap to start recording.</p></div></div>' +
      '<a class="btn btn-primary" href="live.html" style="width:100%;justify-content:center;margin-top:var(--space-l);">Capture</a>' +
      '</div></div>';
  }

  function accountSheet() {
    function ext(label) { return '<a class="acct-link" href="#">' + label + icon('Open', 18) + '</a>'; }
    return '<div class="m-sheet-ov" id="accountSheet" hidden><div class="m-sheet" role="dialog" aria-label="Account">' +
      '<div class="m-sheet-handle"></div>' +
      '<div class="acct-head"><span class="avatar" style="width:48px;height:48px;font-size:var(--fs-400);">SA</span><div><div class="acct-name">Sumit Awinash</div><div class="acct-mail">sumit.awinash@skypointcloud.com</div><a class="link" href="settings.html">View profile</a></div></div>' +
      '<hr class="divider" />' +
      '<div class="field"><label class="field-label">Tenant</label><span class="dropdown" style="width:100%;">Skypoint Production <span class="dropdown-chevron">' + icon('Chevron Down', 20) + '</span></span></div>' +
      '<div class="field" style="margin-top:var(--space-m);"><label class="field-label">Instance</label><span class="dropdown" style="width:100%;">Production <span class="dropdown-chevron">' + icon('Chevron Down', 20) + '</span></span></div>' +
      '<div class="row between" style="margin-top:var(--space-m);"><div class="row" style="gap:var(--space-s);"><span style="font-size:var(--fs-100);font-weight:var(--weight-semibold);letter-spacing:.06em;text-transform:uppercase;color:var(--fg-tertiary);">Role</span><span class="badge">Skypoint Admin</span></div><button class="m-iconbtn" data-theme-toggle aria-label="Toggle theme" onclick="mToggleTheme()"></button></div>' +
      '<hr class="divider" />' +
      ext('Documentation') + ext('Privacy Portal') + ext('Terms of Use') +
      '<a class="acct-link" href="#">Help + Support</a>' +
      '<button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:var(--space-l);">' + icon('Open', 18) + ' Logout</button>' +
      '<div class="acct-ver">Version 1.0.0</div>' +
      '</div></div>';
  }

  function hydrate(root) {
    root.querySelectorAll('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.getAttribute('data-icon'), parseInt(el.getAttribute('data-size'), 10) || 22, el.getAttribute('data-variant') || 'r'); });
  }
  window.mhydrate = hydrate;

  function openSheet(id) { var s = document.getElementById(id); if (s) s.hidden = false; }
  window.mOpenSheet = openSheet;
  function wirePills() {
    document.querySelectorAll('.m-pill[data-mtab]').forEach(function (p) {
      p.addEventListener('click', function () {
        p.parentElement.querySelectorAll('.m-pill[data-mtab]').forEach(function (x) { x.classList.remove('is-active'); });
        p.classList.add('is-active');
        var id = p.getAttribute('data-mtab');
        document.querySelectorAll('[data-mpanel]').forEach(function (panel) { panel.hidden = panel.getAttribute('data-mpanel') !== id; });
      });
    });
  }
  function wireSheets() {
    document.querySelectorAll('[data-capture]').forEach(function (b) { b.addEventListener('click', function () { openSheet('captureSheet'); }); });
    document.querySelectorAll('[data-account]').forEach(function (b) { b.addEventListener('click', function () { openSheet('accountSheet'); }); });
    document.querySelectorAll('[data-sheet]').forEach(function (b) { b.addEventListener('click', function () { openSheet(b.getAttribute('data-sheet')); }); });
    document.querySelectorAll('.m-sheet-ov').forEach(function (ov) {
      ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-close]')) ov.hidden = true; });
      ov.querySelectorAll('.seg-btn').forEach(function (sb) {
        sb.addEventListener('click', function () {
          ov.querySelectorAll('.seg-btn').forEach(function (x) { x.classList.remove('is-active'); });
          sb.classList.add('is-active');
          var m = sb.getAttribute('data-mode');
          ov.querySelectorAll('.seg-panel').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== m; });
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var app = document.querySelector('.m-app'); if (!app) return;
    var active = document.body.getAttribute('data-mpage') || '';
    app.insertAdjacentHTML('afterbegin', statusBar() + appBar());
    app.insertAdjacentHTML('beforeend', tabBar(active));
    document.body.insertAdjacentHTML('beforeend', captureSheet() + accountSheet());
    initTheme();
    hydrate(document);
    wireSheets();
    wirePills();
  });
})();
