'use strict';

/* English-only store finder for english.html.
   Search and detail state use URL fragments so one substantial, indexable English guide can
   provide the full finder without generating hundreds of thin translated URLs. */
(function () {
  var PREF_EN = {
    '北海道': 'Hokkaido', '青森県': 'Aomori', '岩手県': 'Iwate', '宮城県': 'Miyagi',
    '秋田県': 'Akita', '山形県': 'Yamagata', '福島県': 'Fukushima', '茨城県': 'Ibaraki',
    '栃木県': 'Tochigi', '群馬県': 'Gunma', '埼玉県': 'Saitama', '千葉県': 'Chiba',
    '東京都': 'Tokyo', '神奈川県': 'Kanagawa', '新潟県': 'Niigata', '富山県': 'Toyama',
    '石川県': 'Ishikawa', '福井県': 'Fukui', '山梨県': 'Yamanashi', '長野県': 'Nagano',
    '岐阜県': 'Gifu', '静岡県': 'Shizuoka', '愛知県': 'Aichi', '三重県': 'Mie',
    '滋賀県': 'Shiga', '京都府': 'Kyoto', '大阪府': 'Osaka', '兵庫県': 'Hyogo',
    '奈良県': 'Nara', '和歌山県': 'Wakayama', '鳥取県': 'Tottori', '島根県': 'Shimane',
    '岡山県': 'Okayama', '広島県': 'Hiroshima', '山口県': 'Yamaguchi', '徳島県': 'Tokushima',
    '香川県': 'Kagawa', '愛媛県': 'Ehime', '高知県': 'Kochi', '福岡県': 'Fukuoka',
    '佐賀県': 'Saga', '長崎県': 'Nagasaki', '熊本県': 'Kumamoto', '大分県': 'Oita',
    '宮崎県': 'Miyazaki', '鹿児島県': 'Kagoshima', '沖縄県': 'Okinawa'
  };

  var BRAND_EN = {
    'ガチャガチャの森': 'Gacha Gacha no Mori',
    'ガシャポンのデパート': 'Gashapon Department Store',
    'ガシャポンバンダイオフィシャルショップ': 'GASHAPON BANDAI Official Shop',
    '#C-pla（シープラ）': '#C-pla',
    '#C-pla': '#C-pla',
    'カプセル楽局': 'Capsule Rakkyoku',
    'ドリームカプセル': 'Dream Capsule',
    'gashacoco': 'gashacoco',
    'TOYS SPOT PALO': 'TOYS SPOT PALO',
    'Pon!': 'Pon!'
  };

  /* English aliases are search aids, not translated official branch names. */
  var LOCATION_ALIASES = [
    ['tokyo station', ['東京駅', '丸の内', '八重洲']], ['tokyo', ['東京都']],
    ['shinjuku', ['新宿']], ['shibuya', ['渋谷']], ['ikebukuro', ['池袋']],
    ['akihabara', ['秋葉原', '外神田']], ['harajuku', ['原宿', '神宮前']],
    ['ueno', ['上野']], ['asakusa', ['浅草']], ['ginza', ['銀座']],
    ['odaiba', ['お台場', '台場', '青海', '有明']], ['roppongi', ['六本木']],
    ['nakano', ['中野']], ['kichijoji', ['吉祥寺']], ['machida', ['町田']],
    ['tachikawa', ['立川']], ['hachioji', ['八王子']], ['kinshicho', ['錦糸町']],
    ['jiyugaoka', ['自由が丘']], ['ogikubo', ['荻窪']], ['kitasenju', ['北千住']],
    ['yokohama', ['横浜']], ['kawasaki', ['川崎']], ['kamakura', ['鎌倉']],
    ['chiba', ['千葉県', '千葉市']], ['saitama', ['埼玉県', 'さいたま市']],
    ['osaka', ['大阪府', '大阪市']], ['umeda', ['梅田', '大阪駅']],
    ['namba', ['難波', 'なんば']], ['shinsaibashi', ['心斎橋']], ['tennoji', ['天王寺']],
    ['kyobashi', ['京橋']], ['shin osaka', ['新大阪']],
    ['kyoto', ['京都府', '京都市']], ['kobe', ['神戸']], ['sannomiya', ['三宮']],
    ['nagoya', ['名古屋']], ['sakae', ['栄']], ['osu', ['大須']],
    ['fukuoka', ['福岡県', '福岡市']], ['hakata', ['博多']], ['tenjin', ['天神']],
    ['sapporo', ['札幌']], ['sendai', ['仙台']], ['hiroshima', ['広島']],
    ['okayama', ['岡山']], ['kagoshima', ['鹿児島']], ['naha', ['那覇']],
    ['airport', ['空港']], ['station', ['駅']]
  ];

  var GENERIC_SEARCH = 'gachapon gashapon gacha capsule toy capsule toys capsuletoy store stores shop shops japan';
  var FEATURED_SIZE = 8;
  var PAGE_SIZE = 24;
  var todayJst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  var ALL = (window.GH_SPOTS || []).filter(function (store) {
    return Boolean(store && store.sourceUrl && store.verifiedAt) &&
      !(store.closedAfter && store.closedAfter < todayJst);
  });
  var visible = PAGE_SIZE;
  var currentRows = [];
  var currentQuery = '';
  var currentOrigin = null;

  var form = document.getElementById('enStoreSearch');
  var input = document.getElementById('enStoreQuery');
  var results = document.getElementById('enStoreResults');
  var detail = document.getElementById('enStoreDetail');
  var status = document.getElementById('enStoreStatus');
  var more = document.getElementById('enStoreMore');
  var nearby = document.getElementById('enNearMe');
  var locationHelp = document.getElementById('enLocationHelp');
  if (!form || !input || !results || !detail || !status || !more) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function norm(value) {
    var text = String(value == null ? '' : value);
    try { text = text.normalize('NFKC'); } catch (error) { /* Older browser fallback. */ }
    return text.toLowerCase().replace(/[#\-‐‑–—−]/g, '').replace(/\s+/g, ' ').trim();
  }

  function brandEnglish(store) {
    var brand = String(store.brand || '');
    return BRAND_EN[brand] || brand;
  }

  function englishAliasText(store) {
    var japanese = [store.name, store.brand, store.pref, store.area, store.address, store.access].join(' ');
    return LOCATION_ALIASES.filter(function (entry) {
      return entry[1].some(function (token) { return japanese.indexOf(token) !== -1; });
    }).map(function (entry) { return entry[0]; }).join(' ');
  }

  function searchableText(store) {
    return norm([
      store.name, store.brand, brandEnglish(store), store.pref, PREF_EN[store.pref],
      store.area, store.address, store.access, englishAliasText(store), GENERIC_SEARCH
    ].join(' '));
  }

  function matches(store, query) {
    var terms = norm(query).split(' ').filter(Boolean);
    if (!terms.length) return true;
    var haystack = searchableText(store);
    var flat = haystack.replace(/\s/g, '');
    return terms.every(function (term) {
      return haystack.indexOf(term) !== -1 || flat.indexOf(term.replace(/\s/g, '')) !== -1;
    });
  }

  function isPreOpen(store) {
    return Boolean(store.opensOn && store.opensOn > todayJst);
  }

  function areaEnglish(store) {
    var aliases = englishAliasText(store).split(' ').filter(Boolean);
    var pref = PREF_EN[store.pref] || store.pref || 'Japan';
    var neighborhood = aliases.find(function (name) {
      return name !== norm(pref) && name !== 'tokyo' && name !== 'osaka' && name !== 'kyoto';
    });
    return neighborhood ? pref + ' · ' + titleCase(neighborhood) : pref;
  }

  function titleCase(text) {
    return String(text || '').replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function machineText(store) {
    return store.machines == null || store.machines === ''
      ? 'Not published'
      : Number(store.machines).toLocaleString('en-US') + ' (published scale figure)';
  }

  function hoursEnglish(value) {
    if (!value) return 'Not published';
    return String(value)
      .replace(/〜/g, '–').replace(/平日/g, 'Weekdays').replace(/土日祝/g, 'Weekends & holidays')
      .replace(/土日/g, 'Weekends').replace(/祝日/g, 'holidays').replace(/年中無休/g, 'Open daily')
      .replace(/不定休/g, 'Irregular closures').replace(/施設に準ずる/g, 'Follows facility hours')
      .replace(/営業時間/g, 'Hours');
  }

  function distanceKm(a, b) {
    var r = Math.PI / 180;
    var earth = 6371;
    var x = Math.pow(Math.sin((b[0] - a[0]) * r / 2), 2) +
      Math.cos(a[0] * r) * Math.cos(b[0] * r) *
      Math.pow(Math.sin((b[1] - a[1]) * r / 2), 2);
    return 2 * earth * Math.asin(Math.sqrt(x));
  }

  function distanceText(store) {
    if (!currentOrigin || store.lat == null || store.lon == null) return '';
    var km = distanceKm(currentOrigin, [Number(store.lat), Number(store.lon)]);
    return km < 1 ? Math.round(km * 1000 / 10) * 10 + ' m away' : (Math.round(km * 10) / 10) + ' km away';
  }

  function directionsUrl(store) {
    if (store.lat != null && store.lon != null) {
      return 'https://www.google.com/maps/dir/?api=1&destination=' +
        encodeURIComponent(String(store.lat) + ',' + String(store.lon));
    }
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent([store.name, store.address].filter(Boolean).join(' '));
  }

  function sourceHost(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (error) { return 'official source'; }
  }

  function sortRows(rows) {
    return rows.slice().sort(function (a, b) {
      if (currentOrigin) {
        var ad = (a.lat == null || a.lon == null) ? Infinity : distanceKm(currentOrigin, [Number(a.lat), Number(a.lon)]);
        var bd = (b.lat == null || b.lon == null) ? Infinity : distanceKm(currentOrigin, [Number(b.lat), Number(b.lon)]);
        if (ad !== bd) return ad - bd;
      }
      return Number(isPreOpen(a)) - Number(isPreOpen(b)) ||
        Number(b.machines || 0) - Number(a.machines || 0) ||
        String(a.name || '').localeCompare(String(b.name || ''), 'ja');
    });
  }

  function cardHtml(store) {
    var brand = brandEnglish(store);
    var distance = distanceText(store);
    return '<article class="gh-en-store-card">' +
      '<div class="gh-en-store-card__head"><div>' +
        '<p class="gh-en-store-card__area">' + esc(areaEnglish(store)) + (distance ? ' · ' + esc(distance) : '') + '</p>' +
        '<h3><button type="button" data-en-store="' + esc(store.id) + '">' + esc(store.name) + '</button></h3>' +
        '<p class="gh-en-store-card__brand">' + esc(brand) + (brand !== store.brand ? ' · ' + esc(store.brand) : '') + '</p>' +
      '</div>' + (isPreOpen(store) ? '<span class="gh-status gh-status--new">Opening ' + esc(store.opensOn) + '</span>' : '') + '</div>' +
      '<dl class="gh-en-store-card__facts">' +
        '<div><dt>Scale</dt><dd>' + esc(machineText(store)) + '</dd></div>' +
        '<div><dt>Hours</dt><dd>' + esc(hoursEnglish(store.hours)) + '</dd></div>' +
        '<div><dt>Checked</dt><dd><time datetime="' + esc(store.verifiedAt) + '">' + esc(store.verifiedAt) + '</time></dd></div>' +
      '</dl>' +
      '<div class="gh-en-store-card__actions">' +
        '<button class="gh-btn gh-btn--xs" type="button" data-en-store="' + esc(store.id) + '">English details</button>' +
        '<a class="gh-btn gh-btn--xs" href="' + esc(directionsUrl(store)) + '" target="_blank" rel="noopener noreferrer" data-en-directions="' + esc(store.id) + '">Directions</a>' +
      '</div>' +
    '</article>';
  }

  function renderRows(rows, query, nearbyMode) {
    currentRows = sortRows(rows);
    currentQuery = query || '';
    var minimum = currentQuery || currentOrigin ? PAGE_SIZE : FEATURED_SIZE;
    visible = Math.max(minimum, Math.min(visible, currentRows.length || minimum));
    detail.hidden = true;
    detail.innerHTML = '';
    results.hidden = false;
    results.innerHTML = currentRows.slice(0, visible).map(cardHtml).join('');
    if (!currentRows.length) {
      results.innerHTML = '<div class="gh-en-empty"><strong>No source-checked store matched this search.</strong>' +
        '<p>Try a broader prefecture or city name, or search with the official Japanese store name.</p></div>';
    }
    if (nearbyMode) {
      status.textContent = currentRows.length + ' stores with map coordinates, ordered by straight-line distance.';
    } else if (query) {
      status.textContent = currentRows.length + ' source-checked stores found for “' + query + '”.';
    } else {
      status.textContent = 'Featured source-checked stores, shown in published-scale reference order.';
    }
    more.hidden = currentRows.length <= visible;
    if (!more.hidden) more.textContent = 'Show ' + Math.min(PAGE_SIZE, currentRows.length - visible) + ' more stores';
  }

  function runSearch(query, options) {
    var settings = options || {};
    currentOrigin = settings.origin || null;
    visible = currentOrigin || query ? PAGE_SIZE : FEATURED_SIZE;
    var rows = currentOrigin
      ? ALL.filter(function (store) { return store.lat != null && store.lon != null; })
      : ALL.filter(function (store) { return matches(store, query); });
    renderRows(rows, query, Boolean(currentOrigin));
    if (input) input.value = query || '';
    if (settings.track !== false) track('english_search', {
      search_term: query || (currentOrigin ? 'near_me' : 'featured'),
      result_count: rows.length
    });
  }

  function renderDetail(id) {
    var store = ALL.find(function (item) { return item.id === id; });
    if (!store) {
      runSearch(currentQuery, { track: false });
      status.textContent = 'That store record is not available. The finder now shows current source-checked records.';
      return;
    }
    results.hidden = true;
    more.hidden = true;
    detail.hidden = false;
    status.textContent = 'English details for ' + store.name;
    var brand = brandEnglish(store);
    var address = store.address || 'Not published';
    var access = store.access || 'Not published';
    detail.innerHTML = '<article>' +
      '<button class="gh-en-back" type="button" data-en-back>← Back to search results</button>' +
      '<p class="gh-en-store-card__area">' + esc(areaEnglish(store)) + '</p>' +
      '<h2>' + esc(store.name) + '</h2>' +
      '<p class="gh-en-detail__name-note">Official store name in Japanese — show this name to station or facility staff if needed.</p>' +
      '<div class="gh-en-detail__actions">' +
        '<a class="gh-btn gh-btn--primary" href="' + esc(directionsUrl(store)) + '" target="_blank" rel="noopener noreferrer" data-en-directions="' + esc(store.id) + '">Open directions</a>' +
        '<a class="gh-btn gh-official-source" href="' + esc(store.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Official / facility source</a>' +
        '<button class="gh-btn" type="button" data-en-copy-name="' + esc(store.name) + '">Copy Japanese name</button>' +
      '</div>' +
      '<table class="gh-info-table gh-info-table--full"><tbody>' +
        '<tr><th>English brand guide</th><td>' + esc(brand) + (brand !== store.brand ? '<br><small>Official brand: ' + esc(store.brand) + '</small>' : '') + '</td></tr>' +
        '<tr><th>Location</th><td>' + esc(areaEnglish(store)) + '</td></tr>' +
        '<tr><th>Official address</th><td><span lang="ja">' + esc(address) + '</span>' + (store.zip ? '<br>Postal code ' + esc(store.zip) : '') + '</td></tr>' +
        '<tr><th>Access note (Japanese)</th><td><span lang="ja">' + esc(access) + '</span></td></tr>' +
        '<tr><th>Hours</th><td>' + esc(hoursEnglish(store.hours)) + (store.hours && /[\u3040-\u30ff\u3400-\u9fff]/.test(store.hours) ? '<br><small>Stored source text: <span lang="ja">' + esc(store.hours) + '</span></small>' : '') + '</td></tr>' +
        '<tr><th>Published scale</th><td>' + esc(machineText(store)) + '</td></tr>' +
        '<tr><th>Last source check</th><td><time datetime="' + esc(store.verifiedAt) + '">' + esc(store.verifiedAt) + '</time></td></tr>' +
        '<tr><th>Source domain</th><td>' + esc(sourceHost(store.sourceUrl)) + '</td></tr>' +
      '</tbody></table>' +
      '<p class="gh-detail-note">Hours, closures, entry conditions and capsule selection may have changed since the date shown. Check the linked official or facility source before travelling. Live inventory is not verified.</p>' +
    '</article>';
    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('english_store_open', { store_id: store.id, store_prefecture: PREF_EN[store.pref] || store.pref });
  }

  function track(name, params) {
    if (typeof window.ghTrack === 'function') window.ghTrack(name, params || {});
    else if (typeof ghTrack === 'function') ghTrack(name, params || {});
  }

  function setSearchHash(query) {
    if (window.GHLocationAccess) window.GHLocationAccess.hide(locationHelp);
    history.pushState(null, '', '#q=' + encodeURIComponent(query));
    runSearch(query);
    document.getElementById('find-store').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleHash() {
    var raw = String(location.hash || '').replace(/^#/, '');
    if (!raw || raw.indexOf('=') === -1) {
      runSearch('', { track: false });
      return;
    }
    var params = new URLSearchParams(raw);
    var id = params.get('store');
    var query = params.get('q');
    if (id) {
      if (!currentRows.length) {
        currentOrigin = null;
        currentQuery = '';
        currentRows = sortRows(ALL);
      }
      renderDetail(id);
    }
    else if (query != null) runSearch(query, { track: false });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    if (!query) {
      input.focus();
      return;
    }
    if (/^near\s*me$/i.test(query)) {
      locate();
      return;
    }
    setSearchHash(query);
  });

  document.addEventListener('click', function (event) {
    var queryButton = event.target.closest('[data-en-query]');
    if (queryButton) {
      setSearchHash(queryButton.getAttribute('data-en-query') || '');
      return;
    }
    var storeButton = event.target.closest('[data-en-store]');
    if (storeButton) {
      var id = storeButton.getAttribute('data-en-store');
      history.pushState(null, '', '#store=' + encodeURIComponent(id));
      renderDetail(id);
      return;
    }
    var back = event.target.closest('[data-en-back]');
    if (back) {
      if (currentQuery) history.pushState(null, '', '#q=' + encodeURIComponent(currentQuery));
      else history.pushState(null, '', '#find-store');
      renderRows(currentRows, currentQuery, Boolean(currentOrigin));
      document.getElementById('find-store').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var copy = event.target.closest('[data-en-copy-name]');
    if (copy) {
      var value = copy.getAttribute('data-en-copy-name') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () {
          copy.textContent = 'Japanese name copied';
        }).catch(function () { copy.textContent = 'Copy failed'; });
      }
      return;
    }
    var directions = event.target.closest('[data-en-directions]');
    if (directions) track('directions_click', {
      store_id: directions.getAttribute('data-en-directions'),
      language: 'en'
    });
    var language = event.target.closest('[data-gh-language-switch]');
    if (language) track('language_switch', { language_from: 'en', language_to: 'ja' });
  });

  more.addEventListener('click', function () {
    visible = Math.min(visible + PAGE_SIZE, currentRows.length);
    renderRows(currentRows, currentQuery, Boolean(currentOrigin));
  });

  var nearbyPending = false;

  function hideLocationHelp() {
    if (window.GHLocationAccess) window.GHLocationAccess.hide(locationHelp);
    else if (locationHelp) locationHelp.hidden = true;
  }

  function showLocationHelp(reason) {
    if (!locationHelp || !window.GHLocationAccess) return;
    var info = window.GHLocationAccess.render(locationHelp, 'en', null, reason);
    if (info) track('location_permission_help', {
      language: 'en',
      location_platform: info.platform,
      location_error: reason || 'denied'
    });
  }

  function finishNearby(label) {
    nearbyPending = false;
    if (!nearby) return;
    nearby.disabled = false;
    nearby.textContent = label || 'Use my location';
  }

  function requestCurrentLocation() {
    window.GHLocationAccess.requestPosition(navigator, {
      permissionTimeout: 800,
      positionOptions: {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      },
      onPermissionState: function (state) {
        status.textContent = state === 'prompt'
          ? 'Choose Allow in the browser permission prompt.'
          : 'Reading your current location…';
      }
    }).then(function (position) {
      finishNearby('Refresh nearby stores');
      hideLocationHelp();
      history.pushState(null, '', '#find-store');
      runSearch('', {
        origin: [Number(position.coords.latitude), Number(position.coords.longitude)]
      });
      document.getElementById('find-store').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, function (error) {
      finishNearby('Use my location');
      if (error && error.code === 1) {
        status.textContent = 'Location is blocked. Follow the instructions below, then try again.';
        showLocationHelp('permission_denied');
        return;
      }
      if (error && error.code === 3) {
        hideLocationHelp();
        status.textContent = 'Location timed out. Move somewhere with a clearer signal, then try again.';
        return;
      }
      if (error && error.code === 2) {
        status.textContent = 'Your device could not determine a location. Check device location or search by city or station.';
        showLocationHelp('position_unavailable');
        return;
      }
      status.textContent = 'Your location could not be read. Check device location or search by city or station.';
      showLocationHelp('position_unavailable');
    });
  }

  function locate() {
    if (nearbyPending) return;
    if (!navigator.geolocation) {
      status.textContent = 'Location access is not supported by this browser. Search by city or station instead.';
      return;
    }
    if (typeof window.isSecureContext === 'boolean' && !window.isSecureContext) {
      status.textContent = 'Location requires HTTPS. Open https://gacha-hiroba.com/english.html and try again.';
      return;
    }
    nearbyPending = true;
    nearby.disabled = true;
    nearby.textContent = 'Finding nearby stores…';
    hideLocationHelp();
    status.textContent = 'Checking your browser’s location permission…';
    requestCurrentLocation();
  }

  if (nearby) nearby.addEventListener('click', locate);
  if (locationHelp) {
    locationHelp.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('button,a') : null;
      if (!target) return;
      if (target.hasAttribute('data-gh-location-retry')) {
        locate();
        return;
      }
      if (target.hasAttribute('data-gh-location-search')) {
        hideLocationHelp();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
        return;
      }
      if (target.hasAttribute('data-gh-location-system-settings')) {
        track('location_settings_open', {
          language: 'en',
          location_platform: window.GHLocationAccess.guide('en').platform
        });
      }
    });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible' || !locationHelp || locationHelp.hidden || !window.GHLocationAccess) return;
    window.GHLocationAccess.permissionState().then(function (state) {
      if (state === 'granted') status.textContent = 'Location is allowed. Select “I changed the setting — try again”.';
    });
  });
  window.addEventListener('hashchange', handleHash);
  window.addEventListener('popstate', handleHash);
  handleHash();
})();
