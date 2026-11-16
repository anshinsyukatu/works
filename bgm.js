/* ひろぺ BGM
 * クマうらと同じ自作ループ（bgm.mp3）を流す。ループ再生・音量0.8。
 * ページを開いたら再生を試みる。ブラウザの自動再生制限でブロックされた場合は、
 * 利用者がページのどこかを最初にタップ／クリックした時点で再生を始める。
 * 画面右下の固定ボタンでいつでも止める／流すができる（停止は一時停止）。
 * 再生できなくても、ページの他の機能には一切影響しない。 */
(function () {
  "use strict";
  var audio = null;
  var btn = null;
  var playing = false;
  var started = false;      // 一度でも再生が始まったか
  var gestureArmed = false; // 「最初のタップで再生」を待ち受け中か

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio("bgm.mp3");
    audio.loop = true;
    audio.volume = 0.8;
    audio.preload = "auto";
    audio.addEventListener("play", function () {
      playing = true;
      started = true;
      disarmGesture();
      refresh();
    });
    audio.addEventListener("pause", function () { playing = false; refresh(); });
    audio.addEventListener("error", function () { /* 読み込み失敗時は何もしない */ });
    return audio;
  }

  function ensureButton() {
    if (btn) return btn;
    btn = document.createElement("button");
    btn.type = "button";
    btn.id = "bgm-toggle";
    btn.setAttribute("aria-label", "音楽を止める／流す");
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    refresh();
    return btn;
  }

  function refresh() {
    if (!btn) return;
    btn.textContent = playing ? "🔊 音を止める" : "🔇 音を流す";
  }

  function tryPlay() {
    try {
      var a = ensureAudio();
      var p = a.play();
      if (p && p.catch) {
        return p.catch(function () { /* 再生失敗時は何もしない */ });
      }
    } catch (e) { /* 再生できなくても他の機能に影響させない */ }
    return null;
  }

  // 自動再生がブロックされたときだけ、最初のタップ／クリックで再生を始める。
  // 一度再生が始まったら待ち受けは解除する（止めた後に触って再開したりしない）。
  function onFirstGesture(e) {
    if (btn && e && e.target && (e.target === btn || (btn.contains && btn.contains(e.target)))) {
      return; // ボタン自身のタップはボタンの処理に任せる
    }
    tryPlay();
  }

  function armGesture() {
    if (gestureArmed || started) return;
    gestureArmed = true;
    document.addEventListener("pointerdown", onFirstGesture, true);
    document.addEventListener("keydown", onFirstGesture, true);
  }

  function disarmGesture() {
    if (!gestureArmed) return;
    gestureArmed = false;
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstGesture, true);
  }

  function toggle() {
    if (!audio || !started) { tryPlay(); return; }
    if (playing) {
      audio.pause();
    } else {
      tryPlay();
    }
  }

  function init() {
    try {
      ensureButton();
      ensureAudio();
      var p = tryPlay();
      // 自動再生が許可されればそのまま流れ始める。
      // ブロックされて promise が失敗したら、最初のタップで始める待ち受けにする。
      if (p && p.then) {
        p.then(function () {
          if (!playing && !started) armGesture();
        });
      }
      // 念のため：少し待っても再生が始まっていなければ待ち受けにする
      setTimeout(function () { if (!started) armGesture(); }, 800);
    } catch (e) { /* 何があってもページ本体には影響させない */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
