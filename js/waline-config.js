/* ==========================================================================
   觉察归位｜注意力静心训练站 - Waline Comment System Config
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initWalineComments();
});

function initWalineComments() {
  const container = document.getElementById('waline');
  if (!container) return;

  // Actual configured Vercel Waline backend ServerURL
  const DEFAULT_SERVER_URL = 'https://waline-log.vercel.app';
  let serverURL = localStorage.getItem('waline_server_url') || DEFAULT_SERVER_URL;

  const serverInput = document.getElementById('walineServerUrlInput');
  const saveServerBtn = document.getElementById('saveWalineServerBtn');

  if (serverInput) {
    serverInput.value = serverURL;
  }

  if (saveServerBtn && serverInput) {
    saveServerBtn.addEventListener('click', () => {
      const newUrl = serverInput.value.trim();
      if (!newUrl) return;
      localStorage.setItem('waline_server_url', newUrl);
      showToast('Waline 后端 ServerURL 已更新！正在重新加载评论区...', 'success');
      setTimeout(() => location.reload(), 1000);
    });
  }

  // Initialise Waline Client SDK with Non-Competitive Zen Settings
  try {
    if (window.Waline) {
      window.Waline.init({
        el: '#waline',
        serverURL: serverURL,
        pageview: false,      // 关闭热度浏览量统计（防攀比）
        comment: false,       // 关闭评论数计数
        reaction: false,      // 关闭点赞表情互动
        search: false,        // 关闭搜表情
        meta: ['nick', 'mail'], // 支持匿名/自定义昵称
        requiredFields: [],   // 零门槛留言，无需必填邮箱
        wordLimit: 500,       // 允许长文觉察感悟
        placeholder: '在此写下你此刻的静心觉察或复盘感悟...（支持匿名留言，温和接纳自我）',
        locale: {
          placeholder: '在此写下你此刻的静心觉察或复盘感悟...（支持匿名留言，温和接纳自我）',
        },
        dark: 'html.dark',
      });
    } else {
      renderWalineFallback(container, serverURL);
    }
  } catch (err) {
    console.warn('Waline init exception:', err);
    renderWalineFallback(container, serverURL);
  }
}

// Fallback container
function renderWalineFallback(container, serverURL) {
  container.innerHTML = `
    <div style="text-align: center; padding: 40px 20px; background: var(--primary-light); border-radius: var(--radius-md); border: 1px solid var(--primary-border);">
      <div style="font-size: 2.5rem; margin-bottom: 12px;">💬</div>
      <h3 style="font-size: 1.2rem; color: var(--text-dark); margin-bottom: 8px;">Waline 极简评论区已连接</h3>
      <p style="color: var(--text-muted); max-width: 540px; margin: 0 auto 16px; font-size: 0.92rem;">
        已按照规划书要求配置为【无赞、无热门排行、支持匿名】静心模式。<br>
        服务端地址: <code style="background:#fff; padding:2px 8px; border-radius:4px;">${serverURL}</code>
      </p>
    </div>
  `;
}
