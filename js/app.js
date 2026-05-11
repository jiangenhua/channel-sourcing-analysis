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
  renderQualityTopTable();
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
  // 全部 4 维度都用 {category: [rows]} 结构, 摊平后返回
  const SRC = {
    play: TOP_BY_PLAY,
    like: TOP_BY_LIKE,
    comment: TOP_BY_COMMENT,
    follower: TOP_BY_FOLLOWER,
  };
  const tbl = SRC[currentDim];
  if (!tbl) return [];
  return Object.entries(tbl).flatMap(([cat, list]) =>
    list.map((r) => ({ ...r, category: r.unified_category || cat }))
  );
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
    play:     ['#', '类目', 'Channel', '总播放', '视频数', '1080p%', '60s+%', '180s+%', '质量'],
    like:     ['#', '类目', 'Channel', '总点赞', '视频数', 'Like/100Play', '1080p%', '60s+%', '质量'],
    comment:  ['#', '类目', 'Channel', '总评论', '视频数', 'Cmt/1kPlay', 'Cmt Share%', '1080p%', '类型'],
    follower: ['#', '类目', 'Channel', '粉丝', '视频数', '总播放', 'Play/Follower', 'Engagement%', '健康'],
  };
  thead.innerHTML = `<tr>${headersByDim[currentDim].map((h) => `<th>${h}</th>`).join('')}</tr>`;

  let rows = getDimData();
  if (currentCat !== '__all__') {
    rows = rows.filter((r) => r.category === currentCat);
  }
  // 排序 (各维度核心字段)
  const sortKey = {
    play: 'total_play',
    like: 'total_like',
    comment: 'total_comment',
    follower: 'follower',
  }[currentDim];
  rows.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  // 总行数 / 类目数显示
  const channelCountEl = document.getElementById('top-channel-count');
  if (channelCountEl) channelCountEl.textContent = rows.length.toLocaleString();
  const catCountEl = document.getElementById('top-cat-count');
  if (catCountEl) catCountEl.textContent = new Set(rows.map((r) => r.category)).size;

  tbody.innerHTML = rows.map((r, i) => renderRow(r, i + 1)).join('');
}

function renderRow(r, i) {
  // 计算简单的 channel score (rough heuristic) - 用于"质量"列
  const score = computeQuickScore(r);
  const tone = score >= 70 ? 'tier-high' : score >= 50 ? 'tier-mid' : 'tier-low';
  const channelName = r.author || r.channel;

  const td = (cls, content) => `<td class="${cls}">${content}</td>`;
  const numFmt = (v, suffix = '') => (v == null ? '—' : (typeof v === 'number' ? v.toFixed(2) : v) + suffix);
  const numInt = (v) => (v == null ? '—' : fmtInt(v));

  switch (currentDim) {
    case 'play':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${channelName}</td>
        <td class="num">${fmtBig(r.total_play)}</td>
        <td class="num">${numInt(r.video_cnt)}</td>
        <td class="num">${numFmt(r.res_1080p, '%')}</td>
        <td class="num">${numFmt(r.dur_60s, '%')}</td>
        <td class="num">${numFmt(r.dur_180s, '%')}</td>
        <td>${renderQuality(score, tone)}</td>
      </tr>`;
    case 'like':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${channelName}</td>
        <td class="num">${fmtBig(r.total_like)}</td>
        <td class="num">${numInt(r.video_cnt)}</td>
        <td class="num"><span class="text-emerald-300 font-mono">${numFmt(r.like_per_100play)}</span></td>
        <td class="num">${numFmt(r.res_1080p, '%')}</td>
        <td class="num">${numFmt(r.dur_60s, '%')}</td>
        <td>${renderQuality(score, tone)}</td>
      </tr>`;
    case 'comment':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${channelName}</td>
        <td class="num">${fmtBig(r.total_comment)}</td>
        <td class="num">${numInt(r.video_cnt)}</td>
        <td class="num"><span class="text-amber-300 font-mono">${numFmt(r.comment_per_1k_play)}</span></td>
        <td class="num">${numFmt(r.comment_share_pct, '%')}</td>
        <td class="num">${numFmt(r.res_1080p, '%')}</td>
        <td>${commentTypeLabel(r.comment_share_pct, r.comment_per_1k_play)}</td>
      </tr>`;
    case 'follower':
      return `<tr>
        <td class="num">${i}</td>
        <td class="font-semibold">${r.category}</td>
        <td>${channelName}</td>
        <td class="num font-semibold text-brand-300">${fmtBig(r.follower)}</td>
        <td class="num">${numInt(r.video_cnt)}</td>
        <td class="num">${r.total_play ? fmtBig(r.total_play) : '—'}</td>
        <td class="num">${followerHealthLabel(r.avg_play_per_follower)}</td>
        <td class="num">${numFmt(r.engagement_rate_pct, '%')}</td>
        <td>${renderQuality(score, tone)}</td>
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

// 粗暴打分: 与 Python parser 中的 compute_quality_score 一致 (S=100/A=75/B=50/C=25 × 权重)
function computeQuickScore(r) {
  const band = (v, sThr, aThr, bThr) => {
    if (v == null) return 25;
    if (v >= sThr) return 100;
    if (v >= aThr) return 75;
    if (v >= bThr) return 50;
    return 25;
  };
  let s = 0;
  s += 0.20 * band(r.res_1080p, 80, 60, 40);
  s += 0.15 * band(r.dur_60s, 70, 50, 30);
  s += 0.15 * band(r.engagement_rate_pct, 3, 2, 1);
  s += 0.10 * band(r.video_cnt, 200, 50, 20);
  s += 0.10 * band(r.follower, 100000, 10000, 1000);
  s += 0.10 * band(r.like_per_100play, 5, 3, 1);
  // 触达率: 0.1~3 是健康, 否则按距离扣分
  const apf = r.avg_play_per_follower;
  let reach = 25;
  if (apf == null) reach = 25;
  else if (apf >= 0.1 && apf <= 3.0) reach = 100;
  else if ((apf >= 0.03 && apf < 0.1) || (apf > 3.0 && apf <= 10)) reach = 75;
  else if ((apf > 0 && apf < 0.03) || (apf > 10 && apf <= 50)) reach = 50;
  s += 0.10 * reach;
  // 类目偏好
  const cat = r.category || '';
  const HIGH = ['Travel', 'Education', 'Sports', 'Autos', 'Pets', 'Howto', 'Science', 'Food', 'Family'];
  const MID  = ['Entertainment', 'Music', 'Comedy', 'News', 'Nonprofits'];
  const LOW  = ['People & Blogs', 'Gaming', 'Film & Animation'];
  let catScore = 25;
  if (HIGH.some((c) => cat.includes(c))) catScore = 100;
  else if (MID.some((c) => cat.includes(c))) catScore = 75;
  else if (LOW.some((c) => cat.includes(c))) catScore = 50;
  s += 0.10 * catScore;
  return Math.round(s);
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

function renderQualityTopTable() {
  const tbody = document.getElementById('quality-top-tbody');
  if (!tbody) return;
  // 仅取前 20
  const rows = QUALITY_TOP.slice(0, 20);
  tbody.innerHTML = rows.map((r, i) => {
    const tier = r.score >= 80 ? 'tier-high' :
                 r.score >= 60 ? 'tier-mid' :
                 r.score >= 40 ? 'tier-pill' : 'tier-low';
    const tierLabel = r.score >= 80 ? 'S' : r.score >= 60 ? 'A' : r.score >= 40 ? 'B' : 'C';
    const tierStyle = r.score >= 80
      ? 'background:linear-gradient(90deg,#f59e0b,#ef4444);color:#fff;'
      : r.score >= 60
        ? 'background:rgba(34,197,94,0.2);color:#4ade80;border:1px solid rgba(34,197,94,0.3);'
        : r.score >= 40
          ? 'background:rgba(251,146,60,0.2);color:#fdba74;border:1px solid rgba(251,146,60,0.3);'
          : 'background:rgba(248,113,113,0.2);color:#fca5a5;border:1px solid rgba(248,113,113,0.3);';
    const rkBadge = i < 3
      ? `<span style="background:linear-gradient(90deg,#f59e0b,#ef4444);color:#fff;padding:2px 8px;border-radius:999px;font-weight:700">${i + 1}</span>`
      : (i + 1).toString();

    return `<tr>
      <td class="num">${rkBadge}</td>
      <td class="font-semibold">${r.category}</td>
      <td>${r.channel}</td>
      <td class="num font-mono font-bold text-brand-300">${r.score.toFixed(1)}</td>
      <td class="num">${r.res_1080p != null ? r.res_1080p.toFixed(1) + '%' : '—'}</td>
      <td class="num">${r.dur_60s != null ? r.dur_60s.toFixed(1) + '%' : '—'}</td>
      <td class="num">${r.video_cnt != null ? fmtInt(r.video_cnt) : '—'}</td>
      <td class="num">${r.follower != null ? fmtBig(r.follower) : '—'}</td>
      <td class="num">${r.engagement != null ? r.engagement.toFixed(2) + '%' : '—'}</td>
      <td class="num">${r.total_play != null ? fmtBig(r.total_play) : '—'}</td>
      <td><span class="tier-pill" style="${tierStyle}">${tierLabel} 级</span></td>
    </tr>`;
  }).join('');
}

function initChannelRadarSelect() {
  const sel = document.getElementById('channel-select');
  if (!sel) return;
  // 用质量 Top 50 作为可选 channel
  const channels = QUALITY_TOP.slice(0, 50).map((q) => q.channel);
  sel.innerHTML = channels.map((c, i) => {
    const q = QUALITY_TOP[i];
    return `<option value="${c}">#${i + 1} · ${q.score.toFixed(1)} · ${c} (${q.category})</option>`;
  }).join('');
  const update = () => {
    const c = sel.value;
    const chart = renderChannelRadar(c);
    if (chart) registerChart(chart);
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
