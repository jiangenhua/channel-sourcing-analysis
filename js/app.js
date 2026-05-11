/**
 * 漫游数据源盘点 - App 主逻辑
 * - KPI 渲染、Top 表格、漏斗、维度建议、Tab 切换
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== 1. KPI cards =====
  renderKPIs();

  // ===== 2. Charts =====
  registerChart(renderDurationChart());
  registerChart(renderResolutionChart());
  registerChart(renderOrientationChart());
  registerChart(renderResTierChart());
  registerChart(renderFramerateChart());
  registerChart(renderSourceChart());
  registerChart(renderCategoryChart());
  renderEngagementBuckets();
  registerChart(renderEngagementHeatmap());
  registerChart(renderScatterChart());
  registerChart(renderRadarChart());

  // ===== 3. Top 榜单 =====
  initTopRanking();

  // ===== 4. 评分体系 =====
  renderScoringRubric();
  initChannelRadarSelect();

  // ===== 5. 筛选漏斗 =====
  renderFunnel();

  // ===== 6. 推荐维度 =====
  renderRecommendDims();

  // ===== 7. 平滑 scroll + 当前 section 高亮 =====
  initScrollSpy();

  // 兜底 resize
  setTimeout(resizeAllCharts, 200);
});

// =====================================================
// 1. KPI cards
// =====================================================
function renderKPIs() {
  const grid = document.getElementById('kpi-grid');
  if (!grid) return;
  const toneClass = {
    primary: 'from-brand-500/20 to-purple-500/10 border-brand-400/40',
    good:    'from-emerald-500/15 to-emerald-500/5 border-emerald-400/40',
    warn:    'from-amber-500/15 to-amber-500/5 border-amber-400/40',
    neutral: 'from-ink-700/30 to-ink-800/10 border-white/8',
  };
  const toneText = {
    primary: 'text-brand-200',
    good:    'text-emerald-300',
    warn:    'text-amber-300',
    neutral: 'text-ink-200',
  };

  grid.innerHTML = KPIS.map(k => `
    <div class="glass p-4 bg-gradient-to-br ${toneClass[k.tone] || toneClass.neutral} border">
      <div class="text-xs ${toneText[k.tone] || 'text-ink-300'} uppercase tracking-wider mb-1">${k.label}</div>
      <div class="kpi-num text-2xl md:text-3xl font-bold text-white">${k.value}</div>
      <div class="text-xs text-ink-300 mt-1">${k.sub}</div>
    </div>
  `).join('');
}

// =====================================================
// 2. Top 榜单
// =====================================================
let currentDim = 'play';
let currentCat = '__all__';

function initTopRanking() {
  // Tab
  const tabs = document.querySelectorAll('#top-dim-tabs .dim-tab');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      currentDim = t.dataset.dim;
      renderCategoryFilter();
      renderTopTable();
    });
  });

  // Style for active tab (add via JS)
  const style = document.createElement('style');
  style.textContent = `
    .dim-tab           { color: #a3b0c7; }
    .dim-tab:hover     { color: #fff; }
    .dim-tab.active    { background: linear-gradient(90deg, #379ff9, #c084fc); color: white; }
    .cat-chip          { cursor: pointer; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.06); color: #cdd6e4; font-size: 11px; border: 1px solid transparent; transition: all 0.2s ease; }
    .cat-chip:hover    { background: rgba(125, 192, 252, 0.18); color: #fff; }
    .cat-chip.active   { background: linear-gradient(90deg, rgba(125,192,252,0.4), rgba(192,132,252,0.4)); color: #fff; border-color: rgba(125,192,252,0.5); }
  `;
  document.head.appendChild(style);

  renderCategoryFilter();
  renderTopTable();
}

function getDimData() {
  switch (currentDim) {
    case 'play':
      // 把 TOP_BY_PLAY 摊平
      return Object.entries(TOP_BY_PLAY).flatMap(([cat, list]) =>
        list.map(r => ({ category: cat, ...r }))
      );
    case 'engagement':
      return TOP_BY_ENGAGEMENT.slice();
    case 'comment':
      return TOP_BY_COMMENT_RATE.slice();
    case 'follower':
      return TOP_BY_FOLLOWER.slice();
    default:
      return [];
  }
}

function getAllCategories() {
  const rows = getDimData();
  return [...new Set(rows.map(r => r.category))];
}

function renderCategoryFilter() {
  const el = document.getElementById('cat-filter');
  if (!el) return;
  const cats = ['__all__', ...getAllCategories()];
  el.innerHTML = cats.map(c => {
    const label = c === '__all__' ? '全部' : c;
    const active = c === currentCat ? 'active' : '';
    return `<button class="cat-chip ${active}" data-cat="${c}">${label}</button>`;
  }).join('');
  el.querySelectorAll('.cat-chip').forEach(b => {
    b.addEventListener('click', () => {
      currentCat = b.dataset.cat;
      el.querySelectorAll('.cat-chip').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderTopTable();
    });
  });
}

function renderTopTable() {
  const thead = document.getElementById('top-thead');
  const tbody = document.getElementById('top-tbody');
  if (!thead || !tbody) return;

  const headersByDim = {
    play: ['#', '类目', 'Channel', '总播放', '视频数', '1080p%', '60s+%', '180s+%', '质量'],
    engagement: ['#', '类目', 'Channel', '总点赞', '视频数', 'Like/100Play', '1080p%', '质量'],
    comment: ['#', '类目', 'Channel', '总评论', '视频数', 'Cmt/1kPlay', 'Cmt Share%', '类型'],
    follower: ['#', '类目', 'Channel', '粉丝', '视频数', '总播放', 'Play/Follower', 'Engagement%'],
  };
  thead.innerHTML = `<tr>${headersByDim[currentDim].map(h => `<th>${h}</th>`).join('')}</tr>`;

  let rows = getDimData();
  if (currentCat !== '__all__') {
    rows = rows.filter(r => r.category === currentCat);
  }
  // 排序
  const sortKey = { play: 'total', engagement: 'total_like', comment: 'total_comment', follower: 'follower' }[currentDim];
  rows.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  tbody.innerHTML = rows.map((r, i) => renderRow(r, i + 1)).join('');
}

function renderRow(r, i) {
  // 计算简单的 channel score (rough heuristic)
  const score = computeQuickScore(r);
  const tone = score >= 70 ? 'tier-high' : score >= 50 ? 'tier-mid' : 'tier-low';

  switch (currentDim) {
    case 'play':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${r.channel}</td>
        <td class="num">${fmtBig(r.total)}</td>
        <td class="num">${fmtInt(r.video_cnt)}</td>
        <td class="num">${r.res_1080p?.toFixed?.(1) || '—'}%</td>
        <td class="num">${r.dur_60s?.toFixed?.(1) || '—'}%</td>
        <td class="num">${r.dur_180s?.toFixed?.(1) || '—'}%</td>
        <td>${renderQuality(score, tone)}</td>
      </tr>`;
    case 'engagement':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${r.channel}</td>
        <td class="num">${fmtBig(r.total_like)}</td>
        <td class="num">${fmtInt(r.video_cnt)}</td>
        <td class="num"><span class="text-emerald-300 font-mono">${r.like_per_100play?.toFixed?.(2) || '—'}</span></td>
        <td class="num">${r.res_1080p?.toFixed?.(1) || '—'}%</td>
        <td>${renderQuality(score, tone)}</td>
      </tr>`;
    case 'comment':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${r.channel}</td>
        <td class="num">${fmtBig(r.total_comment)}</td>
        <td class="num">${fmtInt(r.video_cnt)}</td>
        <td class="num"><span class="text-amber-300 font-mono">${r.comment_per_1k_play?.toFixed?.(2) || '—'}</span></td>
        <td class="num">${r.comment_share_pct?.toFixed?.(2) || '—'}%</td>
        <td>${commentTypeLabel(r.comment_share_pct, r.comment_per_1k_play)}</td>
      </tr>`;
    case 'follower':
      const playStr = r.total_play ? fmtBig(r.total_play) : '—';
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${r.channel}</td>
        <td class="num font-semibold text-brand-300">${fmtBig(r.follower)}</td>
        <td class="num">${fmtInt(r.video_cnt)}</td>
        <td class="num">${playStr}</td>
        <td class="num">${followerHealthLabel(r.avg_play_per_follower)}</td>
        <td class="num">${r.engagement_rate?.toFixed?.(2) || '—'}%</td>
      </tr>`;
  }
}

function renderQuality(score, tone) {
  return `<span class="tier-pill ${tone}">${score}/100</span>`;
}

function commentTypeLabel(share, rate) {
  if (share == null) return '<span class="tier-pill tier-noise">未知</span>';
  if (share > 30 || rate > 50) return '<span class="tier-pill tier-noise">争议/宗教刷量</span>';
  if (share > 12) return '<span class="tier-pill tier-mid">讨论型</span>';
  if (share > 5)  return '<span class="tier-pill tier-high">信息型</span>';
  return '<span class="tier-pill tier-low">情绪/点赞型</span>';
}

function followerHealthLabel(v) {
  if (v == null) return '—';
  const pct = (v * 100).toFixed(2) + '%';
  if (v >= 0.10) return `<span class="text-emerald-300 font-mono">${pct}</span>`;
  if (v >= 0.03) return `<span class="text-amber-300  font-mono">${pct}</span>`;
  return `<span class="text-rose-300 font-mono">${pct} 沉淀</span>`;
}

// 粗暴打分: 各维度可得分项加和
function computeQuickScore(r) {
  let score = 0;
  // 分辨率
  if (r.res_1080p != null) {
    if (r.res_1080p >= 80) score += 20;
    else if (r.res_1080p >= 60) score += 15;
    else if (r.res_1080p >= 40) score += 10;
    else score += 3;
  } else { score += 12; }
  // 时长 ≥60s
  if (r.dur_60s != null) {
    if (r.dur_60s >= 70) score += 15;
    else if (r.dur_60s >= 50) score += 12;
    else if (r.dur_60s >= 30) score += 6;
  } else { score += 8; }
  // 视频数
  if (r.video_cnt != null) {
    if (r.video_cnt >= 200) score += 10;
    else if (r.video_cnt >= 50) score += 8;
    else if (r.video_cnt >= 20) score += 4;
  }
  // 粉丝
  if (r.follower != null) {
    if (r.follower >= 100000) score += 10;
    else if (r.follower >= 10000) score += 6;
    else if (r.follower >= 1000) score += 3;
  } else { score += 8; }
  // engagement
  if (r.engagement_rate != null) {
    if (r.engagement_rate >= 3) score += 15;
    else if (r.engagement_rate >= 2) score += 10;
    else if (r.engagement_rate >= 1) score += 5;
  } else { score += 7; }
  // like_per_100play
  if (r.like_per_100play != null) {
    if (r.like_per_100play >= 5) score += 10;
    else if (r.like_per_100play >= 3) score += 7;
    else if (r.like_per_100play >= 1) score += 3;
  } else { score += 5; }
  // avg_play_per_follower
  if (r.avg_play_per_follower != null) {
    if (r.avg_play_per_follower >= 0.10 && r.avg_play_per_follower < 3.0) score += 10;
    else if (r.avg_play_per_follower >= 0.03) score += 6;
    else if (r.avg_play_per_follower > 0) score += 1;
  } else { score += 5; }
  // 类目偏好
  const highCats = ['Travel', 'Education', 'Sports', 'Autos', 'Pets', 'Howto', 'Science', 'Food', 'Family'];
  if (highCats.some(c => (r.category || '').includes(c))) score += 10;
  else if ((r.category || '').includes('Entertainment') || (r.category || '').includes('Music') || (r.category || '').includes('Comedy') || (r.category || '').includes('News')) score += 6;
  else score += 2;
  return Math.min(100, score);
}

// =====================================================
// 4. 评分体系: 表格 + Sample channel 单选
// =====================================================
function renderScoringRubric() {
  const tbody = document.getElementById('rubric-tbody');
  if (!tbody) return;
  tbody.innerHTML = QUALITY_DIMENSIONS.map(d => `
    <tr>
      <td class="font-semibold"><span class="tier-pill tier-high">${d.dim}</span></td>
      <td><code class="text-xs text-brand-300">${d.field}</code></td>
      <td><span class="text-emerald-300 font-mono">${d.s.label}</span></td>
      <td><span class="text-amber-300  font-mono">${d.a.label}</span></td>
      <td><span class="text-orange-300 font-mono">${d.b.label}</span></td>
      <td><span class="text-rose-300   font-mono">${d.c.label}</span></td>
      <td class="num font-bold text-brand-300">${(d.weight * 100).toFixed(0)}%</td>
    </tr>
  `).join('');
}

function initChannelRadarSelect() {
  const sel = document.getElementById('channel-select');
  if (!sel) return;
  const channels = Object.keys(CHANNEL_SCORE_SAMPLES);
  sel.innerHTML = channels.map(c => `<option value="${c}">${c}</option>`).join('');
  const update = () => {
    const c = sel.value;
    const chart = renderChannelRadar(c);
    if (chart) {
      // ensure registered for resize
      if (!ChartRegistry.find(x => x.id === c)) {
        registerChart(chart);
      }
    }
  };
  sel.addEventListener('change', update);
  update();
}

// =====================================================
// 5. 筛选漏斗 (visual)
// =====================================================
function renderFunnel() {
  const el = document.getElementById('funnel-list');
  if (!el) return;
  // 最大 cnt 用于宽度归一化
  const numericRows = DATA_FUNNEL.filter(r => typeof r.cnt === 'number');
  const maxCnt = Math.max(...numericRows.map(r => r.cnt));

  el.innerHTML = DATA_FUNNEL.map((s, i) => {
    const isVideo = !s.isUnit;
    const widthPct = isVideo ? (s.cnt / maxCnt) * 100 : 100 - i * 4; // channel 段用递减占位
    const tone = i < 4 ? 'from-brand-500/30 to-brand-700/20' :
                 i < 7 ? 'from-amber-500/30 to-amber-700/20' :
                         'from-emerald-500/30 to-emerald-700/20';

    const dropText = typeof s.drop === 'number' && s.drop > 0
      ? `<span class="text-rose-300 text-xs">−${s.drop}%</span>`
      : '';
    const cntStr = isVideo ? fmtBig(s.cnt) : `${fmtInt(s.cnt)} channels`;

    return `
      <div class="funnel-step glass p-3 bg-gradient-to-r ${tone}">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">${i+1}</div>
            <div class="text-sm font-semibold text-white">${s.step}</div>
            ${i === DATA_FUNNEL.length - 1 ? '<span class="tier-pill tier-top ml-2">FINAL</span>' : ''}
          </div>
          <div class="flex items-center gap-3">
            ${dropText}
            <div class="font-mono text-sm text-white">${cntStr}</div>
          </div>
        </div>
        <div class="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-brand-400 to-purple-400 rounded-full"
               style="width: ${widthPct}%"></div>
        </div>
        <div class="text-xs text-ink-300 mt-1">${s.note}</div>
      </div>
    `;
  }).join('');
}

// =====================================================
// 6. 推荐维度
// =====================================================
function renderRecommendDims() {
  const el = document.getElementById('recommend-grid');
  if (!el) return;
  const catIcon = {
    '技术维度':       '🔧',
    '内容维度':       '📝',
    'channel 健康度': '💚',
    '世界模型专属':   '🌍',
  };
  const catColor = {
    '技术维度':       'from-brand-500/25 to-brand-600/10',
    '内容维度':       'from-amber-500/25 to-amber-600/10',
    'channel 健康度': 'from-emerald-500/25 to-emerald-600/10',
    '世界模型专属':   'from-purple-500/25 to-purple-600/10',
  };

  el.innerHTML = RECOMMENDED_DIMENSIONS.map(c => `
    <div class="glass-strong p-5 bg-gradient-to-br ${catColor[c.cat] || ''}">
      <div class="flex items-center gap-2 mb-3">
        <div class="text-2xl">${catIcon[c.cat] || '⭐'}</div>
        <h3 class="font-bold text-white text-lg">${c.cat}</h3>
        <span class="text-xs text-ink-300 ml-auto">${c.items.length} 个维度</span>
      </div>
      <div class="space-y-2.5">
        ${c.items.map(it => `
          <div class="border-l-2 border-white/10 pl-3 py-1 hover:border-brand-400 transition">
            <div class="font-semibold text-white text-sm">${it.name}</div>
            <div class="text-xs text-ink-200 mt-0.5">${it.desc}</div>
            <div class="text-xs mt-1">
              <code class="text-brand-300 font-mono bg-brand-500/5 px-1.5 py-0.5 rounded">${it.impl}</code>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// =====================================================
// 7. Scroll spy
// =====================================================
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('header a[href^="#"]');
  if (!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(a => {
          a.classList.toggle('text-brand-300', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
  sections.forEach(s => obs.observe(s));
}
