/**
 * 漫游数据源盘点 - 深度分析页 (analysis.html) 逻辑
 * 依赖: assets/data.js, assets/data-top20.js (ECharts global)
 */

// ============ 公共常量 ============
const COLORS = {
  primary:  '#7dc0fc',
  primary2: '#379ff9',
  good:     '#4ade80',
  mid:      '#facc15',
  low:      '#f87171',
  noise:    '#a78bfa',
  palette: [
    '#7dc0fc', '#a78bfa', '#f472b6', '#4ade80',
    '#facc15', '#fb7185', '#22d3ee', '#fbbf24',
    '#c084fc', '#67e8f9', '#fda4af', '#86efac',
    '#fcd34d', '#fb923c', '#a3e635', '#5eead4',
    '#93c5fd', '#d8b4fe', '#fbcfe8', '#bef264',
  ],
};

const BASE_OPT = {
  textStyle: {
    color: '#cdd6e4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  grid: { top: 30, left: 50, right: 30, bottom: 35, containLabel: true },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(17, 23, 42, 0.95)',
    borderWidth: 0,
    textStyle: { color: '#e8edf5', fontSize: 12 },
    extraCssText: 'backdrop-filter: blur(8px); border-radius: 8px; box-shadow: 0 4px 24px rgba(0,0,0,0.4);',
  },
  legend: { textStyle: { color: '#a3b0c7', fontSize: 11 } },
};

const AXIS_LINE = {
  axisLine:  { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
  axisLabel: { color: '#a3b0c7', fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
};

const fmtBig = (n) => {
  if (n == null) return '—';
  if (typeof n === 'string') return n;
  if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿';
  if (n >= 1e4) return (n / 1e4).toFixed(2) + ' 万';
  return n.toLocaleString();
};
const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString());
const fmtPct = (n) => (n == null ? '—' : n.toFixed(2) + '%');

const charts = [];
function register(c) { if (c) charts.push(c); }
window.addEventListener('resize', () => charts.forEach((c) => c.resize()));

// ============ 工具: 把 TOP_BY_PLAY 摊平 + 类目级聚合 ============
function allPlayRows() {
  return Object.entries(TOP_BY_PLAY).flatMap(([cat, list]) =>
    list.map((r) => ({ ...r, category: cat }))
  );
}

function shortCat(cat) {
  if (!cat) return '';
  return cat.split(' / ')[0];
}

// ============ Section 1: Duration × Category ============
function renderDurationByCat() {
  const el = document.getElementById('chart-duration-by-cat');
  if (!el) return;
  const rows = allPlayRows();
  // 按类目聚合各 dur 占比的均值
  const cats = {};
  rows.forEach((r) => {
    if (!cats[r.category]) cats[r.category] = { d60: [], d180: [], d600: [] };
    if (r.dur_60s  != null) cats[r.category].d60.push(r.dur_60s);
    if (r.dur_180s != null) cats[r.category].d180.push(r.dur_180s);
    if (r.dur_600s != null) cats[r.category].d600.push(r.dur_600s);
  });
  const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);
  const list = Object.entries(cats)
    .filter(([, v]) => v.d60.length > 0)
    .map(([cat, v]) => ({
      cat: shortCat(cat),
      fullCat: cat,
      d60: +avg(v.d60).toFixed(2),
      d180: +avg(v.d180).toFixed(2),
      d600: +avg(v.d600).toFixed(2),
    }))
    .sort((a, b) => b.d60 - a.d60);

  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 40, left: 50, right: 30, bottom: 80, containLabel: true },
    legend: { ...BASE_OPT.legend, top: 0, right: 0 },
    tooltip: {
      ...BASE_OPT.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: list.map((d) => d.cat),
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, rotate: 35, fontSize: 10 },
    },
    yAxis: { type: 'value', ...AXIS_LINE, max: 100, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    series: [
      { name: '≥60s', type: 'bar',  data: list.map((d) => d.d60),  itemStyle: { color: COLORS.good },    barWidth: '20%' },
      { name: '≥180s',type: 'bar',  data: list.map((d) => d.d180), itemStyle: { color: COLORS.primary }, barWidth: '20%' },
      { name: '≥600s',type: 'bar',  data: list.map((d) => d.d600), itemStyle: { color: COLORS.noise },   barWidth: '20%' },
    ],
  });
  register(chart);

  // 表格: 时长友好 Top 5 / 时长偏短 Top 5
  const sortedByLong = [...list].sort((a, b) => (b.d180 + b.d60) - (a.d180 + a.d60));
  const tableBest = sortedByLong.slice(0, 5);
  const tableWorst = [...list].filter((d) => d.d60 < 50).sort((a, b) => a.d60 - b.d60).slice(0, 5);

  const tBest = document.getElementById('table-dur-best');
  if (tBest) {
    tBest.innerHTML = `<table class="data-table">
      <thead><tr><th>#</th><th>类目</th><th class="num">≥60s</th><th class="num">≥180s</th><th class="num">≥600s</th></tr></thead>
      <tbody>${tableBest.map((d, i) => `
        <tr>
          <td class="num">${i + 1}</td>
          <td class="font-semibold">${d.fullCat}</td>
          <td class="num text-emerald-300">${d.d60.toFixed(1)}%</td>
          <td class="num text-emerald-300">${d.d180.toFixed(1)}%</td>
          <td class="num text-brand-300">${d.d600.toFixed(1)}%</td>
        </tr>
      `).join('')}</tbody>
    </table>`;
  }
  const tWorst = document.getElementById('table-dur-worst');
  if (tWorst) {
    tWorst.innerHTML = `<table class="data-table">
      <thead><tr><th>#</th><th>类目</th><th class="num">≥60s</th><th class="num">≥180s</th><th class="num">≥600s</th></tr></thead>
      <tbody>${tableWorst.map((d, i) => `
        <tr>
          <td class="num">${i + 1}</td>
          <td class="font-semibold">${d.fullCat}</td>
          <td class="num text-rose-300">${d.d60.toFixed(1)}%</td>
          <td class="num text-rose-300">${d.d180.toFixed(1)}%</td>
          <td class="num">${d.d600.toFixed(1)}%</td>
        </tr>
      `).join('')}</tbody>
    </table>`;
  }
}

// ============ Section 2: Engagement Scatter ============
function renderEngScatter() {
  const el = document.getElementById('chart-eng-scatter');
  if (!el) return;
  // 把 like + comment 数据合并到同一个 (category, channel) 上
  const m = {};
  for (const [cat, list] of Object.entries(TOP_BY_LIKE)) {
    list.forEach((r) => {
      const key = cat + '|' + r.author;
      m[key] = { ...m[key], like_per_100play: r.like_per_100play, channel: r.author, category: cat };
    });
  }
  for (const [cat, list] of Object.entries(TOP_BY_COMMENT)) {
    list.forEach((r) => {
      const key = cat + '|' + r.author;
      m[key] = { ...m[key], comment_per_1k_play: r.comment_per_1k_play, comment_share_pct: r.comment_share_pct, channel: r.author, category: cat };
    });
  }
  // 仅保留两个值都有的
  const pairs = Object.values(m).filter((x) => x.like_per_100play != null && x.comment_per_1k_play != null);

  // 分类: balanced / emotional / suspicious / normal
  const series = { balanced: [], emotional: [], suspicious: [], normal: [] };
  pairs.forEach((p) => {
    const v = [p.like_per_100play, p.comment_per_1k_play, p.channel, shortCat(p.category)];
    if (p.comment_per_1k_play > 30 || (p.comment_share_pct || 0) > 30) series.suspicious.push(v);
    else if (p.like_per_100play > 5 && p.comment_per_1k_play > 5) series.balanced.push(v);
    else if (p.like_per_100play > 7 && (p.comment_share_pct || 0) < 5) series.emotional.push(v);
    else series.normal.push(v);
  });

  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 80, right: 40, bottom: 50, containLabel: true },
    legend: { ...BASE_OPT.legend, top: 0 },
    tooltip: {
      ...BASE_OPT.tooltip, trigger: 'item',
      formatter: (p) => {
        const [l, c, n, cat] = p.data;
        return `<b>${n}</b> · ${cat}<br/>like/100: <b>${l}</b><br/>comment/1k: <b>${c}</b>`;
      },
    },
    xAxis: { type: 'log', name: 'like / 100 plays (log)', nameTextStyle: { color: '#7384a3' }, ...AXIS_LINE },
    yAxis: { type: 'log', name: 'comment / 1k plays (log)', nameTextStyle: { color: '#7384a3' }, ...AXIS_LINE },
    series: [
      { name: '真粘性 (双高)',     type: 'scatter', data: series.balanced,   symbolSize: 11, itemStyle: { color: COLORS.good,    shadowBlur: 6 } },
      { name: '情绪型 (高赞少评)', type: 'scatter', data: series.emotional,  symbolSize: 9,  itemStyle: { color: COLORS.mid,     opacity: 0.85 } },
      { name: '可疑刷量',         type: 'scatter', data: series.suspicious, symbolSize: 11, itemStyle: { color: COLORS.low,     shadowBlur: 6 } },
      { name: '普通',             type: 'scatter', data: series.normal,     symbolSize: 6,  itemStyle: { color: '#52617d',      opacity: 0.5 } },
    ],
  });
  register(chart);

  // 列表
  const fillList = (id, arr, max = 5) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!arr.length) {
      el.innerHTML = '<li class="text-ink-400 italic">无数据</li>';
      return;
    }
    el.innerHTML = arr.slice(0, max).map((v) =>
      `<li>· <span class="font-mono text-brand-300">${v[2]}</span> <span class="text-xs text-ink-400">(${v[3]})</span></li>`
    ).join('');
  };
  fillList('list-balanced',   series.balanced.sort((a, b) => (b[0] + b[1]) - (a[0] + a[1])));
  fillList('list-emotional',  series.emotional.sort((a, b) => b[0] - a[0]));
  fillList('list-suspicious', series.suspicious.sort((a, b) => b[1] - a[1]));
}

// ============ Section 3: Pareto ============
function renderPareto() {
  const el = document.getElementById('chart-pareto');
  if (!el) return;
  const rows = allPlayRows().filter((r) => r.total_play).sort((a, b) => b.total_play - a.total_play);
  const total = rows.reduce((s, r) => s + (r.total_play || 0), 0);
  let cum = 0;
  const series = rows.map((r, i) => {
    cum += r.total_play;
    return [(i + 1) / rows.length * 100, cum / total * 100];
  });

  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 60, right: 40, bottom: 40, containLabel: true },
    tooltip: {
      ...BASE_OPT.tooltip, trigger: 'axis',
      formatter: (p) => `Top ${p[0].data[0].toFixed(1)}% channel<br/>累计播放: <b>${p[0].data[1].toFixed(2)}%</b>`,
    },
    xAxis: { type: 'value', max: 100, name: 'channel 占比 %', nameTextStyle: { color: '#7384a3' }, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    yAxis: { type: 'value', max: 100, name: '累计播放占比 %', nameTextStyle: { color: '#7384a3' }, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    series: [
      {
        name: '累计播放占比',
        type: 'line',
        data: series,
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(125,192,252,0.6)' },
              { offset: 1, color: 'rgba(125,192,252,0.02)' },
            ],
          },
        },
        lineStyle: { color: COLORS.primary, width: 2 },
        markLine: {
          symbol: 'none',
          lineStyle: { color: 'rgba(248,113,113,0.6)', type: 'dashed' },
          label: { color: '#fca5a5', fontSize: 10 },
          data: [
            { xAxis: 5,  label: { formatter: 'Top 5%' } },
            { xAxis: 20, label: { formatter: 'Top 20%' } },
          ],
        },
      },
      {
        name: '理想 Pareto 80/20',
        type: 'line',
        data: [[0, 0], [20, 80], [100, 100]],
        symbol: 'none',
        lineStyle: { color: '#52617d', width: 1, type: 'dotted' },
      },
    ],
  });
  register(chart);

  // 计算关键阈值
  const findShare = (xPct) => {
    const target = Math.ceil(rows.length * xPct / 100);
    let s = 0;
    for (let i = 0; i < target; i++) s += rows[i].total_play;
    return ((s / total) * 100).toFixed(2);
  };
  const setEl = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  setEl('pareto-top1pct',   Math.ceil(rows.length * 0.01));
  setEl('pareto-1pct-share', findShare(1) + '%');
  setEl('pareto-5pct-share', findShare(5) + '%');
  setEl('pareto-20pct-share', findShare(20) + '%');

  // Gini chart by category
  renderGini();
  // Top cat pie
  renderTopCatPie(rows);
}

function renderGini() {
  const el = document.getElementById('chart-gini');
  if (!el) return;
  const rows = allPlayRows().filter((r) => r.total_play);
  const byCat = {};
  rows.forEach((r) => {
    if (!byCat[r.category]) byCat[r.category] = [];
    byCat[r.category].push(r.total_play);
  });
  // Gini coefficient
  const gini = (arr) => {
    if (arr.length < 2) return 0;
    arr.sort((a, b) => a - b);
    const n = arr.length;
    const s = arr.reduce((acc, v) => acc + v, 0);
    if (!s) return 0;
    let num = 0;
    for (let i = 0; i < n; i++) num += (i + 1) * arr[i];
    return (2 * num) / (n * s) - (n + 1) / n;
  };
  const list = Object.entries(byCat)
    .map(([cat, vals]) => ({ cat: shortCat(cat), g: +gini(vals).toFixed(3) }))
    .sort((a, b) => b.g - a.g);

  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 140, right: 40, bottom: 30, containLabel: false },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (p) => `<b>${list[p[0].dataIndex].cat}</b><br/>Gini: <b>${list[p[0].dataIndex].g}</b>` },
    xAxis: { type: 'value', max: 1, ...AXIS_LINE },
    yAxis: { type: 'category', data: list.slice().reverse().map((d) => d.cat), ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 11 } },
    series: [{
      type: 'bar',
      data: list.slice().reverse().map((d) => ({
        value: d.g,
        itemStyle: {
          color: d.g > 0.6 ? COLORS.low : d.g > 0.4 ? COLORS.mid : COLORS.good,
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barWidth: 12,
      label: { show: true, position: 'right', color: '#cdd6e4', fontSize: 11, formatter: (p) => p.data.value.toFixed(2) },
    }],
  });
  register(chart);
}

function renderTopCatPie(rows) {
  const el = document.getElementById('chart-top-cat-pie');
  if (!el) return;
  const top100 = rows.slice(0, 100);
  const byCat = {};
  top100.forEach((r) => {
    const cat = shortCat(r.category);
    byCat[cat] = (byCat[cat] || 0) + 1;
  });
  const list = Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item', formatter: '{b}: <b>{c}</b> channel ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '72%'],
      center: ['50%', '50%'],
      data: list.map((d, i) => ({ ...d, itemStyle: { color: COLORS.palette[i % COLORS.palette.length] } })),
      label: { color: '#cdd6e4', fontSize: 11 },
      labelLine: { lineStyle: { color: '#52617d' } },
    }],
  });
  register(chart);
}

// ============ Section 4: Anomaly Lists ============
function renderAnomalies() {
  const rows = allPlayRows();

  // 沉睡大号: 需要 follower & avg_play, 从 TOP_BY_FOLLOWER 拉
  const followerRows = Object.entries(TOP_BY_FOLLOWER).flatMap(([cat, list]) =>
    list.map((r) => ({ ...r, category: cat }))
  );
  const zombie = followerRows
    .filter((r) => (r.follower || 0) > 10000000 && (r.avg_play_per_follower || 0) < 0.01)
    .sort((a, b) => b.follower - a.follower)
    .slice(0, 8);

  const tv = rows
    .filter((r) => (r.video_cnt || 0) > 50000 && (r.dur_180s || 100) < 50)
    .sort((a, b) => b.video_cnt - a.video_cnt)
    .slice(0, 8);

  // 宗教/争议: 看 comment 维度
  const commentRows = Object.entries(TOP_BY_COMMENT).flatMap(([cat, list]) =>
    list.map((r) => ({ ...r, category: cat }))
  );
  const religious = commentRows
    .filter((r) => (r.comment_per_1k_play || 0) > 30 || (r.comment_share_pct || 0) > 30)
    .sort((a, b) => (b.comment_per_1k_play || 0) - (a.comment_per_1k_play || 0))
    .slice(0, 8);

  // Shorts 工厂
  const shorts = rows
    .filter((r) => (r.video_cnt || 0) > 500 && (r.dur_60s || 100) < 5)
    .sort((a, b) => b.video_cnt - a.video_cnt)
    .slice(0, 8);

  // 影视/动画搬运 (Film & Animation 类目 + 高总播放 + 低 like_per_100)
  const likeRows = Object.entries(TOP_BY_LIKE).flatMap(([cat, list]) =>
    list.map((r) => ({ ...r, category: cat }))
  );
  const piracyMap = {};
  rows.forEach((r) => {
    if (r.category.includes('Film & Animation') && (r.total_play || 0) > 1e9) {
      piracyMap[r.author] = { ...r };
    }
  });
  likeRows.forEach((r) => {
    if (piracyMap[r.author]) piracyMap[r.author].like_per_100play = r.like_per_100play;
  });
  const piracy = Object.values(piracyMap)
    .filter((r) => (r.like_per_100play || 100) < 2.0)
    .sort((a, b) => b.total_play - a.total_play)
    .slice(0, 10);

  const fillList = (id, arr, fmt) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!arr.length) {
      el.innerHTML = '<li class="text-ink-400 italic">无明显命中</li>';
      return;
    }
    el.innerHTML = arr.map((r) => `<li>· ${fmt(r)}</li>`).join('');
  };

  fillList('list-zombie', zombie, (r) => `
    <span class="font-mono text-brand-300">${r.author}</span>
    <span class="text-ink-400 text-xs">${fmtBig(r.follower)} 粉 · APF=${(r.avg_play_per_follower || 0).toFixed(4)}</span>`);
  fillList('list-tv', tv, (r) => `
    <span class="font-mono text-brand-300">${r.author}</span>
    <span class="text-ink-400 text-xs">${fmtInt(r.video_cnt)} 视频 · dur_180s=${(r.dur_180s || 0).toFixed(1)}%</span>`);
  fillList('list-religious', religious, (r) => `
    <span class="font-mono text-brand-300">${r.author}</span>
    <span class="text-ink-400 text-xs">cmt/1k=${(r.comment_per_1k_play || 0).toFixed(2)} · share=${(r.comment_share_pct || 0).toFixed(1)}%</span>`);
  fillList('list-shorts', shorts, (r) => `
    <span class="font-mono text-brand-300">${r.author}</span>
    <span class="text-ink-400 text-xs">${fmtInt(r.video_cnt)} 视频 · dur_60s=${(r.dur_60s || 0).toFixed(1)}%</span>`);
  fillList('list-piracy', piracy, (r) => `
    <span class="font-mono text-brand-300">${r.author}</span>
    <span class="text-ink-400 text-xs">${fmtBig(r.total_play)} 播放 · like=${(r.like_per_100play || 0).toFixed(2)}</span>`);
}

// ============ Section 5: Cross-Dim Correlation ============
function renderCorrelation() {
  const el = document.getElementById('chart-corr');
  if (!el) return;
  // 收集合并的指标矩阵
  const m = {};
  for (const [cat, list] of Object.entries(TOP_BY_PLAY)) {
    list.forEach((r) => {
      const k = cat + '|' + r.author;
      m[k] = m[k] || { category: cat, author: r.author };
      Object.assign(m[k], {
        res_1080p: r.res_1080p, dur_60s: r.dur_60s, dur_180s: r.dur_180s,
        video_cnt: r.video_cnt, total_play: r.total_play, avg_play: r.avg_play,
      });
    });
  }
  for (const [cat, list] of Object.entries(TOP_BY_LIKE)) {
    list.forEach((r) => {
      const k = cat + '|' + r.author;
      m[k] = m[k] || { category: cat, author: r.author };
      Object.assign(m[k], { like_per_100play: r.like_per_100play });
    });
  }
  for (const [cat, list] of Object.entries(TOP_BY_FOLLOWER)) {
    list.forEach((r) => {
      const k = cat + '|' + r.author;
      m[k] = m[k] || { category: cat, author: r.author };
      Object.assign(m[k], { follower: r.follower, engagement_rate_pct: r.engagement_rate_pct });
    });
  }

  const metrics = [
    'res_1080p', 'dur_60s', 'dur_180s',
    'video_cnt', 'total_play', 'avg_play',
    'like_per_100play', 'follower', 'engagement_rate_pct',
  ];
  const labels = ['1080p%', '60s+%', '180s+%', '视频数', '总播放', '均播放', 'Like/100', '粉丝', 'Engage%'];
  const rows = Object.values(m);

  // Pearson correlation
  function corr(x, y) {
    const pairs = [];
    for (let i = 0; i < rows.length; i++) {
      const a = rows[i][x], b = rows[i][y];
      if (a == null || b == null) continue;
      pairs.push([a, b]);
    }
    if (pairs.length < 5) return 0;
    const n = pairs.length;
    const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
    const my = pairs.reduce((s, p) => s + p[1], 0) / n;
    let num = 0, dx = 0, dy = 0;
    pairs.forEach(([a, b]) => {
      num += (a - mx) * (b - my);
      dx  += (a - mx) ** 2;
      dy  += (b - my) ** 2;
    });
    if (!dx || !dy) return 0;
    return num / Math.sqrt(dx * dy);
  }

  const data = [];
  metrics.forEach((mi, i) => {
    metrics.forEach((mj, j) => {
      data.push([j, i, +corr(mi, mj).toFixed(3)]);
    });
  });

  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 60, left: 100, right: 60, bottom: 60, containLabel: false },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item',
      formatter: (p) => {
        const [j, i, v] = p.data;
        return `<b>${labels[i]} ↔ ${labels[j]}</b><br/>r = <b>${v}</b>`;
      } },
    xAxis: { type: 'category', data: labels, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, rotate: 30, fontSize: 11 } },
    yAxis: { type: 'category', data: labels, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 11 } },
    visualMap: {
      min: -1, max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center', top: 10,
      textStyle: { color: '#a3b0c7', fontSize: 11 },
      inRange: { color: ['#f87171', '#1c2435', '#4ade80'] },
    },
    series: [{
      type: 'heatmap', data,
      label: { show: true, color: '#fff', fontSize: 10, formatter: (p) => p.data[2].toFixed(2) },
      itemStyle: { borderColor: '#080d1c', borderWidth: 1 },
    }],
  });
  register(chart);
}

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
  renderDurationByCat();
  renderEngScatter();
  renderPareto();
  renderAnomalies();
  renderCorrelation();
});
