/* ============================================================
   ONSUM 연습용 추적 스크립트
   1) GTM 설치 (GTM_ID만 바꾸면 됨)
   2) 오른쪽 아래 '추적 로그' 패널: dataLayer에 들어가는 걸 실시간으로 보여줌
   ============================================================ */

// ▼▼ 여기에 본인 GTM 컨테이너 ID를 넣으면 GTM이 켜집니다 ▼▼
var GTM_ID = 'GTM-XXXXXXX';

window.dataLayer = window.dataLayer || [];

(function installGTM() {
  if (!/^GTM-[A-Z0-9]+$/.test(GTM_ID) || GTM_ID === 'GTM-XXXXXXX') return;
  (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', GTM_ID);
})();

/* ---------- UTM 읽기 ---------- */
window.ONSUM_UTM = (function () {
  var p = new URLSearchParams(location.search), o = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    if (p.get(k)) o[k] = p.get(k);
  });
  try {
    if (Object.keys(o).length) sessionStorage.setItem('onsum_utm', JSON.stringify(o));
    else o = JSON.parse(sessionStorage.getItem('onsum_utm') || '{}');
  } catch (e) {}
  return o;
})();

/* ---------- 추적 로그 패널 ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var gtmOn = GTM_ID !== 'GTM-XXXXXXX';
  var panel = document.createElement('div');
  panel.id = 'trk';
  panel.innerHTML =
    '<button id="trk-toggle" type="button"><span class="dot ' + (gtmOn ? 'on' : '') + '"></span>추적 로그 <b id="trk-count">0</b></button>' +
    '<div id="trk-body" hidden>' +
      '<div class="trk-head"><strong>dataLayer 실시간 로그</strong><button id="trk-close" type="button" aria-label="닫기">×</button></div>' +
      '<div class="trk-status">GTM: ' + (gtmOn ? '<em class="ok">' + GTM_ID + ' 연결됨</em>' : '<em class="no">아직 미설치 (GTM_ID 필요)</em>') + '</div>' +
      '<div class="trk-status">유입: ' + (Object.keys(window.ONSUM_UTM).length
        ? Object.keys(window.ONSUM_UTM).map(function (k) { return '<code>' + k.replace('utm_', '') + '=' + window.ONSUM_UTM[k] + '</code>'; }).join(' ')
        : '<em class="no">UTM 없음 (직접 유입)</em>') + '</div>' +
      '<ol id="trk-list"></ol>' +
      '<p class="trk-tip">GTM이 보는 건 이 목록이 전부예요. 여기 찍히는 <b>event</b> 이름이 GTM의 \'맞춤 이벤트\' 트리거 이름이 됩니다.</p>' +
    '</div>';
  document.body.appendChild(panel);

  var list = panel.querySelector('#trk-list'), seen = 0;
  function short(v) { var s = JSON.stringify(v); return s.length > 160 ? s.slice(0, 160) + '…' : s; }
  function render() {
    var dl = window.dataLayer;
    while (seen < dl.length) {
      var e = dl[seen++];
      if (!e || typeof e !== 'object' || Array.isArray(e) || e[0] !== undefined) continue;
      var li = document.createElement('li');
      var name = e.event || '(데이터만)';
      var rest = {}; Object.keys(e).forEach(function (k) { if (k !== 'event' && k.indexOf('gtm.') !== 0) rest[k] = e[k]; });
      if (e['gtm.elementId'] !== undefined || e['gtm.elementText'] !== undefined) {
        rest['Click ID'] = e['gtm.elementId']; rest['Click Text'] = (e['gtm.elementText'] || '').trim().slice(0, 30);
      }
      li.innerHTML = '<span class="ev ' + (name.indexOf('gtm.') === 0 ? 'sys' : '') + '">' + name + '</span>' +
        (Object.keys(rest).length ? '<code>' + short(rest).replace(/</g, '&lt;') + '</code>' : '');
      list.insertBefore(li, list.firstChild);
      panel.querySelector('#trk-count').textContent = list.children.length;
    }
  }
  setInterval(render, 300); render();

  var body = panel.querySelector('#trk-body');
  panel.querySelector('#trk-toggle').onclick = function () { body.hidden = !body.hidden; };
  panel.querySelector('#trk-close').onclick = function () { body.hidden = true; };
  if (/[?&]debug=1/.test(location.search)) body.hidden = false;
});
