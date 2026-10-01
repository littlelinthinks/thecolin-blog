/* ==========================================================================
 * Colin OS · 前端登录门禁
 * --------------------------------------------------------------------------
 * 与 rwc-os 同款策略：账号/密码以 SHA-256 哈希存于代码，明文不进仓库；
 * 登录成功后本设备记住（localStorage 'os_auth'），刷新免登录；可退出。
 * 注意：这是前端门禁，挡君子不挡黑客——真正的内容保护靠后端 PUBLISH_TOKEN。
 * ========================================================================== */
(function () {
  var KEY = 'os_auth';
  var U = 'd616e691ff6458623a137a77a521f2ec8877073ef9755ecc71efbccf19a4f476';
  var P = 'd616e691ff6458623a137a77a521f2ec8877073ef9755ecc71efbccf19a4f476';

  function sha(s) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
      .then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) {
          return x.toString(16).padStart(2, '0');
        }).join('');
      });
  }

  function addLogout() {
    var nav = document.querySelector('.os-nav-right');
    if (nav && !nav.querySelector('.os-logout')) {
      var b = document.createElement('button');
      b.className = 'os-logout';
      b.textContent = '退出';
      b.onclick = logout;
      nav.appendChild(b);
    }
  }

  function show() {
    document.documentElement.style.visibility = 'visible';
    var ov = document.createElement('div');
    ov.className = 'os-gate';
    ov.innerHTML =
      '<div class="os-gate-card">' +
      '<img class="os-gate-logo" src="./assets/img/logo-rwc.png" alt="Reads with Colin">' +
      '<h2>Personal OS · 发布台</h2>' +
      '<p class="os-gate-sub">READING TO CHANGE YOURSELF</p>' +
      '<label>账号<input id="g-u" autocomplete="username"></label>' +
      '<label>密码<input id="g-p" type="password" autocomplete="current-password"></label>' +
      '<p class="os-gate-err" hidden>账号或密码不正确</p>' +
      '<button class="os-gate-btn" id="g-go">进入</button>' +
      '</div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('in'); });

    function go() {
      var u = ov.querySelector('#g-u').value.trim();
      var p = ov.querySelector('#g-p').value;
      var err = ov.querySelector('.os-gate-err');
      if (!crypto.subtle) { err.textContent = '请使用现代浏览器打开'; err.hidden = false; return; }
      sha(u).then(function (hu) {
        return sha(p).then(function (hp) {
          if (hu === U && hp === P) {
            localStorage.setItem(KEY, 'ok');
            ov.classList.remove('in');
            setTimeout(function () { ov.remove(); }, 220);
            addLogout();
          } else {
            err.hidden = false;
            ov.querySelector('#g-p').value = '';
          }
        });
      });
    }
    ov.querySelector('#g-go').onclick = go;
    ov.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    setTimeout(function () { var el = ov.querySelector('#g-u'); if (el) el.focus(); }, 250);
  }

  function logout() {
    localStorage.removeItem(KEY);
    var old = document.querySelector('.os-gate');
    if (old) old.remove();
    var lb = document.querySelector('.os-logout');
    if (lb) lb.remove();
    show();
  }

  if (localStorage.getItem(KEY) === 'ok') {
    document.documentElement.style.visibility = 'visible';
    addLogout();
  } else {
    show();
  }
})();
