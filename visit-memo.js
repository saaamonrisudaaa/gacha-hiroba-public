/* 入力はページ内だけで扱い、コピー操作以外では保存・送信しない。 */
(() => {
  const memo = document.getElementById('visitMemo');
  const button = document.getElementById('copyVisitMemo');
  const status = document.getElementById('visitMemoStatus');
  if (!memo || !button || !status) return;
  const prefix = '#visit-memo?';
  if (location.hash.startsWith(prefix)) {
    const params = new URLSearchParams(location.hash.slice(prefix.length));
    const fields = [['product', '商品名'], ['maker', 'メーカー'], ['price', '価格・種類数'], ['schedule', '発売時期（入荷日とは別）'], ['source', '商品公式URL']];
    for (const [key, label] of fields) {
      const value = (params.get(key) || '').replace(/[\r\n]/g, ' ').slice(0, 600);
      memo.value = memo.value.replace(label + '：', () => label + '：' + value);
    }
    document.getElementById('visit-memo').scrollIntoView();
  }
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(memo.value);
      status.textContent = 'コピーしました。メモアプリなどに貼り付けて保存してください。';
      if (typeof ghTrack === 'function') ghTrack('visit_memo_copy', { tool: 'visit_memo' });
    } catch {
      memo.focus();
      memo.select();
      status.textContent = '自動コピーが使えないため、メモを選択しました。端末のコピー操作で保存してください。';
    }
  });
})();
