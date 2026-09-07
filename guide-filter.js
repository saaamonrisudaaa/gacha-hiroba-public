/* 掲載済みの比較表だけを絞り込む。入力内容は保存・送信しない。 */
(() => {
  const controls = document.querySelector('[data-guide-filter]');
  const table = document.getElementById('guide-store-table');
  if (!controls || !table) return;
  const input = controls.querySelector('input');
  const clear = controls.querySelector('button');
  const status = controls.querySelector('[role="status"]');
  const empty = document.querySelector('[data-guide-empty]');
  const rows = Array.from(table.querySelectorAll('[data-guide-search]'));
  if (!input || !clear || !status || !empty || !rows.length) return;
  const normalize = value => String(value).normalize('NFKC').toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  const searchable = rows.map(row => normalize(row.getAttribute('data-guide-search')));
  function filter() {
    const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    rows.forEach((row, index) => {
      row.hidden = !terms.every(term => searchable[index].includes(term));
      if (!row.hidden) count++;
    });
    table.hidden = count === 0;
    empty.hidden = count !== 0;
    status.textContent = `一覧に${count}店を表示／掲載${rows.length}店`;
    clear.disabled = input.value.length === 0;
  }
  input.addEventListener('input', filter);
  input.addEventListener('search', filter);
  clear.addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });
  window.addEventListener('pageshow', filter);
  filter();
  controls.hidden = false;
})();
