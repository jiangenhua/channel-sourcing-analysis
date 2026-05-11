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

// ============ 2. 类目分布 横向条形 ============
function renderCategoryChart() {
  const el = document.getElementById('chart-category');
  if (!el) return;
  const chart = echarts.init(el);
  const data = [...CATEGORY_DIST]; // 已按 cnt 排序
  const tierColor = COLORS.catTierColor;
  chart.setOption({
    ...BASE_OPT,
    grid: { top: 10, left: 180, right: 90, bottom: 20, containLabel: false },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: p => {
        const d = data[p[0].dataIndex];
        return `<b>${d.cat}</b><br/>
                数量: <b>${fmtBig(d.cnt)}</b><br/>
                占比: <b>${d.ratio}%</b><br/>
                等级: <b style="color:${tierColor[d.tier]}">${d.tier.toUpperCase()}</b><br/>
                <span style="color:#a3b0c7">${d.rec}</span>`;
      },
    },
    xAxis: { type: 'value', ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, formatter: '{value}%' }, max: 50 },
    yAxis: {
      type: 'category',
      data: data.map(d => d.cat).reverse(),
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 11, width: 170, overflow: 'truncate' },
    },
    series: [{
      type: 'bar',
      data: [...data].reverse().map(d => ({
        value: d.ratio,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: tierColor[d.tier] },
              { offset: 1, color: tierColor[d.tier] + '60' },
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
  const cats = CATEGORY_ENGAGEMENT_AVG.map(d => d.category.replace(/\s+\/\s+.*$/, ''));
  const metrics = ['avg_engagement', 'avg_like_per_100', 'avg_comment_per_1k'];
  const metricLabel = {
    avg_engagement: 'Engagement %',
    avg_like_per_100: 'Likes/100',
    avg_comment_per_1k: 'Comments/1K',
  };

  const data = [];
  CATEGORY_ENGAGEMENT_AVG.forEach((d, i) => {
    metrics.forEach((m, j) => {
      data.push([j, i, d[m]]);
    });
  });

  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 200, right: 80, bottom: 30, containLabel: false },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item',
      formatter: p => {
        const d = CATEGORY_ENGAGEMENT_AVG[p.data[1]];
        const m = metrics[p.data[0]];
        return `<b>${d.category}</b><br/>${metricLabel[m]}: <b>${p.data[2]}</b><br/><span style="color:#a3b0c7">${d.hint}</span>`;
      },
    },
    xAxis: { type: 'category', data: metrics.map(m => metricLabel[m]), ...AXIS_LINE, splitArea: { show: true } },
    yAxis: { type: 'category', data: cats, ...AXIS_LINE, axisLabel: { ...AXIS_LINE.axisLabel, fontSize: 11, width: 190, overflow: 'truncate' } },
    visualMap: {
      min: 0,
      max: 50,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 0,
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
  const elite = CHANNEL_SCATTER.filter(d => d.elite);
  const noise = CHANNEL_SCATTER.filter(d => !d.elite);

  chart.setOption({
    ...BASE_OPT,
    grid: { top: 30, left: 70, right: 40, bottom: 50, containLabel: true },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item',
      formatter: p => {
        const [v, t, name, cat] = p.data;
        return `<b>${name}</b> · <i>${cat}</i><br/>视频数: <b>${fmtInt(v)}</b><br/>总播放: <b>${fmtBig(t)}</b>`;
      },
    },
    legend: { ...BASE_OPT.legend, top: 0 },
    xAxis: {
      type: 'log', name: '视频数 (log)', nameTextStyle: { color: '#7384a3' },
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, formatter: v => fmtInt(v) },
    },
    yAxis: {
      type: 'log', name: '总播放 (log)', nameTextStyle: { color: '#7384a3' },
      ...AXIS_LINE,
      axisLabel: { ...AXIS_LINE.axisLabel, formatter: v => fmtBig(v) },
    },
    series: [
      {
        name: '精品 channel',
        type: 'scatter',
        data: elite.map(d => [d.vcnt, d.tplay, d.name, d.cat]),
        symbolSize: 16,
        itemStyle: { color: COLORS.good, shadowBlur: 8, shadowColor: COLORS.good + '80' },
        label: {
          show: true, position: 'top', color: '#a3b0c7', fontSize: 10,
          formatter: p => p.data[2].length > 20 ? p.data[2].slice(0, 18) + '…' : p.data[2],
        },
      },
      {
        name: '大水号 / 高频低质',
        type: 'scatter',
        data: noise.map(d => [d.vcnt, d.tplay, d.name, d.cat]),
        symbolSize: 14,
        itemStyle: { color: COLORS.low, opacity: 0.85 },
        label: {
          show: true, position: 'top', color: '#7384a3', fontSize: 10,
          formatter: p => p.data[2].length > 20 ? p.data[2].slice(0, 18) + '…' : p.data[2],
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
  const indicators = QUALITY_DIMENSIONS.map(d => ({ name: d.dim, max: 25 }));

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

// ============ 7. Channel 评分对比 ============
const CHANNEL_SCORE_SAMPLES = {
  'JUCA (Autos★)':            [ 22, 17, 12, 8, 14, 12, 10, 12 ], // 精品 channel
  'Toyota Motor Thailand':   [ 19, 8,  12, 12, 6,  3,  4,  10 ],  // 大号、互动率低
  'KHANDESHI MOVIES':        [ 22, 15, 10, 10, 8,  4,  6,  8 ],   // 长视频神号
  'PewDiePie':               [ 20, 13, 7,  10, 12, 8,  6,  8 ],   // 经典头部
  'Aaj Tak (News)':          [ 17, 11, 14, 10, 4,  2,  2,  10 ],  // News 大水号
  'EBS Documentary':         [ 18, 12, 14, 8,  10, 8,  6,  12 ],  // Travel 精品
  'Mochimaru (Pets)':        [ 20, 14, 11, 6,  9,  6,  6,  10 ],  // Pets 精品
};

function renderChannelRadar(channelName) {
  const el = document.getElementById('chart-channel-radar');
  if (!el) return;
  const chart = echarts.init(el);
  const score = CHANNEL_SCORE_SAMPLES[channelName];
  const indicators = QUALITY_DIMENSIONS.map(d => ({ name: d.dim, max: 25 }));
  // 计算总分
  const totalScore = score.reduce((a, b) => a + b, 0);

  chart.setOption({
    ...BASE_OPT,
    title: {
      text: `${channelName} · 综合得分: ${totalScore}/100`,
      left: 'center',
      top: 5,
      textStyle: { color: '#7dc0fc', fontSize: 14, fontWeight: 600 },
    },
    tooltip: { ...BASE_OPT.tooltip, trigger: 'item' },
    radar: {
      shape: 'polygon',
      indicator: indicators,
      center: ['50%', '56%'],
      radius: '62%',
      splitNumber: 5,
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
        areaStyle: { color: 'rgba(244, 114, 182, 0.25)' },
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
