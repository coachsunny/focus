/* ==========================================================================
   觉察归位｜注意力静心训练站 - 学员心得分享区 (Twikoo 云端评论引擎)
   纯 CSS + 少量 JS 隐藏方案：只做 display:none，不移动 DOM，避免与 Vue 冲突
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

      // 多次执行隐藏，确保 Twikoo 渲染完成后所有多余元素都被隐藏
      // 不用 MutationObserver，避免与 Vue 渲染冲突
      setTimeout(hideUnwantedElements, 1000);
      setTimeout(hideUnwantedElements, 2500);
      setTimeout(hideUnwantedElements, 4000);

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
 * 新元素一出现就自动隐藏，只做 display:none，不移动 DOM，避免与 Vue 冲突
 */
function startHideObserver() {
  const container = document.querySelector('.twikoo');
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
 * 自动填充匿名邮箱（Twikoo 默认邮箱必填，隐藏后需自动填值）
 */
function fillAnonymousEmail() {
  const inputs = document.querySelectorAll('.twikoo input');
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
 * 隐藏元素的工具函数（用 !important 确保优先级最高）
 */
function hideEl(el) {
  if (el) {
    el.style.setProperty('display', 'none', 'important');
  }
}

/**
 * 隐藏所有多余元素（基于真实 DOM 结构的精准 class 选择器）
 * 直接用 JS 设置 display:none !important，不依赖 CSS
 */
function hideUnwantedElements() {
  const container = document.querySelector('.twikoo');
  if (!container) return;

  // 需要隐藏的元素选择器列表（基于真实 DOM 结构）
  const selectors = [
    '.tk-avatar',                    // 头像
    '.tk-meta-input .el-input-group:nth-child(2)',  // 邮箱输入框组
    '.tk-meta-input .el-input-group:nth-child(3)',  // 网址输入框组
    '.OwO',                          // 表情按钮
    '.__markdown',                   // Markdown 按钮
    '.tk-preview',                   // 预览按钮
    '.tk-comments-title',            // 评论数标题
    '.tk-comments-sort',             // 排序栏
    '.tk-comments-actions .tk-icon', // 刷新/设置图标
    '.tk-action',                    // 评论操作按钮（点赞/回复/删除）
    '.tk-extras',                    // 操作系统/浏览器信息
    '.tk-footer',                    // 底部版权
    '.tk-admin-container',           // 管理后台
    '.tk-input-image',               // 图片上传 input
  ];

  selectors.forEach(selector => {
    container.querySelectorAll(selector).forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  });

  // 确保发送按钮显示（防止被误隐藏）
  const sendBtn = container.querySelector('.tk-send');
  if (sendBtn) {
    sendBtn.style.setProperty('display', 'inline-block', 'important');
    sendBtn.style.setProperty('visibility', 'visible', 'important');
    sendBtn.style.setProperty('opacity', '1', 'important');
  }

  // 确保操作栏容器显示（发送按钮的父容器）
  const actionsRow = container.querySelector('.tk-row.actions');
  if (actionsRow) {
    actionsRow.style.setProperty('display', 'flex', 'important');
    actionsRow.style.setProperty('justify-content', 'flex-end', 'important');
    actionsRow.style.setProperty('margin-top', '12px', 'important');
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
