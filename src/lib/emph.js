/* 料金などの「数字」だけを一段大きく見せるためのビルド時ヘルパー。
   companies.json の値は {r.value} のようにテキストとして流し込まれるため、
   そのままではタグを足せない。ここで HTML を安全にエスケープしたうえで、
   数字（3桁区切りの金額）だけを <span class="pnum"> で包む。
   1,200円 のような計算式・注記には触れない（円の直前が数字の塊のときだけ）。 */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function emph(text) {
  if (text == null) return '';
  return String(text)
    .replace(/[&<>"']/g, (ch) => ESC[ch])
    .replace(/([0-9][0-9,]*(?:\.[0-9]+)?)(?=円)/g, '<span class="pnum">$1</span>');
}
