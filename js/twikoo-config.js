/* ==========================================================================
   觉察归位｜注意力静心训练站 - 学员心得分享区 (Twikoo 云端评论引擎)
   后端：Vercel + Twikoo + MongoDB
   前端：双卡片定制风格（输入区 + 分享列表）
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTwikooComments();
});

async function initTwikooComments() {
  const container = document.getElementById('tcomment');
  if (!container) return;

  const statusBadge = document.getElementById('shareModeStatus');
  const envId = 'https://twikoo-chi-swart-85.vercel.app/';

  if (statusBadge) {
    statusBadge.innerHTML = '<span class="share-mode-tag mode-cloud">🔄 正在连接心得系统...</span>';
  }

  // Pre-flight health check
  try {
    const healthRes = await fetch(envId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'COMMENT_GET',
        url: '/community.html',
        page: 1,
        pageSize: 1
      })
    });
    if (!healthRes.ok) {
      throw new Error('Server returned ' + healthRes.status);
    }
  } catch (err) {
    console.warn('Twikoo server health check failed:', err);
    if (statusBadge) {
      statusBadge.innerHTML = '<span class="share-mode-tag mode-cloud">⚠️ 心得系统维护中</span>';
    }
    showErrorState(container, statusBadge, '心得系统暂时维护中，请稍后再试');
    return;
  }

  // 初始化 Twikoo
  if (typeof twikoo !== 'undefined' && typeof twikoo.init === 'function') {
    try {
      await twikoo.init({
        envId: envId,
        el: '#tcomment',
        lang: 'zh-CN',
        path: '/community.html',
        placeholder: '在此写下你此刻的静心觉察或复盘感悟...',
        noComment: '还没有心得分享，成为第一个分享觉察的人吧 🌱',
        commentSort: 1,
        enableQQ: false,
        enableImageUpload: false,
        requiredFields: [],
      });

      if (statusBadge) {
        statusBadge.innerHTML = '<span class="share-mode-tag mode-cloud">🌐 云端心得系统已连接</span>';
      }

      // 启动 MutationObserver 持续监听 DOM 变化
      startMutationObserver();

      // 初始执行几次
      setTimeout(applyAllFixes, 500);
      setTimeout(applyAllFixes, 1200);
      setTimeout(applyAllFixes, 2500);

    } catch (err) {
      console.warn('Twikoo init failed:', err);
      showErrorState(container, statusBadge, '心得系统加载异常，请刷新页面重试');
    }
  } else {
    console.warn('Twikoo SDK not loaded');
    showErrorState(container, statusBadge, '心得系统脚本加载失败，请检查网络连接');
  }
}

/**
 * 启动 MutationObserver，持续监听 Twikoo DOM 变化
 * Twikoo 每次重渲染都会自动应用样式修复
 */
function startMutationObserver() {
  const tcomment = document.getElementById('tcomment');
  const listContainer = document.getElementById('tcomment-list');
  if (!tcomment && !listContainer) return;

  const observer = new MutationObserver((mutations) => {
    // 防抖：多次变化只执行一次
    clearTimeout(window._twikooFixTimer);
    window._twikooFixTimer = setTimeout(applyAllFixes, 150);
  });

  if (tcomment) {
    observer.observe(tcomment, { childList: true, subtree: true, attributes: true });
  }
  if (listContainer) {
    observer.observe(listContainer, { childList: true, subtree: true, attributes: true });
  }
}

/**
 * 执行所有修复：分离输入区列表、填充邮箱、强制样式
 */
function applyAllFixes() {
  separateInputAndList();
  fillAnonymousEmail();
  forceStyleOverride();
}

/**
 * 将 Twikoo 的输入区和评论列表分离到两个卡片中
 */
function separateInputAndList() {
  const tcomment = document.getElementById('tcomment');
  const listContainer = document.getElementById('tcomment-list');
  const listCard = document.getElementById('shareListCard');

  if (!tcomment || !listContainer || !listCard) return;

  const twikooEl = tcomment.querySelector('.twikoo');
  if (!twikooEl) return;

  const children = Array.from(twikooEl.children);
  let moved = false;

  children.forEach(child => {
    const hasTextarea = child.querySelector('textarea');
    const isAdminBar = hasClass(child, 'admin') || hasClass(child, 'gear') || hasClass(child, 'setting');

    if (!hasTextarea && !isAdminBar) {
      // 避免重复移动
      if (child.parentElement !== listContainer) {
        listContainer.appendChild(child);
        moved = true;
      }
    }
  });

  if (moved || listContainer.children.length > 0) {
    listCard.style.display = 'block';
  }

  // 把管理按钮（齿轮）移到输入区卡片右上角
  const adminBtn = twikooEl.querySelector('[class*="admin"], [class*="gear"], [class*="setting"]');
  if (adminBtn) {
    adminBtn.style.position = 'absolute';
    adminBtn.style.top = '12px';
    adminBtn.style.right = '16px';
    adminBtn.style.opacity = '0.4';
    adminBtn.style.transition = 'opacity 0.2s';
    adminBtn.style.zIndex = '10';
    const inputCard = document.querySelector('.share-input-card');
    if (inputCard && adminBtn.parentElement !== inputCard) {
      inputCard.style.position = 'relative';
      inputCard.appendChild(adminBtn);
    }
  }
}

/**
 * 自动填充匿名邮箱（Twikoo 默认邮箱必填）
 */
function fillAnonymousEmail() {
  const inputs = document.querySelectorAll('.share-input-card input');
  // 通常第一个是昵称，第二个是邮箱，第三个是网址
  if (inputs.length >= 2) {
    const emailInput = inputs[1];
    if (!emailInput.value) {
      emailInput.value = 'anonymous@focus.local';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

/**
 * 强制覆盖 Twikoo 样式（JS 内联样式，优先级最高）
 */
function forceStyleOverride() {
  fixInputBackground();
  hideInputButtons();
  hideListSocialElements();
}

/**
 * 修复输入区深绿色背景
 */
function fixInputBackground() {
  const inputCard = document.querySelector('.share-input-card');
  if (!inputCard) return;

  // 找到包含 textarea 的容器（输入区主容器），向上遍历直到 inputCard
  const textarea = inputCard.querySelector('textarea');
  if (textarea) {
    let el = textarea;
    while (el && el !== inputCard) {
      if (el.tagName !== 'TEXTAREA' && !el.classList.contains('el-textarea__inner')) {
        el.style.backgroundColor = 'transparent';
        el.style.background = 'transparent';
      }
      el = el.parentElement;
    }
  }

  // 同时遍历所有元素，清除非输入框/按钮的背景
  inputCard.querySelectorAll('*').forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (el.classList.contains('el-input__inner') || el.classList.contains('el-textarea__inner')) return;
    if (el.classList.contains('el-button--primary') || el.classList.contains('tk-submit')) return;
    if (tag === 'button' && el.textContent.includes('发送')) return;

    el.style.backgroundColor = 'transparent';
    el.style.background = 'transparent';
  });
}

/**
 * 隐藏输入区的表情、Markdown、预览按钮
 */
function hideInputButtons() {
  const inputCard = document.querySelector('.share-input-card');
  if (!inputCard) return;

  inputCard.querySelectorAll('button, a, span, div, i, svg').forEach(el => {
    const text = el.textContent.trim();
    // 隐藏表情按钮（笑脸图标）
    if (hasClass(el, 'emoji') || hasClass(el, 'smile') || hasClass(el, 'expression')) {
      el.style.display = 'none';
    }
    // 隐藏 Markdown/预览按钮
    if (hasClass(el, 'markdown') || hasClass(el, 'preview') || text === 'M↓' || text === '预览') {
      el.style.display = 'none';
    }
  });
}

/**
 * 隐藏评论区的社交元素（点赞、回复、热门等）
 */
function hideListSocialElements() {
  const listCard = document.querySelector('.share-list-card');
  if (!listCard) return;

  listCard.querySelectorAll('*').forEach(el => {
    const text = el.textContent.trim();

    // 隐藏点赞、回复、热门
    if (hasClass(el, 'like') || hasClass(el, 'reply') || hasClass(el, 'hot') || hasClass(el, 'thumb')) {
      el.style.display = 'none';
    }
    // 隐藏"热门"文本
    if (text === '热门' && el.children.length === 0) {
      el.style.display = 'none';
    }
    // 隐藏操作系统/浏览器信息
    if (hasClass(el, 'os') || hasClass(el, 'browser') || hasClass(el, 'ua') || hasClass(el, 'user-agent')) {
      el.style.display = 'none';
    }
    // 隐藏评论数标题（如"1条评论"）
    if (text.includes('条评论') && el.children.length <= 1) {
      el.style.display = 'none';
    }
    // 隐藏刷新、设置、管理齿轮
    if (hasClass(el, 'refresh') || hasClass(el, 'setting') || hasClass(el, 'gear') || hasClass(el, 'admin')) {
      el.style.display = 'none';
    }
  });
}

/**
 * 安全检查元素是否包含某个 class（兼容 SVG 元素）
 */
function hasClass(el, keyword) {
  if (!el) return false;
  // 优先用 classList
  if (el.classList && typeof el.classList.contains === 'function') {
    for (let i = 0; i < el.classList.length; i++) {
      if (el.classList[i].toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
    }
  }
  // 备用：getAttribute('class')
  const cls = el.getAttribute && el.getAttribute('class');
  if (cls && cls.toLowerCase().includes(keyword.toLowerCase())) {
    return true;
  }
  return false;
}

function showErrorState(container, statusBadge, message) {
  if (statusBadge) {
    statusBadge.innerHTML = '<span class="share-mode-tag mode-cloud">⚠️ 心得系统加载异常</span>';
  }
  container.innerHTML = `
    <div style="text-align: center; padding: 48px 24px; color: var(--text-muted);">
      <div style="font-size: 2.5rem; margin-bottom: 16px;">🍃</div>
      <h3 style="font-size: 1.1rem; color: var(--text-dark); margin-bottom: 10px;">心得系统暂时无法加载</h3>
      <p style="font-size: 0.93rem;">请刷新页面或稍后再试。</p>
    </div>
  `;
  if (typeof showToast === 'function') {
    showToast(message, 'warning');
  }
}
