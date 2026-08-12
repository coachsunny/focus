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
 * 自动填充匿名邮箱（Twikoo 默认邮箱必填，隐藏后需自动填值）
 */
function fillAnonymousEmail() {
  const inputs = document.querySelectorAll('#tcomment input');
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
 * 隐藏不需要的元素（靠文本和元素类型判断，不依赖 class 名）
 * 只设 display:none，不移动 DOM，避免与 Vue 冲突
 */
function hideUnwantedElements() {
  const container = document.getElementById('tcomment');
  if (!container) return;

  // 1. 隐藏所有 img（头像）
  container.querySelectorAll('img').forEach(img => {
    img.style.display = 'none';
  });

  // 2. 隐藏邮箱和网址输入框：找到文本为"邮箱"/"网址"的标签，向上找输入框容器
  container.querySelectorAll('*').forEach(el => {
    const text = el.textContent.trim();
    if ((text === '邮箱' || text === '网址') && el.children.length === 0) {
      let wrapper = el.parentElement;
      while (wrapper && wrapper !== container) {
        const w = wrapper.getBoundingClientRect().width;
        if (w > 120 && w < 500) {
          wrapper.style.display = 'none';
          break;
        }
        wrapper = wrapper.parentElement;
      }
    }
  });

  // 3. 隐藏特定文本的元素
  container.querySelectorAll('*').forEach(el => {
    const text = el.textContent.trim();
    // 预览、Markdown、热门
    if ((text === '预览' || text === 'M↓' || text === '热门') && el.children.length === 0) {
      el.style.display = 'none';
    }
    // X 条评论
    if (/^\d+\s*条评论$/.test(text) && el.children.length <= 1) {
      el.style.display = 'none';
    }
    // Powered by Twikoo
    if (text.includes('Powered by') && el.children.length <= 2) {
      el.style.display = 'none';
    }
    // 操作系统/浏览器信息（短文本，包含系统关键词）
    if (text.length < 60 && el.children.length <= 3 &&
        (text.includes('Windows') || text.includes('Mac') || text.includes('Linux') ||
         text.includes('Chrome') || text.includes('Safari') || text.includes('Firefox') ||
         text.includes('Edge'))) {
      el.style.display = 'none';
    }
  });

  // 4. 隐藏评论中的图标按钮（点赞、回复、删除）：没有文字的按钮/链接
  container.querySelectorAll('[class*="comment"], [class*="Comment"]').forEach(comment => {
    comment.querySelectorAll('button, a').forEach(btn => {
      if (btn.textContent.trim() === '' && btn.children.length > 0) {
        btn.style.display = 'none';
      }
    });
  });

  // 5. 隐藏表情按钮：文本域下方，除了发送按钮之外没有文字的按钮
  const textarea = container.querySelector('textarea');
  if (textarea) {
    let parent = textarea.parentElement;
    while (parent && parent !== container) {
      parent.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.trim() === '' && !btn.classList.contains('el-button--primary')) {
          btn.style.display = 'none';
        }
      });
      parent = parent.parentElement;
    }
  }

  // 6. 隐藏排序栏中的刷新、设置图标按钮（没有文字的按钮）
  container.querySelectorAll('button').forEach(btn => {
    if (btn.textContent.trim() === '' && btn.closest('[class*="sort"], [class*="toolbar"], [class*="header"]')) {
      btn.style.display = 'none';
    }
  });
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
