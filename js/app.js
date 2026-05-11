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
  renderCrossCatCoverageWarning();
  initCatQualitySelect();
  initChannelRadarSelect();

  // ===== 4.1 采样视频弹窗交互 =====
  initVideoModal();
  renderSampleCoverageStats();

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

// 类目级横屏比例估算 (与 scripts/parse_top20.py 的 CATEGORY_HORIZONTAL_RATIO 保持一致)
const CATEGORY_HORIZONTAL_RATIO = {
  'ASMR': 50,
  'Autos & Vehicles / 汽车': 90,
  'Comedy / 喜剧': 75,
  'Education / 教育': 90,
  'Entertainment / 娱乐': 85,
  'Family / 家庭': 65,
  'Film & Animation / 影视动画': 95,
  'Food / 美食': 75,
  'Gaming / 游戏': 95,
  'Howto & Style / 生活时尚': 70,
  'Music / 音乐': 60,
  'News & Politics / 新闻与政治': 85,
  'Nonprofits & Activism / 公益': 85,
  'Other / 其他': 70,
  'People & Blogs / 人物与博客': 50,
  'Pets & Animals / 宠物与动物': 75,
  'Science & Technology / 科技': 90,
  'Shorts / 短视频': 5,
  'Sports / 体育': 90,
  'Travel & Events / 旅行': 80,
  'Null / 未分类': 50,
};

// v2 评分: 10 维加权, 与 scripts/parse_top20.py 的 compute_quality_score 保持一致
function computeQuickScore(r) {
  const band = (v, sThr, aThr, bThr) => {
    if (v == null) return 25;
    if (v >= sThr) return 100;
    if (v >= aThr) return 75;
    if (v >= bThr) return 50;
    return 25;
  };
  // 横屏比例: 优先用 channel 字段, 否则用 category 估算
  const hRatio = (r.horizontal_ratio_est != null)
    ? r.horizontal_ratio_est
    : (CATEGORY_HORIZONTAL_RATIO[r.category] != null ? CATEGORY_HORIZONTAL_RATIO[r.category] : 50);
  // 兼容 r.engagement_rate_pct (来自 follower 维) 和 r.engagement (来自 QUALITY_TOP)
  const engage = r.engagement_rate_pct != null ? r.engagement_rate_pct : r.engagement;
  let s = 0;
  s += 0.20 * band(r.res_1080p,           80, 60, 40);
  s += 0.10 * band(hRatio,                70, 50, 30);
  s += 0.15 * band(r.dur_60s,             70, 50, 30);
  s += 0.15 * band(engage,                 3,  2,  1);
  s += 0.10 * band(r.video_cnt,          200, 50, 20);
  s += 0.10 * band(r.like_per_100play,     5,  3,  1);
  // 4 个绝对值维度
  s += 0.07 * band(r.total_play,    1e9, 1e8, 1e7);
  s += 0.06 * band(r.total_like,    5e7, 5e6, 5e5);
  s += 0.04 * band(r.total_comment, 1e6, 1e5, 1e4);
  s += 0.03 * band(r.follower,      5e7, 1e7, 1e6);
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
      <td>${renderChannelCell(r.category, r.channel)}</td>
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

// ============ Channel 渲染: 如果该 (cat, channel) 有采样视频, 渲染为可点击链接 ============
function renderChannelCell(category, channel) {
  // 容错: SAMPLE_VIDEOS 可能未加载, 函数也可能没定义
  const samples = (typeof getSampleVideos === 'function')
    ? getSampleVideos(category, channel)
    : [];
  if (!samples || samples.length === 0) {
    return `<span class="channel-no-sample" title="该 channel 暂无采样视频">${escapeHtml(channel)}</span>`;
  }
  const safeChannel = escapeAttr(channel);
  const safeCat = escapeAttr(category);
  return `<a class="channel-link" href="#"
              data-cat="${safeCat}" data-channel="${safeChannel}"
              title="查看 ${samples.length} 条采样视频"
              onclick="openVideoModal('${safeCat}','${safeChannel}'); return false;">
            ${escapeHtml(channel)}
            <span class="sample-badge">${samples.length}</span>
          </a>`;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) {
  // for use inside onclick='...' single-quoted args
  if (s == null) return '';
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

// ============ 新增: 跨类目 Top20 覆盖警告 ============
function renderCrossCatCoverageWarning() {
  const top20 = QUALITY_TOP.slice(0, 20);
  const covered = new Set(top20.map((r) => r.category));
  const allCats = Object.keys(QUALITY_TOP_BY_CAT || {});
  const missing = allCats.filter((c) => !covered.has(c)).sort();

  const setText = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setText('cross-cat-coverage', covered.size);
  setText('cross-cat-missing-count', missing.length);
  const missEl = document.getElementById('cross-cat-missing-names');
  if (missEl) {
    missEl.innerHTML = missing.length === 0
      ? '<em>无</em>'
      : missing.map((c) => `<span class="font-mono text-amber-200">${c}</span>`).join(' · ');
  }
}

// ============ 新增: 各类目质量分 Top 20 ============
let currentQualityCat = null;

function initCatQualitySelect() {
  const sel = document.getElementById('cat-quality-select');
  // 注意: const 声明的全局变量不会挂到 window 上, 必须用 typeof 检测
  if (!sel || typeof QUALITY_TOP_BY_CAT === 'undefined') return;

  // 按类目内 Top1 得分降序排
  const cats = Object.entries(QUALITY_TOP_BY_CAT)
    .map(([cat, rows]) => ({ cat, top1: rows[0]?.score || 0, count: rows.length }))
    .sort((a, b) => b.top1 - a.top1);

  // 优先选一个未出现在跨类目 Top20 的类目作为默认 (突出"补救"作用)
  const crossCovered = new Set(QUALITY_TOP.slice(0, 20).map((r) => r.category));
  const defaultCat =
    cats.find((c) => !crossCovered.has(c.cat))?.cat ||
    cats[0].cat;

  sel.innerHTML = cats.map((c) => {
    const mark = crossCovered.has(c.cat) ? '✓' : '◆';
    const cls = crossCovered.has(c.cat) ? 'text-ink-300' : 'text-amber-300';
    return `<option value="${c.cat}" data-covered="${crossCovered.has(c.cat) ? 1 : 0}">
      ${mark} ${c.cat} · Top1=${c.top1.toFixed(1)} · ${c.count} 个
    </option>`;
  }).join('');
  sel.value = defaultCat;
  currentQualityCat = defaultCat;
  sel.addEventListener('change', () => {
    currentQualityCat = sel.value;
    renderCatQualityTable();
  });
  renderCatQualityTable();
}

function renderCatQualityTable() {
  const tbody = document.getElementById('cat-quality-tbody');
  if (!tbody || !currentQualityCat) return;
  const rows = QUALITY_TOP_BY_CAT[currentQualityCat] || [];

  // 统计信息
  const statsEl = document.getElementById('cat-quality-stats');
  if (statsEl) {
    const sCount = rows.filter((r) => r.score >= 80).length;
    const aCount = rows.filter((r) => r.score >= 60 && r.score < 80).length;
    const bCount = rows.filter((r) => r.score >= 40 && r.score < 60).length;
    const cCount = rows.filter((r) => r.score < 40).length;
    statsEl.innerHTML = `S:<b class="text-emerald-300">${sCount}</b> · A:<b class="text-amber-300">${aCount}</b> · B:<b class="text-orange-300">${bCount}</b> · C:<b class="text-rose-300">${cCount}</b>`;
  }

  // 顶部 summary 卡片: 类目内 Top1 / 平均分 / S+A 占比 / 是否在跨类目 Top20
  const summaryEl = document.getElementById('cat-quality-summary');
  if (summaryEl && rows.length > 0) {
    const top1 = rows[0];
    const avg = rows.reduce((s, r) => s + r.score, 0) / rows.length;
    const goodCount = rows.filter((r) => r.score >= 60).length;
    const goodPct = ((goodCount / rows.length) * 100).toFixed(0);
    const crossCovered = QUALITY_TOP.slice(0, 20).some((r) => r.category === currentQualityCat);

    summaryEl.innerHTML = `
      <div class="glass p-3 bg-gradient-to-br from-brand-500/10 to-brand-700/5">
        <div class="text-xs text-ink-300">类目 Top1 得分</div>
        <div class="text-xl font-bold text-brand-300 mt-1">${top1.score.toFixed(1)}</div>
        <div class="text-xs text-ink-300 mt-1 truncate" title="${top1.channel}">${top1.channel}</div>
      </div>
      <div class="glass p-3 bg-gradient-to-br from-purple-500/10 to-purple-700/5">
        <div class="text-xs text-ink-300">类目内平均分</div>
        <div class="text-xl font-bold text-purple-300 mt-1">${avg.toFixed(1)}</div>
        <div class="text-xs text-ink-300 mt-1">共 ${rows.length} 个候选</div>
      </div>
      <div class="glass p-3 bg-gradient-to-br from-emerald-500/10 to-emerald-700/5">
        <div class="text-xs text-ink-300">S+A 级占比</div>
        <div class="text-xl font-bold text-emerald-300 mt-1">${goodPct}%</div>
        <div class="text-xs text-ink-300 mt-1">${goodCount}/${rows.length} 达到 ≥60 分</div>
      </div>
      <div class="glass p-3 bg-gradient-to-br ${crossCovered ? 'from-emerald-500/10 to-emerald-700/5' : 'from-amber-500/15 to-rose-500/5'}">
        <div class="text-xs text-ink-300">跨类目 Top 20 覆盖</div>
        <div class="text-xl font-bold ${crossCovered ? 'text-emerald-300' : 'text-amber-300'} mt-1">
          ${crossCovered ? '✓ 已覆盖' : '◆ 未覆盖'}
        </div>
        <div class="text-xs text-ink-300 mt-1">${crossCovered ? '该类目有 channel 进入总榜' : '该类目完全依赖本表展示'}</div>
      </div>
    `;
  }

  // 行渲染
  tbody.innerHTML = rows.map((r, i) => {
    const tier = r.score >= 80 ? 'S' : r.score >= 60 ? 'A' : r.score >= 40 ? 'B' : 'C';
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
      <td>${renderChannelCell(currentQualityCat, r.channel)}</td>
      <td class="num font-mono font-bold text-brand-300">${r.score.toFixed(1)}</td>
      <td class="num">${r.res_1080p != null ? r.res_1080p.toFixed(1) + '%' : '—'}</td>
      <td class="num">${r.dur_60s != null ? r.dur_60s.toFixed(1) + '%' : '—'}</td>
      <td class="num">${r.video_cnt != null ? fmtInt(r.video_cnt) : '—'}</td>
      <td class="num">${r.follower != null ? fmtBig(r.follower) : '—'}</td>
      <td class="num">${r.engagement != null ? r.engagement.toFixed(2) + '%' : '—'}</td>
      <td class="num">${r.like_per_100play != null ? r.like_per_100play.toFixed(2) : '—'}</td>
      <td class="num">${r.total_play != null ? fmtBig(r.total_play) : '—'}</td>
      <td><span class="tier-pill" style="${tierStyle}">${tier} 级</span></td>
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
// 6.x 采样视频弹窗 (与 channel 表格联动)
// =====================================================

function renderSampleCoverageStats() {
  if (typeof SAMPLE_VIDEOS === 'undefined') return;
  const keys = Object.keys(SAMPLE_VIDEOS);
  const channelCount = keys.length;
  const videoCount = Object.values(SAMPLE_VIDEOS).reduce((s, arr) => s + arr.length, 0);
  const sampledCats = new Set(keys.map((k) => k.split('|', 1)[0]));
  const allCats = typeof QUALITY_TOP_BY_CAT !== 'undefined' ? Object.keys(QUALITY_TOP_BY_CAT) : [];
  const missingCats = allCats.filter((c) => !sampledCats.has(c));

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('sample-coverage-channels', channelCount.toLocaleString());
  set('sample-coverage-videos', videoCount.toLocaleString());
  set('sample-coverage-cats', sampledCats.size + ' / ' + allCats.length);
  set('sample-coverage-missing', missingCats.length);
  // 把 missing 类目 tooltip 化
  const missingEl = document.getElementById('sample-coverage-missing');
  if (missingEl && missingCats.length) {
    missingEl.parentElement.setAttribute('title', '未采样类目:\n' + missingCats.join('\n'));
    missingEl.parentElement.style.cursor = 'help';
  }
}

function initVideoModal() {
  const modal = document.getElementById('video-modal');
  if (!modal) return;
  const closeBtn  = document.getElementById('video-modal-close');
  const closeBtn2 = document.getElementById('video-modal-close-2');
  const backdrop  = document.getElementById('video-modal-backdrop');

  const close = () => {
    modal.classList.add('hidden');
    document.documentElement.style.overflow = '';
  };
  closeBtn?.addEventListener('click', close);
  closeBtn2?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });
}

// 注意: 此函数被 onclick="openVideoModal(...)" 直接调用, 必须挂到 window
function openVideoModal(category, channel) {
  const modal = document.getElementById('video-modal');
  if (!modal) return;

  const samples = (typeof getSampleVideos === 'function')
    ? getSampleVideos(category, channel)
    : [];
  if (!samples || samples.length === 0) {
    return;
  }

  // 填充 header
  const nameEl = document.getElementById('video-modal-channel');
  const catEl  = document.getElementById('video-modal-cat');
  const cntEl  = document.getElementById('video-modal-count');
  const linkEl = document.getElementById('video-modal-channel-link');
  const linkElM = document.getElementById('video-modal-channel-link-mobile');
  if (nameEl) nameEl.textContent = channel;
  if (catEl)  catEl.textContent  = category;
  if (cntEl)  cntEl.textContent  = samples.length;

  const channelUrl = samples.find((s) => s.channel_url)?.channel_url;
  if (linkEl) {
    if (channelUrl) {
      linkEl.href = channelUrl;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.classList.add('hidden');
    }
  }
  if (linkElM) {
    if (channelUrl) {
      linkElM.href = channelUrl;
      linkElM.classList.remove('hidden');
    } else {
      linkElM.classList.add('hidden');
    }
  }

  // 填充列表
  const list = document.getElementById('video-modal-list');
  if (list) {
    list.innerHTML = samples.map((v) => {
      const title = escapeHtml(v.title || '<未知标题>');
      const url   = escapeHtml(v.video_url || '#');
      const rawUrl = v.video_url || '';
      return `<li class="video-row">
        <span class="video-rk">${v.rk}</span>
        <div class="flex-1 min-w-0">
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="video-title">${title}</a>
          <div class="video-url">${escapeHtml(rawUrl)}</div>
        </div>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="open-btn" title="新窗口打开">↗</a>
      </li>`;
    }).join('');
    // 滚回顶部
    list.parentElement.scrollTop = 0;
  }

  modal.classList.remove('hidden');
  // 阻止 body 滚动
  document.documentElement.style.overflow = 'hidden';
}

// 暴露到全局, 给 inline onclick 用
window.openVideoModal = openVideoModal;

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
