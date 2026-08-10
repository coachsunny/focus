/* ==========================================================================
   觉察归位｜注意力静心训练站 - Helper Tools Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initImpulseCardTool();
  initTimerTool();
  initCardDrawTool();
  initEmptinessScoreTool();
  initReflectionTool();
  initRelapseLogTool();
});

/* --------------------------------------------------------------------------
   Tool 1: 30秒冲动觉察三问卡
   -------------------------------------------------------------------------- */
function initImpulseCardTool() {
  const wizardSteps = document.querySelectorAll('#impulseWizard .wizard-step');
  if (!wizardSteps.length) return;

  let currentStep = 0;
  let impulseData = {
    scene: '',
    need: '',
    emotion: ''
  };

  // Step 1: Select Scene
  const sceneBtns = document.querySelectorAll('.scene-opt-btn');
  sceneBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      sceneBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      impulseData.scene = btn.dataset.val || btn.innerText;
      document.getElementById('impulseStep1Next').disabled = false;
    });
  });

  document.getElementById('impulseStep1Next')?.addEventListener('click', () => {
    goToStep(1);
  });

  // Step 2: Select Need & Emotion
  const needBtns = document.querySelectorAll('.need-opt-btn');
  needBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      needBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      impulseData.need = btn.dataset.val;
      checkStep2Ready();
    });
  });

  const emotionBtns = document.querySelectorAll('.emotion-opt-btn');
  emotionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      emotionBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      impulseData.emotion = btn.dataset.val;
      checkStep2Ready();
    });
  });

  function checkStep2Ready() {
    const nextBtn = document.getElementById('impulseStep2Next');
    if (impulseData.need && impulseData.emotion && nextBtn) {
      nextBtn.disabled = false;
    }
  }

  document.getElementById('impulseStep2Next')?.addEventListener('click', () => {
    generateImpulseCard();
    goToStep(2);
  });

  document.getElementById('impulseResetBtn')?.addEventListener('click', () => {
    impulseData = { scene: '', need: '', emotion: '' };
    document.querySelectorAll('.scene-opt-btn, .need-opt-btn, .emotion-opt-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('impulseStep1Next').disabled = true;
    document.getElementById('impulseStep2Next').disabled = true;
    goToStep(0);
  });

  function goToStep(index) {
    wizardSteps.forEach((step, idx) => {
      step.classList.toggle('active', idx === index);
    });
    currentStep = index;
  }

  function generateImpulseCard() {
    const cardResult = document.getElementById('impulseCardResult');
    if (!cardResult) return;

    const actionSuggestions = {
      '身心放松': '尝试闭目养神5分钟、用温水洗把脸或轻柔拉伸。',
      '被理解与共鸣': '给挚友发一条问候，或在《学员心得》区写下此刻真实感受。',
      '掌控生活节奏': '先花2分钟梳理一件微小的待办事项，完成它。',
      '逃避现实压力': '把复杂的大任务拆解为最简单的第一步，只做5分钟。',
      '打发空虚无聊': '允许自己单纯放空，观察身边的一草一木或随手记下灵感。'
    };

    const action = actionSuggestions[impulseData.need] || '做3次深呼吸，感受当下的平静。';

    cardResult.innerHTML = `
      <div style="background: var(--primary-light); border: 2px solid var(--primary-border); padding: 24px; border-radius: var(--radius-md); text-align: left;">
        <div style="color: var(--primary); font-weight: 700; font-size: 1.1rem; margin-bottom: 16px;">🌿 你的专属觉察卡片</div>
        <p style="margin-bottom: 12px;"><strong>当前触发场景：</strong> ${impulseData.scene}</p>
        <p style="margin-bottom: 12px;"><strong>【觉察1】核心真需求：</strong> 我此刻不是想看视频，我真正想要的是：<span style="color: var(--primary); font-weight: 700;">${impulseData.need}</span>。</p>
        <p style="margin-bottom: 12px;"><strong>【觉察2】最煎熬情绪：</strong> 我正在体验 <span style="color: var(--accent); font-weight: 700;">${impulseData.emotion}</span>。刷短视频只能掩盖它，无法治愈它。</p>
        <p style="margin-bottom: 16px; font-weight: 600; color: var(--text-dark);"><strong>【认知重塑】：</strong> 我此刻有未被满足的情绪需求，只是用了低品质的安抚方式，我可以选择更好的方式善待自己。</p>
        <div style="background: #ffffff; padding: 14px; border-radius: var(--radius-sm); border-left: 4px solid var(--primary); color: var(--text-dark);">
          💡 <strong>推荐落地替代动作：</strong> ${action}
        </div>
      </div>
    `;
  }
}

/* --------------------------------------------------------------------------
   Tool 2: 10分钟静心延迟计时器 (冲动急救)
   -------------------------------------------------------------------------- */
function initTimerTool() {
  const timerDisplay = document.getElementById('timerDisplay');
  if (!timerDisplay) return;

  const startBtn = document.getElementById('timerStartBtn');
  const pauseBtn = document.getElementById('timerPauseBtn');
  const resetBtn = document.getElementById('timerResetBtn');
  const soundToggle = document.getElementById('soundToggleBtn');
  const pulseCircle = document.getElementById('pulseCircle');
  const taskRecommendation = document.getElementById('timerTaskRecommendation');

  let timeLeft = 600; // 10 minutes in seconds
  let timerInterval = null;
  let isRunning = false;
  let audioCtx = null;
  let soundEnabled = false;

  const quickTasks = [
    '☕ 喝一杯温水，站立拉伸肩颈 3 分钟',
    '🌿 走到窗前，眺望远方，做 5 次深呼吸',
    '🧹 简单整理书桌，或叠好两件衣服',
    '🧘 闭上眼睛，放空大脑，纯粹休息 10 分钟',
    '📝 拿出纸笔，随手写下此刻脑海中的 3 个杂念',
    '🚶 在室内缓慢散步 50 步，感受双脚触地的真实感'
  ];

  function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function getRandomTask() {
    const randomIdx = Math.floor(Math.random() * quickTasks.length);
    if (taskRecommendation) {
      taskRecommendation.innerText = quickTasks[randomIdx];
    }
  }

  getRandomTask();

  startBtn.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    pulseCircle.classList.add('breathing');

    if (soundEnabled && !audioCtx) {
      initAmbientSound();
    }

    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        pulseCircle.classList.remove('breathing');
        showToast('🎉 10分钟静心延迟已完成！冲动峰值已过去，你做得很好。', 'success');
        startBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    pulseCircle.classList.remove('breathing');
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 600;
    updateDisplay();
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    pulseCircle.classList.remove('breathing');
    getRandomTask();
  });

  soundToggle?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('btn-primary', soundEnabled);
    soundToggle.classList.toggle('btn-secondary', !soundEnabled);
    soundToggle.innerText = soundEnabled ? '🔔 疗愈音效：开启' : '🔕 疗愈音效：静音';
    if (soundEnabled && isRunning && !audioCtx) {
      initAmbientSound();
    }
  });

  // Web Audio API Peaceful Ambient Sound Generator
  function initAmbientSound() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, audioCtx.currentTime); // 432Hz Solfeggio frequency
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
    } catch (e) {
      console.log('Audio Context error', e);
    }
  }
}

/* --------------------------------------------------------------------------
   Tool 3: 七大心理需求替代抽卡器
   -------------------------------------------------------------------------- */
function initCardDrawTool() {
  const drawBtn = document.getElementById('drawCardBtn');
  const cardDisplay = document.getElementById('drawnCardDisplay');
  if (!drawBtn || !cardDisplay) return;

  const cards = [
    {
      title: '躯体生存需求',
      icon: '🛋️',
      trueNeed: '身心深度放松、缓解躯体疲劳',
      fakeSatisfaction: '被动刷短视频、感官声光高频刺激',
      realReplacement: '关闭屏幕，闭目静坐、听舒缓纯音乐、温水淋浴散步',
      quote: '真正的放松是让大脑静下来，而不是用新的噪音轰炸神经。'
    },
    {
      title: '多维安全需求',
      icon: '🛡️',
      trueNeed: '掌控生活秩序、平息现实焦虑',
      fakeSatisfaction: '看避坑科普、成功学鸡汤、获取虚假心理慰藉',
      realReplacement: '动手完成一件微小确定的事（整理书桌/列待办/清点物品）',
      quote: '虚假的安心来自接收信息，真实的掌控来自微小行动。'
    },
    {
      title: '归属连接需求',
      icon: '🤝',
      trueNeed: '被理解、深度陪伴、告别孤独感',
      fakeSatisfaction: '看热闹评论区、单向崇拜网红、弹幕共情',
      realReplacement: '与挚友真诚谈心，或在静心社群匿名倾诉真实心声',
      quote: '一万个陌生人的点赞，抵不过一次真实的倾听。'
    },
    {
      title: '自主主权需求',
      icon: '⚓',
      trueNeed: '掌控个人时间与生活主导权',
      fakeSatisfaction: '随意划动切换内容的虚假自由',
      realReplacement: '主动规划接下来30分钟的具体安排，自主决定何时休息',
      quote: '被算法牵着走不是自由，能主动停下来才是主权。'
    },
    {
      title: '认同价值需求',
      icon: '✨',
      trueNeed: '自我肯定、内在尊严与价值感',
      fakeSatisfaction: '追逐社交点赞、粉丝数字、围观热点',
      realReplacement: '记录今日做成的1件小事，给予自己真诚的赞美',
      quote: '你的价值无需数字定义，接纳当下的自己即是圆满。'
    },
    {
      title: '胜任成长需求',
      icon: '🌱',
      trueNeed: '能力提升、落地学习与真实进步',
      fakeSatisfaction: '收藏干货视频、碎片知识速成（收藏即学会错觉）',
      realReplacement: '精读一篇长文，动手实践一个案例，并写下3句复盘',
      quote: '收藏夹填不满焦虑，动手输出才能扎根。'
    },
    {
      title: '意义超越需求',
      icon: '🌌',
      trueNeed: '找到生活热忱、人生方向与内在平静',
      fakeSatisfaction: '看各类传奇人生切片、围观他人故事',
      realReplacement: '专注于当下生活细节，体验一顿饭、一杯茶的真实质感',
      quote: '不必在别人的故事里流浪，在自己的真实生活里归位。'
    }
  ];

  drawBtn.addEventListener('click', () => {
    cardDisplay.style.opacity = '0';
    cardDisplay.style.transform = 'scale(0.95)';

    setTimeout(() => {
      const card = cards[Math.floor(Math.random() * cards.length)];
      cardDisplay.innerHTML = `
        <div style="background: var(--bg-card); border: 2px solid var(--primary-border); border-radius: var(--radius-md); padding: 28px; box-shadow: var(--shadow-md); text-align: left;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 1.8rem;">${card.icon}</span>
            <span style="background: var(--primary-light); color: var(--primary); padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600;">需求抽卡</span>
          </div>
          <h3 style="font-size: 1.3rem; color: var(--text-dark); margin-bottom: 16px;">${card.title}</h3>
          <div style="margin-bottom: 12px;">
            <span style="color: var(--primary); font-weight: 700;">🌱 真实底层需求：</span> ${card.trueNeed}
          </div>
          <div style="margin-bottom: 12px; color: #a35d25;">
            <span>⚠️ 短视频假性代偿：</span> ${card.fakeSatisfaction}
          </div>
          <div style="margin-bottom: 20px; background: var(--primary-light); padding: 14px; border-radius: var(--radius-sm); border-left: 4px solid var(--primary);">
            <strong style="color: var(--primary);">💡 真实治愈替代方案：</strong> ${card.realReplacement}
          </div>
          <p style="font-style: italic; color: var(--text-muted); font-size: 0.9rem; text-align: center; border-top: 1px dashed var(--border-color); padding-top: 14px;">
            “ ${card.quote} ”
          </p>
        </div>
      `;
      cardDisplay.style.opacity = '1';
      cardDisplay.style.transform = 'scale(1)';
    }, 200);
  });
}

/* --------------------------------------------------------------------------
   Tool 4: 情绪空虚度打分器
   -------------------------------------------------------------------------- */
function initEmptinessScoreTool() {
  const calcBtn = document.getElementById('calcScoreBtn');
  const resultBox = document.getElementById('emptinessResult');
  if (!calcBtn || !resultBox) return;

  calcBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.emptiness-check:checked');
    const score = checkboxes.length * 20; // 0 to 100

    let levelTitle = '';
    let levelDesc = '';
    let color = '';

    if (score <= 20) {
      color = '#3b7a69';
      levelTitle = '🌿 状态极佳｜内心平静充实';
      levelDesc = '你的注意力主权非常稳固，处于有意识的生活状态中。继续保持觉察即可。';
    } else if (score <= 60) {
      color = '#c8834c';
      levelTitle = '🌤️ 轻度疲惫｜存在微小心理缺口';
      levelDesc = '你当下可能感到些许疲惫或无聊，大脑在试探性寻求低成本刺激。推荐做10分钟静心延迟或喝杯温水。';
    } else {
      color = '#b84a39';
      levelTitle = '🌧️ 高度空虚代偿期｜身心极度耗竭';
      levelDesc = '你正处于身心疲惫或逃避压力的关键阶段。请绝对不要自责！此时刷手机是神经系统的保护本能，建议立刻放下手机闭目养神。';
    }

    resultBox.innerHTML = `
      <div style="background: var(--bg-card); border-left: 5px solid ${color}; border-radius: var(--radius-md); padding: 24px; box-shadow: var(--shadow-sm); margin-top: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h4 style="font-size: 1.15rem; color: var(--text-dark);">${levelTitle}</h4>
          <span style="font-size: 1.4rem; font-weight: 800; color: ${color};">${score} 分</span>
        </div>
        <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.7;">${levelDesc}</p>
      </div>
    `;
    resultBox.style.display = 'block';
  });
}

/* --------------------------------------------------------------------------
   Tool 5: 每日5分钟复盘模板
   -------------------------------------------------------------------------- */
function initReflectionTool() {
  const saveBtn = document.getElementById('saveReflectionBtn');
  const copyBtn = document.getElementById('copyReflectionBtn');
  const historyList = document.getElementById('reflectionHistory');
  if (!saveBtn) return;

  loadHistory();

  saveBtn.addEventListener('click', () => {
    const scene = document.getElementById('refScene')?.value.trim();
    const need = document.getElementById('refNeed')?.value.trim();
    const feeling = document.getElementById('refFeeling')?.value.trim();
    const action = document.getElementById('refAction')?.value.trim();

    if (!scene || !need) {
      showToast('请至少填写高频场景与背后真需求', 'warning');
      return;
    }

    const entry = {
      date: new Date().toLocaleDateString('zh-CN'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      scene,
      need,
      feeling,
      action
    };

    const history = JSON.parse(localStorage.getItem('focus_reflections') || '[]');
    history.unshift(entry);
    localStorage.setItem('focus_reflections', JSON.stringify(history));

    showToast('✨ 今日觉察复盘已保存！', 'success');
    clearInputs();
    loadHistory();
  });

  copyBtn?.addEventListener('click', () => {
    const scene = document.getElementById('refScene')?.value.trim() || '下班刷手机';
    const need = document.getElementById('refNeed')?.value.trim() || '身心放松';
    const feeling = document.getElementById('refFeeling')?.value.trim() || '大脑空虚亢奋';
    const action = document.getElementById('refAction')?.value.trim() || '睡前听轻音乐';

    const text = `【每日5分钟觉察复盘】\n📅 日期：${new Date().toLocaleDateString('zh-CN')}\n1. 高频刷机场景：${scene}\n2. 背后未满足真需求：${need}\n3. 短视频假满足与空洞感：${feeling}\n4. 明日替代行动：${action}`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 复盘文本已复制到剪贴板', 'success');
    });
  });

  function clearInputs() {
    ['refScene', 'refNeed', 'refFeeling', 'refAction'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  function loadHistory() {
    if (!historyList) return;
    const history = JSON.parse(localStorage.getItem('focus_reflections') || '[]');
    if (!history.length) {
      historyList.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">暂无历史复盘，完成下方表格即可记录。</p>';
      return;
    }

    historyList.innerHTML = history.slice(0, 5).map(item => `
      <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
          <span>📅 ${item.date} ${item.time}</span>
          <span style="color: var(--primary); font-weight: 600;">真需求：${item.need}</span>
        </div>
        <p style="font-size: 0.92rem; color: var(--text-dark);"><strong>场景：</strong>${item.scene}</p>
        <p style="font-size: 0.92rem; color: var(--primary); margin-top: 4px;"><strong>明日替代：</strong>${item.action}</p>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   Tool 6: 复发接纳日志记录工具
   -------------------------------------------------------------------------- */
function initRelapseLogTool() {
  const logBtn = document.getElementById('logRelapseBtn');
  const historyBox = document.getElementById('relapseHistory');
  if (!logBtn) return;

  loadRelapseLogs();

  logBtn.addEventListener('click', () => {
    const duration = document.getElementById('relapseDuration')?.value || '30分钟';
    const reason = document.getElementById('relapseReason')?.value.trim() || '未特别觉察';

    const log = {
      date: new Date().toLocaleDateString('zh-CN'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration,
      reason
    };

    const history = JSON.parse(localStorage.getItem('focus_relapses') || '[]');
    history.unshift(log);
    localStorage.setItem('focus_relapses', JSON.stringify(history));

    showToast('💚 复发已温柔接纳，不必自责，重新归位即可。', 'success');
    loadRelapseLogs();
  });

  function loadRelapseLogs() {
    if (!historyBox) return;
    const history = JSON.parse(localStorage.getItem('focus_relapses') || '[]');
    if (!history.length) {
      historyBox.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">暂无复发记录。记住：复发是改变的正常过程。</p>';
      return;
    }

    historyBox.innerHTML = history.slice(0, 5).map(item => `
      <div style="background: var(--primary-light); border-left: 4px solid var(--primary); padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 10px;">
        <div style="font-size: 0.85rem; color: var(--primary); margin-bottom: 4px; font-weight: 600;">
          🕒 ${item.date} ${item.time} （约 ${item.duration}）
        </div>
        <div style="font-size: 0.92rem; color: var(--text-dark);">
          觉察要因：${item.reason}
        </div>
      </div>
    `).join('');
  }
}
