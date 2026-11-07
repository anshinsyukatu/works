// 応援ボタン：押された回数だけを配信側（Cloudflare）に数える。回数はこのページには表示しない。
(function () {
  var WORKER = "https://kumaura-push.anshin-syukatu.workers.dev";
  var btn = document.getElementById("cheer-btn");
  var done = document.getElementById("cheer-done");
  if (!btn) return;
  var KEY = "hiro-works-cheered";
  try {
    if (localStorage.getItem(KEY) === "1") {
      btn.disabled = true;
      btn.textContent = "♡ 応援ずみ";
      done.classList.remove("hidden");
      return;
    }
  } catch (e) { /* noop */ }
  btn.addEventListener("click", function () {
    btn.disabled = true;
    fetch(WORKER + "/cheer", { method: "POST" })
      .then(function (res) {
        if (!res.ok) throw new Error("cheer failed");
        btn.textContent = "♡ 応援ずみ";
        done.classList.remove("hidden");
        try { localStorage.setItem(KEY, "1"); } catch (e) { /* noop */ }
      })
      .catch(function () {
        // 数えられなくても、気持ちは受け取る
        btn.textContent = "♡ 応援ずみ";
        done.classList.remove("hidden");
      });
  });
})();
