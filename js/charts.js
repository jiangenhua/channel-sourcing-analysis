/**
 * 漫游数据源盘点 - ECharts 配置
 * 公共主题、所有图表的 option
 */

// ============ 主题色 ============
const COLORS = {
  // 主色:科技蓝 -> 紫 -> 粉 渐变
  primary:  '#7dc0fc',
  primary2: '#379ff9',
  primary3: '#0e80e5',

  good:     '#4ade80',
  mid:      '#facc15',
  low:      '#f87171',
  noise:    '#a78bfa',

  // 多色 palette
  palette: [
    '#7dc0fc', '#a78bfa', '#f472b6', '#4ade80',
    '#facc15', '#fb7185', '#22d3ee', '#fbbf24',
    '#c084fc', '#67e8f9', '#fda4af', '#86efac',
    '#fcd34d', '#fb923c', '#a3e635', '#5eead4',
    '#93c5fd', '#d8b4fe', '#fbcfe8', '#bef264',
  ],

  catTierColor: {
    high: '#4ade80',
    mid:  '#facc15',
    low:  '#f87171',
  },

  bgGrad: ['rgba(125, 192, 252, 0.7)', 'rgba(125, 192, 252, 0.05)'],
};

// ============ 全局 ECharts 默认配置 ============
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
  legend: {
    textStyle: { color: '#a3b0c7', fontSize: 11 },
    itemWidth: 12,
    itemHeight: 12,
    icon: 'roundRect',
  },
};

const AXIS_LINE = {
  axisLine:  { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
  axisLabel: { color: '#a3b0c7', fontSize: 11 },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
};

// 中文数字
const fmtBig = (n) => {
  if (n == null || n === '—') return '—';
  if (typeof n === 'string') return n;
  if (n >= 1e8) return (n / 1e8).toFixed(2) + ' 亿';
  if (n >= 1e4) return (n / 1e4).toFixed(2) + ' 万';
  return n.toLocaleString();
};
const fmtPct = (n) => (n == null ? '—' : n.toFixed(2) + '%');
const fmtInt = (n) => (n == null ? '—' : Math.round(n).toLocaleString());

// ============ 1. 时长分布 (bar + line ratio) ============
function renderDurationChart() {
  const el = document.getElementById('chart-duration');
  if (!el) return;
  const chart = echarts.init(el, null, { renderer: 'canvas' });
  const data = DURATION_DIST;
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 50, left: 50, right: 60, bottom: 40, containLabel: true },
    legend: { ...BASE_OPT.legend, top: 0, right: 0 },
    tooltip: {
      ...BASE_OPT.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => {
        const d = data[p[0].dataIndex];
        return `<b>${d.bucket}</b> · <i>${d.desc}</i><br/>
                视频数: <b>${fmtBig(d.cnt)}</b><br/>
                占比:   <b>${d.ratio}%</b>`;
      },
    },
    xAxis: { type: 'category', data: data.map(d => d.bucket), ...AXIS_LINE },
    yAxis: [
      { type: 'value', name: '视频数', nameTextStyle: { color: '#7384a3' }, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: v => fmtBig(v) } },
      { type: 'value', name: '占比 %', nameTextStyle: { color: '#7384a3' }, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    ],
    series: [
      {
        name: '视频数',
        type: 'bar',
        data: data.map(d => ({
          value: d.cnt,
          itemStyle: { color: COLORS.catTierColor[d.qualityTag] === '#facc15' ? '#facc15' :
                              d.qualityTag === 'good' ? COLORS.good :
                              d.qualityTag === 'mid' ? COLORS.mid : COLORS.low,
                       borderRadius: [4,4,0,0] },
        })),
        barWidth: '42%',
      },
      {
        name: '占比 %',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => d.ratio),
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: COLORS.primary, width: 2 },
        itemStyle: { color: COLORS.primary },
      },
    ],
  });
  return chart;
}

// ============ 1b. 分辨率 ============
function renderResolutionChart() {
  const el = document.getElementById('chart-resolution');
  if (!el) return;
  const chart = echarts.init(el);
  const data = RESOLUTION_DIST;
  const colorByTier = {
    '1080p': COLORS.primary,
    '720p':  COLORS.primary3,
  };
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 80, right: 40, bottom: 30, containLabel: true },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: p => {
        const d = data[p[0].dataIndex];
        return `<b>${d.res}</b> · ${d.tier} · ${d.orientation}<br/>
                视频数: <b>${fmtBig(d.cnt)}</b><br/>
                占比:   <b>${d.ratio}%</b>`;
      },
    },
    xAxis: { type: 'value', ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    yAxis: { type: 'category', data: data.map(d => d.res).reverse(), ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, fontFamily: 'JetBrains Mono, Menlo, monospace' } },
    series: [{
      name: '占比',
      type: 'bar',
      data: [...data].reverse().map(d => ({
        value: d.ratio,
        itemStyle: { color: colorByTier[d.tier] || COLORS.mid, borderRadius: [0, 4, 4, 0] },
      })),
      barWidth: 12,
      label: { show: true, position: 'right', color: '#a3b0c7', formatter: '{c}%', fontSize: 11 },
    }],
  });
  return chart;
}

// ============ 1c. 分辨率方向 (圆环) ============
function renderOrientationChart() {
  const el = document.getElementById('chart-orientation');
  if (!el) return;
  const chart = echarts.init(el);
  const data = [
    { value: 75.04, name: '横屏', itemStyle: { color: COLORS.primary } },
    { value: 67.77, name: '竖屏', itemStyle: { color: COLORS.palette[2] } },
    { value: 1.74,  name: '方屏', itemStyle: { color: COLORS.palette[4] } },
  ];
  chart.setOption({
    ...BASE_OPT,
    title: { text: '分辨率方向', left: 'center', top: 5, textStyle: { color: '#a3b0c7', fontSize: 12, fontWeight: 400 } },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item', formatter: '{b}: <b>{c}%</b>' },
    series: [{
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['50%', '58%'],
      avoidLabelOverlap: true,
      data,
      label: { color: '#cdd6e4', fontSize: 11, formatter: '{b}\n{c}%' },
      itemStyle: { borderColor: '#080d1c', borderWidth: 2 },
    }],
  });
  return chart;
}

// ============ 1d. 分辨率档位 (饼) ============
function renderResTierChart() {
  const el = document.getElementById('chart-restier');
  if (!el) return;
  const chart = echarts.init(el);
  const data = RES_TIER_DIST.map(d => ({
    value: d.ratio,
    name: d.tier,
    itemStyle: {
      color: d.tier === '1080p+' ? COLORS.good :
             d.tier === '720p ~ <1080p' ? COLORS.mid : COLORS.low,
    },
  }));
  chart.setOption({
    ...BASE_OPT,
    title: { text: '分辨率档位', left: 'center', top: 5, textStyle: { color: '#a3b0c7', fontSize: 12, fontWeight: 400 } },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item', formatter: '{b}: <b>{c}%</b>' },
    series: [{
      type: 'pie',
      radius: ['0%', '70%'],
      center: ['50%', '58%'],
      roseType: 'radius',
      data,
      label: { color: '#cdd6e4', fontSize: 10, formatter: '{b}\n{c}%' },
      itemStyle: { borderColor: '#080d1c', borderWidth: 2 },
    }],
  });
  return chart;
}

// ============ 1e. 帧率 ============
function renderFramerateChart() {
  const el = document.getElementById('chart-framerate');
  if (!el) return;
  const chart = echarts.init(el);
  const data = FRAMERATE_DIST;
  const tagColor = { primary: COLORS.good, cinema: COLORS.primary, smooth: COLORS.primary2, pal: COLORS.mid, abnormal: COLORS.low, low: COLORS.low };
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 50, right: 30, bottom: 30, containLabel: true },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'axis',
      formatter: p => {
        const d = data[p[0].dataIndex];
        return `<b>${d.fps}</b><br/>视频数: <b>${fmtBig(d.cnt)}</b><br/>占比: <b>${d.ratio}%</b>`;
      },
    },
    xAxis: { type: 'category', data: data.map(d => d.fps), ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, rotate: 25, fontSize: 10 } },
    yAxis: { type: 'value', ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: data.map(d => ({ value: d.ratio, itemStyle: { color: tagColor[d.tag] || COLORS.primary, borderRadius: [3,3,0,0] } })),
      barWidth: '60%',
    }],
  });
  return chart;
}

// ============ 1f. 站点来源 ============
function renderSourceChart() {
  const el = document.getElementById('chart-source');
  if (!el) return;
  const chart = echarts.init(el);
  const data = CHANNEL_SOURCE_DIST.map((d, i) => ({
    value: d.ratio,
    name: d.name,
    raw: d.value,
    itemStyle: { color: [COLORS.palette[0], COLORS.palette[2], COLORS.palette[4]][i] },
  }));
  chart.setOption({
    ...BASE_OPT,
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item',
      formatter: p => `<b>${p.data.name}</b><br/>视频数: <b>${fmtBig(p.data.raw)}</b><br/>占比: <b>${p.data.value}%</b>` },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['50%', '50%'],
      data,
      label: { color: '#cdd6e4', fontSize: 11, formatter: '{b}\n{c}%' },
      labelLine: { lineStyle: { color: '#52617d' } },
      itemStyle: { borderColor: '#080d1c', borderWidth: 2 },
    }],
  });
  return chart;
}

// ============ 2. 类目分布 横向条形 (纯分布, 不再做质量标注) ============
function renderCategoryChart() {
  const el = document.getElementById('chart-category');
  if (!el) return;
  const chart = echarts.init(el);
  // 关键修复: 让数据 / yAxis 顺序完全对齐, 不再 .reverse() 引起索引错位
  // ECharts 横向条形图中, yAxis 第一个元素显示在底部.
  // 我们希望: 占比最大显示在最上方 => yAxis 顺序需要从小到大 (倒序后的)
  const sortedAsc = [...CATEGORY_DIST].sort((a, b) => a.ratio - b.ratio);

  chart.setOption({
    ...BASE_OPT,
    grid: { top: 10, left: 180, right: 90, bottom: 20, containLabel: false },
    tooltip: {
      ...BASE_OPT.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => {
        // 这里 p[0].dataIndex 直接对应 sortedAsc 的索引, 完全一致, 不再错位
        const d = sortedAsc[p[0].dataIndex];
        return `<b>${d.cat}</b><br/>
                视频数: <b>${fmtBig(d.cnt)}</b><br/>
                占比: <b>${d.ratio}%</b>`;
      },
    },
    xAxis: {
      type: 'value',
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' },
      max: 50,
    },
    yAxis: {
      type: 'category',
      data: sortedAsc.map((d) => d.cat),
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 11, width: 170, overflow: 'truncate' },
    },
    series: [{
      type: 'bar',
      data: sortedAsc.map((d) => ({
        value: d.ratio,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: COLORS.primary },
              { offset: 1, color: COLORS.primary + '50' },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: 14,
      label: { show: true, position: 'right', color: '#cdd6e4', formatter: '{c}%', fontSize: 11 },
    }],
  });
  return chart;
}

// ============ 3. 互动指标 bucket 分布 (通用) ============
function renderBucketChart(elId, data, color, fmtTooltip) {
  const el = document.getElementById(elId);
  if (!el) return;
  const chart = echarts.init(el);
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 60, right: 30, bottom: 30, containLabel: true },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'axis',
      formatter: p => {
        const d = data[p[0].dataIndex];
        return fmtTooltip ? fmtTooltip(d) :
          `<b>${d.bucket}</b><br/>视频数: <b>${fmtBig(d.cnt)}</b><br/>占比: <b>${d.ratio}%</b>`;
      },
    },
    xAxis: { type: 'category', data: data.map(d => d.bucket), ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 10 } },
    yAxis: { type: 'value', ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.ratio,
        itemStyle: { color, borderRadius: [4, 4, 0, 0] },
      })),
      barWidth: '52%',
      label: { show: true, position: 'top', color: '#a3b0c7', fontSize: 10, formatter: '{c}%' },
    }],
  });
  return chart;
}

// 用于不同色彩的 bucket 系列
function renderEngagementBuckets() {
  renderBucketChart('chart-play',    PLAY_DIST,    {
    type: 'linear', x:0, y:0, x2:0, y2:1,
    colorStops: [{ offset: 0, color: COLORS.primary }, { offset: 1, color: COLORS.primary + '30' }],
  });
  renderBucketChart('chart-like', LIKE_DIST, {
    type: 'linear', x:0, y:0, x2:0, y2:1,
    colorStops: [{ offset: 0, color: COLORS.palette[2] }, { offset: 1, color: COLORS.palette[2] + '30' }],
  });
  renderBucketChart('chart-comment', COMMENT_DIST, {
    type: 'linear', x:0, y:0, x2:0, y2:1,
    colorStops: [{ offset: 0, color: COLORS.palette[1] }, { offset: 1, color: COLORS.palette[1] + '30' }],
  });
  renderBucketChart('chart-follower', FOLLOWER_DIST, {
    type: 'linear', x:0, y:0, x2:0, y2:1,
    colorStops: [{ offset: 0, color: COLORS.good }, { offset: 1, color: COLORS.good + '30' }],
  });
}

// ============ 4. 类目互动率热力图 ============
function renderEngagementHeatmap() {
  const el = document.getElementById('chart-engagement-heatmap');
  if (!el) return;
  const chart = echarts.init(el);
  // 过滤掉值全为 0 的类目 (无数据), 按 engagement 排序
  const filtered = CATEGORY_ENGAGEMENT_AVG.filter(
    (d) => (d.avg_engagement || 0) + (d.avg_like_per_100 || 0) + (d.avg_comment_per_1k || 0) > 0
  );
  filtered.sort((a, b) => (b.avg_engagement || 0) - (a.avg_engagement || 0));
  const cats = filtered.map((d) => d.category.replace(/\s+\/\s+.*$/, ''));
  const metrics = ['avg_engagement', 'avg_like_per_100', 'avg_comment_per_1k'];
  const metricLabel = {
    avg_engagement: 'Engagement %',
    avg_like_per_100: 'Likes/100',
    avg_comment_per_1k: 'Comments/1K',
  };

  const data = [];
  filtered.forEach((d, i) => {
    metrics.forEach((m, j) => {
      data.push([j, i, +(d[m] || 0).toFixed(2)]);
    });
  });

  chart.setOption({
    ...BASE_OPT,
    grid: { top: 50, left: 200, right: 80, bottom: 30, containLabel: false },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item',
      formatter: p => {
        const d = filtered[p.data[1]];
        const m = metrics[p.data[0]];
        return `<b>${d.category}</b><br/>${metricLabel[m]}: <b>${p.data[2]}</b>`;
      },
    },
    xAxis: { type: 'category', data: metrics.map(m => metricLabel[m]), ...AXIS_LINE, splitArea: { show: true } },
    yAxis: { type: 'category', data: cats, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 11, width: 190, overflow: 'truncate' } },
    visualMap: {
      min: 0,
      max: 45,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 5,
      textStyle: { color: '#a3b0c7', fontSize: 11 },
      inRange: { color: ['#1c2435', '#379ff9', '#a78bfa', '#f472b6'] },
    },
    series: [{
      type: 'heatmap',
      data,
      label: { show: true, color: '#fff', fontSize: 11, formatter: p => p.data[2].toFixed(2) },
      itemStyle: { borderColor: '#080d1c', borderWidth: 1 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(125,192,252,0.5)' } },
    }],
  });
  return chart;
}

// ============ 5. Scatter (channel scale vs play) ============
function renderScatterChart() {
  const el = document.getElementById('chart-scatter');
  if (!el) return;
  const chart = echarts.init(el);
  const elite = CHANNEL_SCATTER.filter((d) => d.elite);
  const noise = CHANNEL_SCATTER.filter((d) => !d.elite);

  // 只对前 12 个精品 + 前 8 个大水号显示标签 (避免拥挤)
  const eliteTopNames = new Set([...elite].sort((a, b) => b.score - a.score).slice(0, 12).map((x) => x.name));
  const noiseTopNames = new Set([...noise].sort((a, b) => b.tplay - a.tplay).slice(0, 8).map((x) => x.name));

  const makeData = (rows, topNames) =>
    rows.map((d) => ({
      value: [d.vcnt, d.tplay, d.name, d.cat, d.score],
      label: { show: topNames.has(d.name) },
    }));

  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 70, right: 40, bottom: 50, containLabel: true },
    tooltip: {
      ...BASE_OPT.tooltip,
      trigger: 'item',
      formatter: (p) => {
        const [v, t, name, cat, sc] = p.value;
        return `<b>${name}</b> · <i>${cat}</i><br/>
                视频数: <b>${fmtInt(v)}</b><br/>
                总播放: <b>${fmtBig(t)}</b><br/>
                质量分: <b style="color:${sc >= 65 ? '#4ade80' : '#f87171'}">${sc}/100</b>`;
      },
    },
    legend: { ...BASE_OPT.legend, top: 0 },
    xAxis: {
      type: 'log',
      name: '视频数 (log)',
      nameTextStyle: { color: '#7384a3' },
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, formatter: (v) => fmtInt(v) },
    },
    yAxis: {
      type: 'log',
      name: '总播放 (log)',
      nameTextStyle: { color: '#7384a3' },
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, formatter: (v) => fmtBig(v) },
    },
    series: [
      {
        name: '精品 (Elite)',
        type: 'scatter',
        data: makeData(elite, eliteTopNames),
        symbolSize: (v) => 8 + (v[4] - 60) * 0.4,
        itemStyle: { color: COLORS.good, shadowBlur: 8, shadowColor: COLORS.good + '80' },
        label: {
          position: 'top',
          color: '#cdd6e4',
          fontSize: 10,
          formatter: (p) => (p.value[2].length > 20 ? p.value[2].slice(0, 18) + '…' : p.value[2]),
        },
      },
      {
        name: '大水号 (Bulk)',
        type: 'scatter',
        data: makeData(noise, noiseTopNames),
        symbolSize: 12,
        itemStyle: { color: COLORS.low, opacity: 0.75 },
        label: {
          position: 'top',
          color: '#7384a3',
          fontSize: 10,
          formatter: (p) => (p.value[2].length > 20 ? p.value[2].slice(0, 18) + '…' : p.value[2]),
        },
      },
    ],
  });
  return chart;
}

// ============ 6. Radar (维度权重) ============
function renderRadarChart() {
  const el = document.getElementById('chart-radar');
  if (!el) return;
  const chart = echarts.init(el);
  // 取最大权重 round 到 5% 的倍数作为 max
  const maxW = Math.max(...QUALITY_DIMENSIONS.map((d) => d.weight * 100));
  const radarMax = Math.ceil(maxW / 5) * 5;
  const indicators = QUALITY_DIMENSIONS.map((d) => ({ name: d.dim, max: radarMax }));

  chart.setOption({
    ...BASE_OPT,
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item' },
    radar: {
      shape: 'polygon',
      indicator: indicators,
      center: ['50%', '54%'],
      radius: '68%',
      splitNumber: 4,
      axisName: { color: '#cdd6e4', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(125, 192, 252, 0.12)' } },
      splitArea: { areaStyle: { color: ['rgba(125, 192, 252, 0.03)', 'rgba(125, 192, 252, 0.06)'] } },
      axisLine: { lineStyle: { color: 'rgba(125, 192, 252, 0.18)' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: QUALITY_DIMENSIONS.map(d => d.weight * 100),
        name: '权重 %',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: COLORS.primary, width: 2 },
        itemStyle: { color: COLORS.primary },
        areaStyle: { color: 'rgba(125, 192, 252, 0.3)' },
        label: { show: true, color: COLORS.primary, fontSize: 11, formatter: '{c}%' },
      }],
    }],
  });
  return chart;
}

// ============ 7. Channel 评分对比 (使用真实 QUALITY_TOP 数据) ============
// v2: 10 维 (max=100, 因为 band 映射到 S=100 / A=75 / B=50 / C=25)
function renderChannelRadar(channelName) {
  const el = document.getElementById('chart-channel-radar');
  if (!el) return;
  const chart = echarts.init(el);

  // 从 QUALITY_TOP 找到该 channel
  const q = QUALITY_TOP.find((x) => x.channel === channelName);
  if (!q) return null;

  // 10 个维度 (与 QUALITY_DIMENSIONS / parse_top20.py 一致)
  const labels = [
    '分辨率档位', '横屏比例', '时长合规', '互动率', '视频量',
    '点赞强度', '总播放(绝对)', '总点赞(绝对)', '总评论(绝对)', '订阅(绝对)',
  ];
  const keys = [
    'res', 'horizontal', 'dur', 'engage', 'vcnt',
    'like_rate', 'play_abs', 'like_abs', 'comment_abs', 'follower_abs',
  ];
  const score = keys.map((k) => (q.parts && q.parts[k]) || 0);
  const indicators = labels.map((name) => ({ name, max: 100 }));

  chart.setOption({
    ...BASE_OPT,
    title: {
      text: `${channelName} · 综合得分: ${q.score.toFixed(1)} / 100`,
      subtext: q.category,
      left: 'center',
      top: 5,
      textStyle: { color: '#7dc0fc', fontSize: 14, fontWeight: 600 },
      subtextStyle: { color: '#7384a3', fontSize: 12 },
    },
    tooltip: {
      ...BASE_OPT.tooltip,
      trigger: 'item',
      formatter: (p) => {
        const lines = labels.map(
          (l, i) => `${l}: <b style="color:${score[i] >= 75 ? '#4ade80' : score[i] >= 50 ? '#facc15' : '#f87171'}">${score[i]}</b>`
        );
        return `<b>${channelName}</b><br/>${lines.join('<br/>')}`;
      },
    },
    radar: {
      shape: 'polygon',
      indicator: indicators,
      center: ['50%', '56%'],
      radius: '62%',
      splitNumber: 4,
      axisName: { color: '#cdd6e4', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(125, 192, 252, 0.15)' } },
      splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', 'rgba(125, 192, 252, 0.04)'] } },
      axisLine: { lineStyle: { color: 'rgba(125, 192, 252, 0.2)' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: score,
        name: channelName,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: COLORS.palette[2], width: 2 },
        itemStyle: { color: COLORS.palette[2] },
        areaStyle: { color: 'rgba(244, 114, 182, 0.28)' },
        label: { show: true, color: '#fff', fontSize: 11 },
      }],
    }],
  });
  return chart;
}

// ============ 把所有 chart 注册到一个对象, 便于 resize ============
const ChartRegistry = [];
function registerChart(c) { if (c) ChartRegistry.push(c); }
function resizeAllCharts() { ChartRegistry.forEach(c => c.resize()); }

window.addEventListener('resize', resizeAllCharts);
