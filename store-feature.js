/* 店舗詳細と静的ガイドで共通の、画像付き店舗紹介。 */
(function (window) {
  'use strict';
  function esc(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function render(store, compact) {
    var feature = store && store.editorial;
    if (!store || !store.sourceUrl || !store.verifiedAt || !feature || !feature.image) return '';
    var image = feature.image;
    var heading = compact ? 'h4' : 'h2';
    return '<div class="gh-store-feature' + (compact ? ' gh-store-feature--compact' : '') + '">' +
      '<figure class="gh-store-feature__figure"><img src="' + esc(image.src) + '" srcset="' + esc(image.small) + ' 480w, ' + esc(image.src) + ' 1280w" sizes="(max-width: 600px) calc(100vw - 60px), ' + (compact ? '420px' : '900px') + '" width="' + image.width + '" height="' + image.height + '" alt="' + esc(image.alt) + '" ' + (compact ? 'loading="lazy"' : 'fetchpriority="high"') + ' decoding="async" /><figcaption>' + esc(image.caption) + '</figcaption></figure>' +
      '<div class="gh-store-feature__content"><div class="gh-store-feature__lead"><span class="gh-store-feature__label">来店前のポイント</span><' + heading + ' class="gh-store-feature__title">' + esc(feature.title) + '</' + heading + '><p class="gh-store-feature__intro">' + esc(feature.intro) + '</p></div>' +
      '<dl class="gh-store-feature__points">' + feature.points.map(function (point) {
        return '<div><dt>' + esc(point.label) + '</dt><dd>' + esc(point.text) + '</dd></div>';
      }).join('') + '</dl><p class="gh-store-feature__source">公式情報の確認：<time datetime="' + esc(feature.checkedAt) + '">' + esc(feature.checkedAt) + '</time> ／ <a class="gh-official-source" href="' + esc(store.sourceUrl) + '" target="_blank" rel="noopener noreferrer">店舗の公式案内 ↗</a></p>' +
      (compact ? '' : '<a class="gh-btn gh-btn--sm" href="/guide/' + esc(feature.guideSlug) + '.html">周辺のお店・回り方も見る →</a>') + '</div></div>';
  }
  window.GHStoreFeature = { render: render };
})(window);
