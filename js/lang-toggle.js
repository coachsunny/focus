/* ==========================================================================
   觉察归位｜注意力静心训练站 - 简繁切换模块
   基于 opencc-js，支持简体/繁体实时切换，自动记忆用户选择
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'focus_site_lang';
  var DEFAULT_LANG = 'cn'; // cn=简体, tw=繁体
  var converterCNtoTW = null;
  var converterTWtoCN = null;
  var isConverting = false;

  /* ---------- 语言存取 ---------- */
  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  /* ---------- 转换器初始化 ---------- */
  function ensureConverters() {
    if (typeof OpenCC === 'undefined') return false;
    if (!converterCNtoTW) {
      converterCNtoTW = OpenCC.Converter({ from: 'cn', to: 'tw' });
    }
    if (!converterTWtoCN) {
      converterTWtoCN = OpenCC.Converter({ from: 'tw', to: 'cn' });
    }
    return true;
  }

  function convertText(text, targetLang) {
    if (!ensureConverters() || !text) return text;
    return targetLang === 'tw' ? converterCNtoTW(text) : converterTWtoCN(text);
  }

  /* ---------- DOM 转换 ---------- */
  function convertNode(node, targetLang) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && node.textContent.trim()) {
        node.textContent = convertText(node.textContent, targetLang);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      var tag = node.tagName.toLowerCase();
      // 跳过脚本、样式、输入框
      if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre') return;
      // 转换 placeholder / title / alt
      if (tag === 'input' || tag === 'textarea') {
        if (node.placeholder) node.placeholder = convertText(node.placeholder, targetLang);
        if (node.title) node.title = convertText(node.title, targetLang);
        return; // 不递归 input/textarea 的子节点
      }
      if (node.title) node.title = convertText(node.title, targetLang);
      if (node.alt) node.alt = convertText(node.alt, targetLang);
      // 递归子节点
      for (var i = 0; i < node.childNodes.length; i++) {
        convertNode(node.childNodes[i], targetLang);
      }
    }
  }

  function convertPage(targetLang) {
    if (isConverting) return;
    isConverting = true;
    if (!ensureConverters()) { isConverting = false; return; }
    convertNode(document.body, targetLang);
    isConverting = false;
  }

  /* ---------- 切换按钮 ---------- */
  function createToggleButton() {
    var nav = document.getElementById('mainNav');
    if (!nav || document.getElementById('langToggle')) return;
    var btn = document.createElement('button');
    btn.id = 'langToggle';
    btn.className = 'lang-toggle-btn';
    btn.type = 'button';
    updateButtonText(btn);
    btn.addEventListener('click', toggleLang);
    nav.appendChild(btn);
  }

  function updateButtonText(btn) {
    btn = btn || document.getElementById('langToggle');
    if (!btn) return;
    var lang = getLang();
    btn.textContent = lang === 'cn' ? '繁' : '简';
    btn.title = lang === 'cn' ? '切換為繁體' : '切换为简体';
    btn.setAttribute('aria-label', btn.title);
  }

  function toggleLang() {
    var current = getLang();
    var next = current === 'cn' ? 'tw' : 'cn';
    setLang(next);
    // 重新加载页面：原文为简体，切回简体时直接重载最准确
    location.reload();
  }

  /* ---------- 监听 Twikoo 动态内容 ---------- */
  function observeDynamicContent() {
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function (mutations) {
      if (getLang() !== 'tw' || !ensureConverters() || isConverting) return;
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 只转换 Twikoo 区域内的新内容
            if (node.closest && node.closest('.twikoo')) {
              convertNode(node, 'tw');
            } else if (node.classList && node.classList.contains('twikoo')) {
              convertNode(node, 'tw');
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- 等待 OpenCC 加载并执行转换 ---------- */
  function waitAndConvert(targetLang, maxWait) {
    maxWait = maxWait || 10000;
    var start = Date.now();
    function check() {
      if (typeof OpenCC !== 'undefined') {
        convertPage(targetLang);
        return;
      }
      if (Date.now() - start < maxWait) {
        setTimeout(check, 150);
      }
    }
    check();
  }

  /* ---------- 初始化 ---------- */
  function init() {
    createToggleButton();
    observeDynamicContent();
    if (getLang() === 'tw') {
      // 延迟一点等 Twikoo 初始化，再统一转换
      setTimeout(function () { waitAndConvert('tw'); }, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
