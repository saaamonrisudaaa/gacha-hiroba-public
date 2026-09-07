/* 商品カードの50%以上を1秒表示したときに1回だけ計測。保存・外部送信は既存のghTrackに従う。 */
(function () {
  'use strict';
  var cards = Array.from(document.querySelectorAll('[data-affiliate-id]'));
  if (!cards.length) return;
  var seen = new Set();
  var timers = new Map();
  var visible = new Set();
  function track(name, card, extra) {
    var shelf = card.closest('[data-affiliate-placement]');
    if (!shelf || typeof window.ghTrack !== 'function') return;
    window.ghTrack(name, Object.assign({
      affiliate_id: card.dataset.affiliateId,
      placement: shelf.dataset.affiliatePlacement,
      revision: shelf.dataset.affiliateRevision,
      page_path: window.location.pathname
    }, extra || {}));
  }
  function cancel(card) {
    clearTimeout(timers.get(card));
    timers.delete(card);
  }
  function start(card) {
    if (document.visibilityState === 'hidden' || seen.has(card) || timers.has(card)) return;
    timers.set(card, setTimeout(function () {
      timers.delete(card);
      if (document.visibilityState === 'hidden' || !visible.has(card)) return;
      seen.add(card);
      track('affiliate_impression', card);
    }, 1000));
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          visible.add(entry.target); start(entry.target);
        } else { visible.delete(entry.target); cancel(entry.target); }
      });
    }, { threshold: [0, 0.5] });
    cards.forEach(function (card) { observer.observe(card); });
    document.addEventListener('visibilitychange', function () {
      cards.forEach(cancel);
      if (document.visibilityState !== 'hidden') visible.forEach(start);
    });
  }
  function onClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest && event.target.closest('a');
    var source = link && link.closest('[data-affiliate-link]');
    var card = source && source.closest('[data-affiliate-id]');
    if (card) track('affiliate_click', card, { link_type: source.dataset.affiliateLink });
  }
  document.addEventListener('click', onClick);
  document.addEventListener('auxclick', onClick);
})();
