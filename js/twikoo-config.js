/* ==========================================================================
   觉察归位｜注意力静心训练站 - 学员心得分享区 (Twikoo 云端评论引擎)
   纯 CSS 定制方案：不操作 DOM，避免与 Twikoo Vue 渲染冲突
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

      // 自动填充匿名邮箱（解决发送按钮灰色问题）
      setTimeout(fillAnonymousEmail, 800);
      setTimeout(fillAnonymousEmail, 2000);

      // 启动 MutationObserver 持续监听，新元素一出现就自动隐藏
      startHideObserver();
      // 初始执行几次
      setTimeout(hideUnwantedElements, 1000);
      setTimeout(hideUnwantedElements, 2500);

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
 * 自动填充匿名邮箱（Twikoo 默认邮箱必填，CSS 隐藏后需自动填值）
 */
function fillAnonymousEmail() {
  const inputs = document.querySelectorAll('#tcomment input');
  // 第一个是昵称，第二个是邮箱，第三个是网址
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
 * 启动 MutationObserver，持续监听 Twikoo DOM 变化
 * 新元素一出现就自动隐藏，只做 display:none，不移动 DOM，避免与 Vue 冲突
 */
function startHideObserver() {
  const container = document.getElementById('tcomment');
  if (!container) return;

  const observer = new MutationObserver(() => {
    clearTimeout(window._hideTimer);
    window._hideTimer = setTimeout(hideUnwantedElements, 100);
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

/**
 * 安全获取元素的 class 字符串（兼容 SVG 元素）
 */
function getClassStr(el) {
  if (!el) return '';
  // 优先用 getAttribute，兼容 SVG（SVG 的 className 是对象不是字符串）
  const cls = el.getAttribute && el.getAttribute('class');
  if (cls) return cls.toLowerCase();
  if (el.className && typeof el.className === 'string') {
    return el.className.toLowerCase();
  }
  return '';
}

/**
 * 隐藏不需要的元素（只设 display:none，不移动 DOM，避免与 Vue 冲突）
 */
function hideUnwantedElements() {
  const container = document.getElementById('tcomment');
  if (!container) return;

  const allEls = container.querySelectorAll('*');

  allEls.forEach(el => {
    const cls = getClassStr(el);
    const text = el.textContent.trim();
    const tag = el.tagName.toLowerCase();

    // 隐藏头像
    if (cls.includes('avatar')) {
      el.style.display = 'none';
    }

    // 隐藏表情按钮
    if (cls.includes('emoji') || cls.includes('smile')) {
      el.style.display = 'none';
    }

    // 隐藏预览、Markdown 按钮
    if (cls.includes('preview') || cls.includes('markdown') ||
        text === '预览' || text === 'M↓') {
      el.style.display = 'none';
    }

    // 隐藏点赞、回复
    if (cls.includes('like') || cls.includes('reply') || cls.includes('thumb')) {
      el.style.display = 'none';
    }

    // 隐藏热门
    if (cls.includes('hot') || (text === '热门' && el.children.length === 0)) {
      el.style.display = 'none';
    }

    // 隐藏评论数标题（如"1条评论"）
    if (text.includes('条评论') && el.children.length <= 1) {
      el.style.display = 'none';
    }

    // 隐藏操作系统/浏览器信息
    if (cls.includes('os') || cls.includes('browser') ||
        cls.includes('ua') || cls.includes('user-agent')) {
      el.style.display = 'none';
    }

    // 隐藏刷新、设置、管理齿轮
    if (cls.includes('refresh') || cls.includes('setting') ||
        cls.includes('gear') || cls.includes('admin')) {
      el.style.display = 'none';
    }

    // 隐藏 Powered by Twikoo
    if (text.includes('Powered by') || (text.includes('Twikoo v') && el.children.length === 0)) {
      el.style.display = 'none';
    }
  });

  // 隐藏邮箱和网址输入框（第2、3个 input 的父容器）
  const inputs = container.querySelectorAll('input');
  if (inputs.length >= 3) {
    [inputs[1], inputs[2]].forEach(input => {
      let wrapper = input.closest('.el-input, .el-input-group, [class*="input"]');
      if (wrapper) {
        wrapper.style.display = 'none';
      } else {
        input.style.display = 'none';
      }
    });
  }
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
