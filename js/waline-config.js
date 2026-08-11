/* ==========================================================================
   觉察归位｜注意力静心训练站 - 学员心得分享区 (Waline 云端评论引擎)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStudentShareSystem();
});

function initStudentShareSystem() {
  const container = document.getElementById('waline');
  if (!container) return;

  const statusBadge = document.getElementById('shareModeStatus');

  // Hide the config bar from students — server URL is managed internally
  const configBanner = document.querySelector('.waline-config-banner');
  if (configBanner) {
    configBanner.style.display = 'none';
  }

  // Internal server URL — not exposed to the front-end UI
  const serverURL = [
    'aHR0cHM6Ly93YWxpbmUtbG9nLnZlcmNlbC5hcHA='
  ].map(s => atob(s)).join('');

  tryInitWalineCloud(container, serverURL, statusBadge);
}

// Verify Server Reachability
async function verifyWalineServer(url) {
  try {
    const res = await fetch(`${url}/api/comment?path=%2Fcommunity.html&pageSize=1`, {
      method: 'GET',
      mode: 'cors'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

// Cloud Waline Engine
async function tryInitWalineCloud(container, serverURL, statusBadge) {
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="share-mode-tag mode-cloud">🔄 正在连接心得系统...</span>`;
  }

  // Pre-flight health check
  const isServerHealthy = await verifyWalineServer(serverURL);

  if (!isServerHealthy) {
    console.warn('Waline server health check failed. The server may be missing database configuration.');
    if (statusBadge) {
      statusBadge.innerHTML = `<span class="share-mode-tag mode-cloud">⚠️ 心得系统维护中</span>`;
    }
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 24px; color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 16px;">🛠️</div>
        <h3 style="font-size: 1.1rem; color: var(--text-dark); margin-bottom: 10px;">心得分享系统正在维护升级中</h3>
        <p style="font-size: 0.93rem; line-height: 1.7; max-width: 440px; margin: 0 auto;">
          系统暂时无法连接，请稍后再试。<br>你的觉察感悟不会丢失，维护完成后即可继续分享。
        </p>
      </div>
    `;
    showToast('心得系统暂时维护中，请稍后再试', 'warning');
    return;
  }

  if (statusBadge) {
    statusBadge.innerHTML = `<span class="share-mode-tag mode-cloud">🌐 云端心得系统已连接</span>`;
  }

  if (window.Waline && typeof window.Waline.init === 'function') {
    try {
      window.Waline.init({
        el: '#waline',
        serverURL: serverURL,
        pageview: false,
        comment: false,
        reaction: false,
        search: false,
        meta: ['nick', 'mail'],
        requiredFields: [],
        wordLimit: 500,
        placeholder: '在此写下你此刻的静心觉察或复盘感悟...（支持匿名留言，温和接纳自我）',
        dark: 'html.dark',
      });
      return;
    } catch (err) {
      console.warn('Waline init failed:', err);
    }
  }

  // Waline SDK failed to load
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="share-mode-tag mode-cloud">⚠️ 心得系统加载异常</span>`;
  }
  container.innerHTML = `
    <div style="text-align: center; padding: 48px 24px; color: var(--text-muted);">
      <div style="font-size: 2.5rem; margin-bottom: 16px;">🍃</div>
      <h3 style="font-size: 1.1rem; color: var(--text-dark); margin-bottom: 10px;">心得系统暂时无法加载</h3>
      <p style="font-size: 0.93rem;">请刷新页面或稍后再试。</p>
    </div>
  `;
  showToast('心得系统加载失败，请刷新页面重试', 'warning');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
