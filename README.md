# 漫游数据源盘点 · Channel Sourcing for World Model Pretrain

[![Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success)](https://jiangenhua.github.io/channel-sourcing-analysis/)
[![Tech](https://img.shields.io/badge/Stack-Vanilla%20JS%20%2B%20ECharts%20%2B%20Tailwind-blue)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey)]()

> 世界模型 Pretrain 优质 Channel 寻源 · 基于 22.86 亿条视频元数据的数据分析与可视化看板

## 📌 项目背景

当前世界模型需要大量优质 pretrain 数据, 但数据库表中沉淀的 up / channel 数量巨大、质量良莠不齐. 本项目基于 `dwd_hy_video_raw_acquire_data_hi` 全量数据 (22.86 亿条视频, 7020 万 author, 覆盖 YouTube + Bilibili), 构建了一套 **七维 Channel 质量评分体系**, 从全量数据中筛出 ≈ **8,424 个** 高质量 channel 供世界模型 pretrain 使用.

## 🌟 主要功能

- **数据分布全景**: 时长 / 分辨率 / 帧率 / 站点来源 / 类目 / 互动维度
- **Top 榜单** (按 4 个维度 × 19 个类目): 总播放 / 点赞率 / 评论率 / 粉丝量
- **质量评分体系**: 雷达图展示七维权重 + S/A/B/C 四档分级阈值表
- **筛选漏斗可视化**: 22.86 亿 → 8,424 channel 的多步漏斗
- **新维度建议**: 技术维度 · 内容维度 · channel 健康度 · 世界模型专属四大类
- **可直接落地的 SQL 模板**: 提供完整的 `WITH ... GROUP BY ... WHERE` 筛选示例

## 🚀 在线访问

- **主看板**: <https://jiangenhua.github.io/channel-sourcing-analysis/>
- **深度分析报告页**: <https://jiangenhua.github.io/channel-sourcing-analysis/analysis.html>
- **完整 Markdown 报告**: [`REPORT.md`](./REPORT.md)

## 🗂 项目结构

```
channel-sourcing-analysis/
├── index.html              # 主看板 (KPI / 分布 / 类目 / 质量评分 / Top 榜单 / 漏斗)
├── analysis.html           # 深度分析页 (Pareto / 异常检测 / 相关性 / 寻源策略)
├── REPORT.md               # 完整 Markdown 数据分析报告
├── README.md               # 项目说明 (本文件)
├── scripts/
│   └── parse_top20.py      # 解析 txt → data-top20.js (含质量分计算)
├── assets/
│   ├── data.js             # 总览 / 分布 / 类目 / 评分体系定义
│   └── data-top20.js       # Top20 全量数据 (auto-generated, 19 类 × 20 channel × 4 维)
└── js/
    ├── charts.js           # 主看板 ECharts 配置
    ├── app.js              # 主看板交互 (KPI / 质量榜 / Top 表格 / 漏斗)
    └── analysis.js         # 深度分析页交互 (Pareto / Gini / Correlation / 异常)
```

## 🛠 本地开发

无构建步骤, 任意 HTTP 服务器即可:

```bash
# Python 3
python3 -m http.server 8765

# Node.js (需先 npm i -g http-server)
http-server -p 8765

# 浏览器打开
open http://localhost:8765
```

## 🎨 技术栈

- **可视化**: [Apache ECharts 5.4](https://echarts.apache.org/) (CDN)
- **样式**: [Tailwind CSS](https://tailwindcss.com/) (Play CDN)
- **数据层**: 纯 ES2015 vanilla JS, 无 framework, 无 bundler
- **设计**: Glassmorphism + Gradient + Dark theme
- **字体**: 苹方 / Microsoft YaHei (中文) + JetBrains Mono (数字)

## 📊 数据来源

- **数据库表**: `data_sec_management_app::dwd_hy_video_raw_acquire_data_hi`
- **抽样口径**: `requirement_id IN (5148, 5152) AND tdbank_imp_date >= '2026010800'`
- **数据快照**: 2026-03-28
- **覆盖站点**: YouTube (98.55%) + Bilibili (1.38%) + 其他 (0.07%)

## 📈 核心指标

| 维度 | 数值 |
| --- | --- |
| 视频总量 | 2,285,500,538 (22.86 亿) |
| 不重复 author | 70,200,335 (7020 万) |
| 平均每作者视频数 | 32.6 (中位数远 < 5, 长尾极重) |
| 高清 (≥1080p) 占比 | 53.43% |
| 可用时长 (≥30s) 占比 | 61.82% |
| 高质量类目占比 | 18.07% |
| ≥10K 播放视频 | 12.20% |
| **终选优质 channel** | **≈ 8,424** |

## 🎯 七维质量评分体系

| 维度 | 字段 | 权重 |
| --- | --- | --- |
| 分辨率档位 | `res_1080p_ratio_pct` | 20% |
| 时长合规 | `dur_60s_ratio_pct` | 15% |
| 互动率 | `engagement_rate_pct` | 15% |
| 视频量 | `video_cnt` | 10% |
| 粉丝规模 | `follower` | 10% |
| 点赞强度 | `like_per_100play` | 10% |
| 粉丝触达率 | `avg_play_per_follower` | 10% |
| 类目偏好 | `category_tier` | 10% |

详细阈值表见 [REPORT.md §6](./REPORT.md#6-channel-质量评分体系-7-维-rubric).

## 🚦 GitHub Pages 部署

本项目可直接通过 GitHub Pages 部署 (无构建步骤):

1. Push 到 GitHub 仓库
2. Settings → Pages → Source → `main` 分支根目录
3. 等待 1-2 分钟后访问 `https://<username>.github.io/<repo-name>/`

## 📝 License

MIT © 2026

---

> 完整的数据分析说明请阅读 [`REPORT.md`](./REPORT.md). 配套交互看板请直接打开 `index.html` 或访问 [Live Demo](https://jiangenhua.github.io/channel-sourcing-analysis/).
