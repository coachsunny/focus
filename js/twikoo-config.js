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

      // 等待 DOM 渲染后，分离输入区和评论列表
      setTimeout(separateInputAndList, 600);
      setTimeout(fillAnonymousEmail, 600);
      // 评论是异步加载的，再等久一点确保列表渲染
      setTimeout(separateInputAndList, 1500);
      setTimeout(fillAnonymousEmail, 1500);

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
 * 将 Twikoo 的输入区和评论列表分离到两个卡片中
 * 输入区（含 textarea）留在 #tcomment
 * 评论列表（不含 textarea）移动到 #tcomment-list
 */
function separateInputAndList() {
  const tcomment = document.getElementById('tcomment');
  const listContainer = document.getElementById('tcomment-list');
  const listCard = document.getElementById('shareListCard');

  if (!tcomment || !listContainer || !listCard) return;

  const twikooEl = tcomment.querySelector('.twikoo');
  if (!twikooEl) return;

  // 遍历 .twikoo 的直接子元素
  // 包含 textarea 的是输入区，保留在原地
  // 不包含 textarea 的是评论列表/分页/空状态，移动到列表容器
  const children = Array.from(twikooEl.children);
  let moved = false;

  children.forEach(child => {
    const hasTextarea = child.querySelector('textarea');
    // 同时排除管理按钮区域（齿轮/刷新），它们应该留在输入区
    const isAdminBar = child.querySelector('[class*="admin"], [class*="gear"], [class*="setting"]');

    if (!hasTextarea && !isAdminBar) {
      listContainer.appendChild(child);
      moved = true;
    }
  });

  // 如果移动了元素，或者列表容器已有内容，显示列表卡片
  if (moved || listContainer.children.length > 0) {
    listCard.style.display = 'block';
  }

  // 把管理按钮（齿轮）移到输入区卡片的右上角
  const adminBtn = twikooEl.querySelector('[class*="admin"], [class*="gear"], [class*="setting"]');
  if (adminBtn) {
    adminBtn.style.position = 'absolute';
    adminBtn.style.top = '12px';
    adminBtn.style.right = '16px';
    adminBtn.style.opacity = '0.4';
    adminBtn.style.transition = 'opacity 0.2s';
    adminBtn.addEventListener('mouseenter', () => { adminBtn.style.opacity = '1'; });
    adminBtn.addEventListener('mouseleave', () => { adminBtn.style.opacity = '0.4'; });
    // 确保输入区卡片有定位上下文
    const inputCard = document.querySelector('.share-input-card');
    if (inputCard) {
      inputCard.style.position = 'relative';
      inputCard.appendChild(adminBtn);
    }
  }
}

/**
 * 自动填充匿名邮箱（Twikoo 默认邮箱必填，隐藏后需自动填值才能发送）
 */
function fillAnonymousEmail() {
  const inputs = document.querySelectorAll('.share-input-card .el-input__inner');
  // 第一个是昵称，第二个是邮箱，第三个是网址
  if (inputs.length >= 2) {
    const emailInput = inputs[1];
    if (!emailInput.value) {
      emailInput.value = 'anonymous@focus.local';
      // 触发 Vue 响应式更新
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
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
