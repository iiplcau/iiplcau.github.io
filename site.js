/* IIPL website scripts. Content lives in publications.json, news.json and people.json. */
(function () {
  'use strict';

  var PI_NAME = /(YoungBin Kim|Youngbin Kim|Young Bin Kim|Young-Bin Kim)/;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === 'text') node.textContent = value;
        else if (key === 'className') node.className = value;
        else node.setAttribute(key, value === true ? '' : value);
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function load(file) {
    return fetch(file, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error(file + ' (' + res.status + ')');
      return res.json();
    }).catch(function (err) {
      console.error('Could not load ' + file, err);
      return { error: file };
    });
  }

  function loadError(container, file) {
    if (!container) return;
    container.textContent = '';
    container.appendChild(el('p', { className: 'sub', text: 'Could not load ' + file + '. Please check the file for a formatting error.' }));
  }

  function norm(name) {
    return String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  }

  function authorList(authors) {
    return String(authors || '').split(/,\s*|\s+and\s+/).map(function (a) { return a.trim(); }).filter(Boolean);
  }

  function maxYear(pubs) {
    return pubs.reduce(function (m, p) { return Math.max(m, Number(p.year) || 0); }, 0);
  }

  function shortTitle(title) {
    var t = String(title || '');
    var i = t.indexOf(':');
    if (i > 0 && i <= 60) return t.slice(0, i);
    return t.length > 64 ? t.slice(0, 61).replace(/\s+\S*$/, '') + '...' : t;
  }

  function venueLabel(p) {
    var tags = p.tags || [];
    var label = p.badge || '';
    if (tags.indexOf('Findings') !== -1) label += ' Findings';
    if (tags.indexOf('Oral') !== -1) label += ', Oral';
    return label;
  }

  /* ---------- Home ---------- */
  function initHome() {
    Promise.all([load('publications.json'), load('news.json'), load('people.json')]).then(function (res) {
      var pubs = res[0], news = res[1], people = res[2];

      if (Array.isArray(pubs)) {
        var statPubs = document.getElementById('stat-pubs');
        if (statPubs) statPubs.textContent = String(pubs.length);
        renderVenueChips(pubs);
      }
      if (Array.isArray(people)) {
        var total = people.reduce(function (n, g) { return n + (g.members || []).length; }, 0);
        var statMembers = document.getElementById('stat-members');
        if (statMembers) statMembers.textContent = String(total);
      }
      if (Array.isArray(news)) renderNews(news);
      else loadError(document.getElementById('news-list'), 'news.json');
    });
  }

  function renderVenueChips(pubs) {
    var box = document.getElementById('venue-chips');
    if (!box) return;
    var since = maxYear(pubs) - 1;
    var counts = [];
    var index = {};
    pubs.forEach(function (p) {
      if (p.type !== 'conference' || Number(p.year) < since || !p.badge) return;
      if (!(p.badge in index)) { index[p.badge] = counts.length; counts.push({ badge: p.badge, n: 0, order: counts.length }); }
      counts[index[p.badge]].n += 1;
    });
    counts.sort(function (a, b) { return b.n - a.n || a.order - b.order; });
    box.textContent = '';
    counts.forEach(function (c) {
      box.appendChild(el('span', { className: 'vchip' }, [c.badge, ' ', el('span', { className: 'n', text: String(c.n) })]));
    });
  }

  function renderNews(news) {
    var list = document.getElementById('news-list');
    var toggle = document.getElementById('news-toggle');
    if (!list) return;
    var kinds = { Paper: 'kind-paper', Award: 'kind-award', Grant: 'kind-grant', Service: 'kind-service' };
    var LIMIT = 6;
    var open = false;

    function draw() {
      list.textContent = '';
      (open ? news : news.slice(0, LIMIT)).forEach(function (n) {
        list.appendChild(el('li', { className: 'news-item' }, [
          el('span', { className: 'kind ' + (kinds[n.kind] || 'kind-service'), text: n.kind || 'News' }),
          el('span', { className: 'news-year', text: n.year || '' }),
          el('p', { className: 'news-text', text: n.text || '' })
        ]));
      });
      if (toggle) {
        toggle.hidden = news.length <= LIMIT;
        toggle.textContent = open ? 'Show fewer' : 'Show all ' + news.length + ' updates';
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }

    if (toggle) toggle.addEventListener('click', function () { open = !open; draw(); });
    draw();
  }

  /* ---------- People ---------- */
  function initPeople() {
    Promise.all([load('people.json'), load('publications.json')]).then(function (res) {
      var people = res[0], pubs = Array.isArray(res[1]) ? res[1] : [];
      var box = document.getElementById('people-groups');
      if (!Array.isArray(people)) { loadError(box, 'people.json'); return; }

      var summary = document.getElementById('people-summary');
      if (summary) {
        var parts = people.filter(function (g) { return (g.members || []).length; }).map(function (g) {
          var label = String(g.group || '').split(' ').map(function (w) { return w.indexOf('.') !== -1 ? w : w.toLowerCase(); }).join(' ');
          return g.members.length + ' ' + label;
        });
        var text = parts.length > 1 ? parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1] : parts.join('');
        summary.textContent = text + ', advised by Prof. YoungBin Kim.';
      }

      var recentFrom = maxYear(pubs) - 3;
      var recentPubs = pubs.filter(function (p) { return Number(p.year) >= recentFrom; });
      function recentFor(name) {
        var key = norm(name);
        if (!key) return null;
        var first = null, any = null;
        recentPubs.forEach(function (p) {
          var names = authorList(p.authors).map(norm);
          if (names.indexOf(key) === -1) return;
          if (!any) any = p;
          if (!first && names[0] === key) first = p;
        });
        return first || any;
      }

      box.textContent = '';
      people.forEach(function (g, gi) {
        var headId = 'group-' + gi;
        var grid = el('div', { className: 'people' });
        (g.members || []).forEach(function (m) {
          var avatar = el('div', { className: 'avatar', 'aria-hidden': 'true' });
          if (m.photo) {
            avatar.appendChild(el('img', { src: m.photo, alt: '' }));
          } else {
            avatar.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C879B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
          }
          var info = el('div', { className: 'pinfo' }, [el('p', { className: 'pname', lang: 'ko', text: m.ko || '' })]);
          if (m.en) {
            info.appendChild(m.homepage
              ? el('p', { className: 'pen' }, [el('a', { href: m.homepage, text: m.en })])
              : el('p', { className: 'pen', text: m.en }));
          }
          var paper = recentFor(m.en);
          if (paper) {
            info.appendChild(el('p', { className: 'prec' }, [
              el('span', { className: 'plabel', text: 'Recent' }),
              shortTitle(paper.title) + ' (' + venueLabel(paper) + ')'
            ]));
          }
          grid.appendChild(el('article', { className: 'person' }, [avatar, info]));
        });
        box.appendChild(el('section', { className: 'group', 'aria-labelledby': headId }, [
          el('div', { className: 'wrap' }, [
            el('div', { className: 'group-head' }, [
              el('h2', { id: headId, text: g.group || '' }),
              el('span', { className: 'cnt', text: String((g.members || []).length) })
            ]),
            grid
          ])
        ]));
      });
    });
  }

  /* ---------- Publications ---------- */
  function initPublications() {
    load('publications.json').then(function (pubs) {
      var groupsBox = document.getElementById('pub-groups');
      if (!Array.isArray(pubs)) { loadError(groupsBox, 'publications.json'); return; }

      var top = maxYear(pubs);
      var cutoff = top - 4;
      var minYear = pubs.reduce(function (m, p) { return Math.min(m, Number(p.year) || m); }, top);
      pubs.forEach(function (p) {
        p._search = [p.title, p.authors, p.venue, p.badge, (p.tags || []).join(' ')].join(' ').toLowerCase();
      });

      var summary = document.getElementById('pub-summary');
      if (summary) summary.textContent = pubs.length + ' papers since ' + minYear + ', newest first. Search, or filter by type and year.';

      var params = new URLSearchParams(location.search);
      var state = {
        q: params.get('q') || '',
        type: params.get('type') || 'all',
        year: params.get('year') || 'all',
        showOld: false
      };

      var search = document.getElementById('pub-search');
      var typeBox = document.getElementById('type-chips');
      var yearBox = document.getElementById('year-chips');
      var resultLine = document.getElementById('result-line');
      var emptyBox = document.getElementById('pub-empty');
      var moreBox = document.getElementById('pub-more');
      var moreText = document.getElementById('pub-more-text');

      search.value = state.q;

      var typeDefs = [['all', 'All'], ['conference', 'Conference'], ['journal', 'Journal'], ['workshop', 'Workshop']];
      var yearDefs = [['all', 'All years']];
      for (var y = top; y >= cutoff; y--) {
        if (pubs.some(function (p) { return Number(p.year) === y; })) yearDefs.push([String(y), String(y)]);
      }
      if (pubs.some(function (p) { return Number(p.year) < cutoff; })) yearDefs.push(['earlier', (cutoff - 1) + ' and earlier']);

      function countYear(key) {
        if (key === 'all') return pubs.length;
        if (key === 'earlier') return pubs.filter(function (p) { return Number(p.year) < cutoff; }).length;
        return pubs.filter(function (p) { return String(p.year) === key; }).length;
      }
      function countType(key) {
        return key === 'all' ? pubs.length : pubs.filter(function (p) { return p.type === key; }).length;
      }

      var chipButtons = [];
      function chips(box, defs, field, counter) {
        box.textContent = '';
        defs.forEach(function (d) {
          var btn = el('button', { type: 'button', className: 'chip', 'aria-pressed': 'false' }, [
            d[1], el('span', { className: 'n', text: String(counter(d[0])) })
          ]);
          btn.addEventListener('click', function () {
            state[field] = d[0];
            state.showOld = false;
            update();
          });
          chipButtons.push({ btn: btn, field: field, key: d[0] });
          box.appendChild(btn);
        });
      }
      chips(typeBox, typeDefs, 'type', countType);
      chips(yearBox, yearDefs, 'year', countYear);

      function authorsNode(authors) {
        var p = el('p', { className: 'pa' });
        String(authors || '').split(PI_NAME).forEach(function (part, i) {
          if (!part) return;
          p.appendChild(i % 2 === 1 ? el('strong', { text: part }) : document.createTextNode(part));
        });
        return p;
      }

      function pubNode(p) {
        var meta = el('div', { className: 'pm' }, [el('span', { className: 'vbadge ' + (p.type || 'conference'), text: p.badge || '' })]);
        (p.tags || []).forEach(function (t) {
          meta.appendChild(el('span', { className: (t === 'Oral' || t === 'Spotlight') ? 'tag hot' : 'tag', text: t }));
        });
        meta.appendChild(el('span', { className: 'pv', text: p.venue || '' }));
        (p.links || []).forEach(function (l) {
          if (l && l.url) meta.appendChild(el('a', { className: 'plink', href: l.url, text: l.label || 'Link' }));
        });
        return el('li', { className: 'pub' }, [el('h3', { className: 'pt', text: p.title || '' }), authorsNode(p.authors), meta]);
      }

      function syncUrl() {
        var next = new URLSearchParams();
        if (state.q) next.set('q', state.q);
        if (state.type !== 'all') next.set('type', state.type);
        if (state.year !== 'all') next.set('year', state.year);
        var qs = next.toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
      }

      function update() {
        var q = state.q.trim().toLowerCase();
        var list = pubs.filter(function (p) {
          if (state.type !== 'all' && p.type !== state.type) return false;
          if (state.year === 'earlier' && !(Number(p.year) < cutoff)) return false;
          if (state.year !== 'all' && state.year !== 'earlier' && String(p.year) !== state.year) return false;
          if (q && p._search.indexOf(q) === -1) return false;
          return true;
        });
        var collapse = state.year === 'all' && !q && !state.showOld;
        var shown = collapse ? list.filter(function (p) { return Number(p.year) >= cutoff; }) : list;
        var hidden = list.length - shown.length;

        chipButtons.forEach(function (c) {
          c.btn.setAttribute('aria-pressed', state[c.field] === c.key ? 'true' : 'false');
        });

        groupsBox.textContent = '';
        var current = null, ol = null;
        shown.forEach(function (p) {
          if (current !== p.year) {
            current = p.year;
            var count = shown.filter(function (x) { return x.year === current; }).length;
            ol = el('ol', { className: 'plist' });
            groupsBox.appendChild(el('div', { className: 'ygroup' }, [
              el('div', { className: 'ylab' }, [el('h2', { text: String(current) }), el('span', { text: count + (count === 1 ? ' paper' : ' papers') })]),
              ol
            ]));
          }
          ol.appendChild(pubNode(p));
        });

        resultLine.textContent = 'Showing ' + shown.length + ' of ' + pubs.length + ' papers';
        emptyBox.hidden = list.length !== 0;
        moreBox.hidden = hidden === 0;
        if (hidden) moreText.textContent = hidden + ' earlier papers from ' + minYear + ' to ' + (cutoff - 1) + ' are folded away.';
        syncUrl();
      }

      search.addEventListener('input', function () { state.q = search.value; update(); });
      document.getElementById('pub-reset').addEventListener('click', function () {
        state = { q: '', type: 'all', year: 'all', showOld: false };
        search.value = '';
        update();
      });
      document.getElementById('pub-more-btn').addEventListener('click', function () { state.showOld = true; update(); });
      update();
    });
  }

  var page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  else if (page === 'people') initPeople();
  else if (page === 'publications') initPublications();
})();
