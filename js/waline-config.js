/* ==========================================================================
   觉察归位｜注意力静心训练站 - 学员心得分享区 (Waline + 本地双引擎)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStudentShareSystem();
});

// Preset seed student posts for initial warm ambiance
const INITIAL_SEED_POSTS = [
  {
    id: 'seed-1',
    nick: '静心觉察者',
    avatar: '🌿',
    tag: '💡 突破體悟',
    content: '今天刷短视频刷到第4个视频时突然停下了，第一次感受到了手指停在半空中的顿悟感。我没有怪罪自己，只是对自己说：“原来我又在逃避写报告的焦虑了。” 闭眼深呼吸3次后关掉手机，去泡了一杯温水。',
    time: '2 小时前',
    timestamp: Date.now() - 3600 * 2000
  },
  {
    id: 'seed-2',
    nick: '云淡风轻',
    avatar: '🧘',
    tag: '🌿 靜心覺察',
    content: '复盘了一下昨晚复发的原因：连续工作6个小时没有休息，身体极度疲惫，大脑本能地想找低成本多巴胺代偿。觉察到这一点后，今晚我允许自己早睡30分钟，给身体足够的休养。',
    time: '5 小时前',
    timestamp: Date.now() - 3600 * 5000
  },
  {
    id: 'seed-3',
    nick: '归位小木屋',
    avatar: '🌊',
    tag: '🌊 復盤感悟',
    content: '以前每次掉进信息流都有深深的自责感，越自责越想继续刷。今天用了手册里的【复发接纳四步法】，主动对自己说“接纳复发，温和归位”，心情一下子平静了下来。',
    time: '1 天前',
    timestamp: Date.now() - 3600 * 24000
  }
];

function initStudentShareSystem() {
  const container = document.getElementById('waline');
  if (!container) return;

  const serverInput = document.getElementById('walineServerUrlInput');
  const saveServerBtn = document.getElementById('saveWalineServerBtn');
  const statusBadge = document.getElementById('shareModeStatus');

  const DEFAULT_SERVER_URL = 'https://waline-log.vercel.app';
  let serverURL = localStorage.getItem('waline_server_url') || DEFAULT_SERVER_URL;

  if (serverInput) {
    serverInput.value = serverURL;
  }

  // Handle server save / switch
  if (saveServerBtn && serverInput) {
    saveServerBtn.addEventListener('click', async () => {
      const newUrl = serverInput.value.trim().replace(/\/+$/, '');
      if (!newUrl) {
        localStorage.setItem('waline_server_url', '');
        showToast('已切换至免部署·本地静心模式', 'info');
        setTimeout(() => location.reload(), 600);
        return;
      }

      showToast('正在验证 Waline 后端连线...', 'info');
      const isOk = await verifyWalineServer(newUrl);
      if (isOk) {
        localStorage.setItem('waline_server_url', newUrl);
        showToast('Waline 伺服器连线成功！正在更新评论区...', 'success');
        setTimeout(() => location.reload(), 800);
      } else {
        showToast('无法连接到该 Waline 后端，请检查 ServerURL 地址', 'warning');
      }
    });
  }

  // Decide mode: Cloud Waline vs Local Share Engine
  if (serverURL) {
    tryInitWalineCloud(container, serverURL, statusBadge);
  } else {
    renderLocalShareEngine(container, statusBadge);
  }
}

// Verify Server Reachability
async function verifyWalineServer(url) {
  try {
    const res = await fetch(`${url}/api/comment?path=%2Fcommunity.html&pageSize=1`, {
      method: 'GET',
      mode: 'cors'
    });
    return res.ok || res.status === 200 || res.status === 304;
  } catch (err) {
    return false;
  }
}

// Cloud Waline Engine
async function tryInitWalineCloud(container, serverURL, statusBadge) {
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="share-mode-tag mode-cloud">🔄 正在连接 Waline 伺服器...</span>`;
  }

  // Pre-flight health check to detect Vercel 500 FUNCTION_INVOCATION_FAILED (missing DB config)
  const isServerHealthy = await verifyWalineServer(serverURL);

  if (!isServerHealthy) {
    console.warn('Waline server check failed (likely Vercel 500 FUNCTION_INVOCATION_FAILED due to missing DB env variables).');
    showToast('Waline 雲端伺服器未完成資料庫設定 (500 Error)，已自動切換為本地靜心模式', 'warning');
    renderLocalShareEngine(container, statusBadge, true);
    return;
  }

  if (statusBadge) {
    statusBadge.innerHTML = `<span class="share-mode-tag mode-cloud">🌐 Waline 雲端模式 (${escapeHtml(serverURL)})</span>`;
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

  // Fallback to local if cloud fails
  showToast('Waline 无法连接，已自动切换为本地静心分享模式', 'warning');
  renderLocalShareEngine(container, statusBadge, true);
}

// Native Local Student Share Engine (Zero-Backend)
function renderLocalShareEngine(container, statusBadge, wasFallback = false) {
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="share-mode-tag mode-local">🟢 免部署·本地靜心模式${wasFallback ? ' (雲端未連線)' : ''}</span>`;
  }

  container.innerHTML = `
    <div class="local-share-container">
      <div class="card local-share-box" style="margin-bottom: 28px;">
        <h3 style="font-size: 1.15rem; color: var(--primary); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <span>✍️ 写下你的静心觉察心得</span>
          <button type="button" class="btn-text-action" id="useTemplateBtn">✨ 套用覺察模板</button>
        </h3>
        
        <form id="localShareForm">
          <div class="share-form-row">
            <div class="share-form-group">
              <label class="form-label">昵称 (支持匿名)</label>
              <input type="text" id="shareNickInput" class="form-input" placeholder="例如：静心觉察者 / 匿名" value="静心觉察者" maxlength="20" required>
            </div>
            
            <div class="share-form-group">
              <label class="form-label">选择头像标识</label>
              <select id="shareAvatarSelect" class="form-input">
                <option value="🌿">🌿 舒缓幼苗</option>
                <option value="🧘">🧘 静心归位</option>
                <option value="🌊">🌊 柔和水流</option>
                <option value="💡">💡 觉察顿悟</option>
                <option value="🕊️">🕊️ 自由和平</option>
              </select>
            </div>

            <div class="share-form-group">
              <label class="form-label">心得分类</label>
              <select id="shareTagSelect" class="form-input">
                <option value="🌿 靜心覺察">🌿 靜心覺察</option>
                <option value="💡 突破體悟">💡 突破體悟</option>
                <option value="🌊 復盤感悟">🌊 復盤感悟</option>
                <option value="❓ 困惑傾訴">❓ 困惑傾訴</option>
              </select>
            </div>
          </div>

          <div class="share-form-group" style="margin-top: 14px;">
            <label class="form-label">觉察心得感悟 (支持长文复盘，最长500字)</label>
            <textarea id="shareContentInput" class="form-input" rows="4" placeholder="在此写下你此刻的静心觉察、突破心境或复盘体悟...（无点赞、去攀比，真实表达即可）" maxlength="500" required></textarea>
          </div>

          <div class="share-form-actions" style="margin-top: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <span class="text-muted-sm" id="charCounter">0 / 500 字</span>
            <div style="display: flex; gap: 10px;">
              <button type="button" id="resetLocalSharesBtn" class="btn btn-secondary-sm" style="font-size: 0.85rem; color: var(--text-muted);">重设默认数据</button>
              <button type="submit" class="btn btn-primary">🕊️ 发布觉察心得</button>
            </div>
          </div>
        </form>
      </div>

      <div class="local-shares-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h3 style="font-size: 1.1rem; color: var(--text-dark);">💬 学员心得交流区 (<span id="localShareCount">0</span>)</h3>
        <span style="font-size: 0.85rem; color: var(--text-muted);">按发布时间倒序</span>
      </div>

      <div id="localSharesList" class="local-shares-list"></div>
    </div>
  `;

  bindLocalShareEvents();
  renderLocalSharesList();
}

function bindLocalShareEvents() {
  const form = document.getElementById('localShareForm');
  const contentInput = document.getElementById('shareContentInput');
  const charCounter = document.getElementById('charCounter');
  const templateBtn = document.getElementById('useTemplateBtn');
  const resetBtn = document.getElementById('resetLocalSharesBtn');

  if (contentInput && charCounter) {
    contentInput.addEventListener('input', () => {
      charCounter.innerText = `${contentInput.value.length} / 500 字`;
    });
  }

  if (templateBtn && contentInput) {
    templateBtn.addEventListener('click', () => {
      contentInput.value = `【触发情境】：刚才在进行……\n【身体感受】：感觉到颈部紧张，呼吸有些急促。\n【觉察归位】：意识到自己正在逃避……，选择暂停5分钟，给注意力一个温和的落脚点。`;
      contentInput.focus();
      if (charCounter) charCounter.innerText = `${contentInput.value.length} / 500 字`;
      showToast('已套用觉察模板', 'success');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('确定恢复预设学员心得数据吗？')) {
        localStorage.setItem('local_student_shares', JSON.stringify(INITIAL_SEED_POSTS));
        renderLocalSharesList();
        showToast('已恢复预设学员心得数据', 'info');
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nick = document.getElementById('shareNickInput').value.trim() || '匿名觉察者';
      const avatar = document.getElementById('shareAvatarSelect').value || '🌿';
      const tag = document.getElementById('shareTagSelect').value || '🌿 靜心覺察';
      const content = contentInput.value.trim();

      if (!content) {
        showToast('请输入心得感悟内容', 'warning');
        return;
      }

      const newPost = {
        id: 'post-' + Date.now(),
        nick: nick,
        avatar: avatar,
        tag: tag,
        content: content,
        time: '刚刚',
        timestamp: Date.now()
      };

      const shares = getLocalShares();
      shares.unshift(newPost);
      localStorage.setItem('local_student_shares', JSON.stringify(shares));

      contentInput.value = '';
      if (charCounter) charCounter.innerText = '0 / 500 字';

      renderLocalSharesList();
      showToast('心得发布成功！已沉淀在本地', 'success');
    });
  }
}

function getLocalShares() {
  const saved = localStorage.getItem('local_student_shares');
  if (!saved) {
    localStorage.setItem('local_student_shares', JSON.stringify(INITIAL_SEED_POSTS));
    return INITIAL_SEED_POSTS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return INITIAL_SEED_POSTS;
  }
}

function renderLocalSharesList() {
  const listContainer = document.getElementById('localSharesList');
  const countSpan = document.getElementById('localShareCount');
  if (!listContainer) return;

  const shares = getLocalShares();
  if (countSpan) countSpan.innerText = shares.length;

  if (shares.length === 0) {
    listContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px; color: var(--text-muted);">
        🍃 暂无学员心得，欢迎成为第一个留言倾诉的静心者！
      </div>
    `;
    return;
  }

  listContainer.innerHTML = shares.map(share => `
    <div class="card local-share-item" style="margin-bottom: 16px; transition: var(--transition-fast);">
      <div class="share-item-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.4rem; background: var(--primary-light); width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--radius-full);">${escapeHtml(share.avatar || '🌿')}</span>
          <div>
            <strong style="font-size: 0.95rem; color: var(--text-dark);">${escapeHtml(share.nick)}</strong>
            <span class="share-item-tag" style="margin-left: 8px; font-size: 0.78rem; padding: 2px 8px; background: var(--primary-light); color: var(--primary); border-radius: 4px; font-weight: 500;">${escapeHtml(share.tag || '🌿 靜心覺察')}</span>
          </div>
        </div>
        <span style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(share.time || getRelativeTime(share.timestamp))}</span>
      </div>
      <div class="share-item-body" style="font-size: 0.94rem; color: var(--text-main); line-height: 1.7; white-space: pre-wrap;">${escapeHtml(share.content)}</div>
    </div>
  `).join('');
}

function getRelativeTime(timestamp) {
  if (!timestamp) return '过去';
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
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
