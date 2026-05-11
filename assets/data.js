/**
 * 漫游数据源盘点 - 数据层
 * 来源: data_sec_management_app::dwd_hy_video_raw_acquire_data_hi
 * 抽样口径: requirement_id IN (5148, 5152) AND tdbank_imp_date >= '2026010800'
 */

// ===== 0. 总览 =====
const OVERVIEW = {
  totalVideos: 2285500538,           // 视频总量
  uniqueAuthors: 70200335,           // 不重复 author 数
  avgVideosPerAuthor: 32.6,          // 平均每作者视频数
  sources: 2,                         // 站点数 (YouTube + Bilibili)
};

// ===== 1. Channel(站点)分布 =====
const CHANNEL_SOURCE_DIST = [
  { name: "YouTube (common)", value: 2252360642, ratio: 98.55 },
  { name: "Bilibili (NULL)",   value: 31536861,    ratio: 1.38 },
  { name: "其他 ('')",         value: 1603035,     ratio: 0.07 },
];

// ===== 2. duration 时长分布 =====
const DURATION_DIST = [
  { bucket: "0-10s",   cnt: 151919305, ratio: 6.64,  qualityTag: "low",    desc: "极短/截图/截屏" },
  { bucket: "10-30s",  cnt: 723022218, ratio: 31.60, qualityTag: "low",    desc: "Shorts/碎片化" },
  { bucket: "30-60s",  cnt: 383668731, ratio: 16.77, qualityTag: "mid",    desc: "短视频" },
  { bucket: "1-3min",  cnt: 329202276, ratio: 14.39, qualityTag: "good",   desc: "世界模型偏好" },
  { bucket: "3-10min", cnt: 378257963, ratio: 16.53, qualityTag: "good",   desc: "中长视频" },
  { bucket: "10min+",  cnt: 321858766, ratio: 14.07, qualityTag: "mid",    desc: "长视频/直播切片" },
];

// ===== 3. 分辨率分布 (常见分辨率, ratio>0.1%) =====
const RESOLUTION_DIST = [
  { res: "720x1280",   cnt: 641389182, ratio: 28.06, orientation: "vertical",   tier: "720p" },
  { res: "1920x1080",  cnt: 637939998, ratio: 27.91, orientation: "horizontal", tier: "1080p" },
  { res: "1080x1920",  cnt: 607474228, ratio: 26.57, orientation: "vertical",   tier: "1080p" },
  { res: "1280x720",   cnt: 230529727, ratio: 10.08, orientation: "horizontal", tier: "720p"  },
  { res: "1080x1080",  cnt: 26583550,  ratio: 1.16,  orientation: "square",     tier: "1080p" },
  { res: "720x720",    cnt: 12353803,  ratio: 0.54,  orientation: "square",     tier: "720p"  },
  { res: "720x960",    cnt: 8947321,   ratio: 0.39,  orientation: "vertical",   tier: "720p"  },
  { res: "1440x1080",  cnt: 7125179,   ratio: 0.31,  orientation: "horizontal", tier: "1080p" },
  { res: "1080x1440",  cnt: 5013874,   ratio: 0.22,  orientation: "vertical",   tier: "1080p" },
  { res: "1080x1906",  cnt: 4860201,   ratio: 0.21,  orientation: "vertical",   tier: "1080p" },
  { res: "720x900",    cnt: 4235988,   ratio: 0.19,  orientation: "vertical",   tier: "720p"  },
  { res: "1906x1080",  cnt: 4002581,   ratio: 0.18,  orientation: "horizontal", tier: "1080p" },
  { res: "960x720",    cnt: 3784794,   ratio: 0.17,  orientation: "horizontal", tier: "720p"  },
  { res: "1080x1350",  cnt: 3098765,   ratio: 0.14,  orientation: "vertical",   tier: "1080p" },
  { res: "1920x1072",  cnt: 2299277,   ratio: 0.10,  orientation: "horizontal", tier: "1080p" },
];

// ===== 3.1 分辨率方向汇总 =====
const ORIENTATION_DIST = [
  { name: "横屏 (Horizontal)", value: 75.04, color: "horizontal" },
  { name: "竖屏 (Vertical)",   value: 67.77, color: "vertical"   },
  { name: "方屏 (Square)",     value: 1.74,  color: "square"     },
];

// ===== 3.2 分辨率档位汇总 (≥720p) =====
const RES_TIER_DIST = [
  { tier: "<720p",        ratio: 7.27, desc: "极少, 应过滤" },
  { tier: "720p ~ <1080p", ratio: 39.30, desc: "可用基线" },
  { tier: "1080p+",        ratio: 53.43, desc: "推荐生产质量" },
];

// ===== 4. 帧率分布 =====
const FRAMERATE_DIST = [
  { fps: "30 fps", cnt: 1457381338, ratio: 63.75, tag: "primary"  },
  { fps: "24 fps", cnt: 357070228,  ratio: 15.62, tag: "cinema"   },
  { fps: "60 fps", cnt: 282101328,  ratio: 12.34, tag: "smooth"   },
  { fps: "50 fps", cnt: 34726908,   ratio: 1.52,  tag: "pal"      },
  { fps: "6 fps",  cnt: 30045062,   ratio: 1.31,  tag: "abnormal" },
  { fps: "20 fps", cnt: 14721926,   ratio: 0.64,  tag: "abnormal" },
  { fps: "15 fps", cnt: 11877017,   ratio: 0.52,  tag: "low"      },
  { fps: "10 fps", cnt: 11860959,   ratio: 0.52,  tag: "abnormal" },
  { fps: "17 fps", cnt: 8931541,    ratio: 0.39,  tag: "abnormal" },
  { fps: "14 fps", cnt: 8690691,    ratio: 0.38,  tag: "abnormal" },
];

// ===== 5. 分类分布 (unified_category) =====
const CATEGORY_DIST = [
  { cat: "People & Blogs / 人物与博客",   cnt: 1089422329, ratio: 47.65, tier: "low",    rec: "占比过高、内容噪声大, 需要二次过滤" },
  { cat: "Entertainment / 娱乐",          cnt: 275863108,  ratio: 12.07, tier: "mid",    rec: "可用, 注意去重抓拍/录屏" },
  { cat: "Gaming / 游戏",                 cnt: 193027051,  ratio: 8.44,  tier: "low",    rec: "屏幕录制为主, 不利于真实物理学习" },
  { cat: "Music / 音乐",                  cnt: 129607920,  ratio: 5.67,  tier: "mid",    rec: "MV 类适用, 现场演出可保留" },
  { cat: "Education / 教育",              cnt: 127817102,  ratio: 5.59,  tier: "high",   rec: "★ 高质量, 重点筛选" },
  { cat: "News & Politics / 新闻与政治",   cnt: 118637828,  ratio: 5.19,  tier: "high",   rec: "★ 真实场景丰富, 推荐保留" },
  { cat: "Howto & Style / 生活时尚",       cnt: 65926034,   ratio: 2.88,  tier: "high",   rec: "★ 真实物体演示, 推荐保留" },
  { cat: "Sports / 体育",                 cnt: 53259033,   ratio: 2.33,  tier: "high",   rec: "★ 高动态, 适合运动学习" },
  { cat: "Comedy / 喜剧",                 cnt: 42733816,   ratio: 1.87,  tier: "mid",    rec: "可用, 注意特效/字幕较多" },
  { cat: "Film & Animation / 影视动画",    cnt: 42467097,   ratio: 1.86,  tier: "low",    rec: "动画占比大, 不利于真实学习" },
  { cat: "Autos & Vehicles / 汽车",        cnt: 35160444,   ratio: 1.54,  tier: "high",   rec: "★ 真实驾驶场景, 推荐保留" },
  { cat: "Travel & Events / 旅行",         cnt: 34429564,   ratio: 1.51,  tier: "high",   rec: "★★ 强推荐: 自然场景丰富" },
  { cat: "Science & Technology / 科技",    cnt: 32084625,   ratio: 1.40,  tier: "high",   rec: "★ 高质量信息密度" },
  { cat: "Pets & Animals / 宠物与动物",    cnt: 23742026,   ratio: 1.04,  tier: "high",   rec: "★ 真实生物学习" },
  { cat: "Nonprofits & Activism / 公益",   cnt: 12800490,   ratio: 0.56,  tier: "mid",    rec: "可用" },
  { cat: "Other / 其他",                  cnt: 8184075,    ratio: 0.36,  tier: "low",    rec: "未分类, 需打标后再用" },
  { cat: "Food / 美食",                   cnt: 624379,     ratio: 0.03,  tier: "high",   rec: "★ 烹饪过程, 推荐保留" },
  { cat: "Family / 家庭",                 cnt: 310635,     ratio: 0.01,  tier: "high",   rec: "★ 家庭真实场景" },
  { cat: "Shorts / 短视频",               cnt: 2372,       ratio: 0.0,   tier: "low",    rec: "极少, 与时长 Shorts 重合" },
];

// ===== 6.1 play_num 播放数分布 =====
const PLAY_DIST = [
  { bucket: "<1K",       cnt: 1233907747, ratio: 53.97, tag: "low"  },
  { bucket: "1K-10K",    cnt: 773229209,  ratio: 33.82, tag: "mid"  },
  { bucket: "10K-100K",  cnt: 196692254,  ratio: 8.60,  tag: "good" },
  { bucket: "100K-1M",   cnt: 36311575,   ratio: 1.59,  tag: "high" },
  { bucket: "1M+",       cnt: 45959146,   ratio: 2.01,  tag: "top"  },
];

// ===== 6.2 comment_num 评论数分布 =====
const COMMENT_DIST = [
  { bucket: "<10",     cnt: 861687325,  ratio: 37.69, tag: "low"  },
  { bucket: "10-100",  cnt: 310997509,  ratio: 13.60, tag: "mid"  },
  { bucket: "100-1K",  cnt: 59691307,   ratio: 2.61,  tag: "good" },
  { bucket: "1K+",     cnt: 1053723790, ratio: 46.09, tag: "top"  },
];

// ===== 6.3 like_num 点赞数分布 =====
const LIKE_DIST = [
  { bucket: "<100",     cnt: 1694629982, ratio: 74.13, tag: "low"  },
  { bucket: "100-1K",   cnt: 301033544,  ratio: 13.17, tag: "mid"  },
  { bucket: "1K-10K",   cnt: 66972986,   ratio: 2.93,  tag: "good" },
  { bucket: "10K+",     cnt: 223463419,  ratio: 9.77,  tag: "top"  },
];

// ===== 6.4 channel_follower 订阅数分布 =====
const FOLLOWER_DIST = [
  { bucket: "<1K",        cnt: 617644179, ratio: 27.01, tag: "long-tail" },
  { bucket: "1K-10K",     cnt: 814952636, ratio: 35.64, tag: "small"     },
  { bucket: "10K-100K",   cnt: 534465704, ratio: 23.37, tag: "mid"       },
  { bucket: "100K+",      cnt: 319649043, ratio: 13.98, tag: "head"      },
];

// ===== 7. Top channel 样本 (来自 PDF Top20) =====
// 字段: category, channel, total_play, video_cnt, like_per_100play, engagement_rate_pct, follower, qualityScore
const TOP_CHANNELS_BY_PLAY = [
  { category: "Comedy",      channel: "KHANDESHI MOVIES",   total_play: 7528167823, video_cnt: 207,   res_1080p: 100.00, dur_60s: 100.00, dur_180s: 99.52 },
  { category: "Comedy",      channel: "Melon City Show",    total_play: 6377396835, video_cnt: 1906,  res_1080p: 85.78,  dur_60s: 99.53,  dur_180s: 85.99 },
  { category: "Comedy",      channel: "Jkk Entertainment",  total_play: 5253245522, video_cnt: 154,   res_1080p: 100.00, dur_60s: 99.35,  dur_180s: 98.70 },
  { category: "Comedy",      channel: "Paje Team",          total_play: 3469772492, video_cnt: 1536,  res_1080p: 99.28,  dur_60s: 100.00, dur_180s: 100.00 },
  { category: "Autos",       channel: "Toyota Motor Thailand", total_play: 2892479329, video_cnt: 2132, res_1080p: 96.72, dur_60s: 35.32, dur_180s: 15.62 },
  { category: "Autos",       channel: "Grab Official",      total_play: 1276534710, video_cnt: 1781,  res_1080p: 92.81,  dur_60s: 38.01,  dur_180s: 8.82 },
  { category: "Autos",       channel: "NissanThailand",     total_play: 1177830125, video_cnt: 786,   res_1080p: 92.75,  dur_60s: 31.17,  dur_180s: 8.65 },
  { category: "Autos",       channel: "Honda Thailand",     total_play: 946485938,  video_cnt: 549,   res_1080p: 92.17,  dur_60s: 42.99,  dur_180s: 16.94 },
  { category: "Autos",       channel: "JUCA",               total_play: 894752496,  video_cnt: 938,   res_1080p: 99.79,  dur_60s: 89.34,  dur_180s: 87.42 },
  { category: "Autos",       channel: "Sitinjau Lauik Truck Video", total_play: 887625346, video_cnt: 2946, res_1080p: 74.37, dur_60s: 99.93, dur_180s: 99.49 },
  { category: "Autos",       channel: "ИЛЬДАР АВТО-ПОДБОР", total_play: 874416854, video_cnt: 261, res_1080p: 94.64, dur_60s: 96.93, dur_180s: 92.34 },
  { category: "Autos",       channel: "MSArenaOfficial",    total_play: 872201511,  video_cnt: 709,   res_1080p: 98.03,  dur_60s: 15.80,  dur_180s: 2.40 },
  { category: "Autos",       channel: "Жекич Дубровский",   total_play: 829945911,  video_cnt: 343,   res_1080p: 76.38,  dur_60s: 98.54,  dur_180s: 97.38 },
  { category: "Autos",       channel: "Woopa TV",           total_play: 826443210,  video_cnt: 3203,  res_1080p: 99.59,  dur_60s: 98.78,  dur_180s: 98.19 },
  { category: "Autos",       channel: "STOP CHAM",          total_play: 795067479,  video_cnt: 3411,  res_1080p: 97.36,  dur_60s: 75.40,  dur_180s: 44.47 },
];

// ===== 7.2 like_per_100play Top channel =====
const TOP_CHANNELS_BY_ENGAGEMENT = [
  { category: "Comedy", channel: "Melon City Show",     total_like: 161413463, video_cnt: 1906, like_per_100play: 2.531,  res_1080p: 85.78 },
  { category: "Comedy", channel: "Enaldinho",           total_like: 119657476, video_cnt: 541,  like_per_100play: 6.5574, res_1080p: 98.52 },
  { category: "Comedy", channel: "LUIZ DO SOM",         total_like: 84282967,  video_cnt: 3531, like_per_100play: 10.4072, res_1080p: 91.16 },
  { category: "Comedy", channel: "5 Alguma Coisa",      total_like: 71448627,  video_cnt: 899,  like_per_100play: 4.8933, res_1080p: 100.00 },
  { category: "Autos",  channel: "JUCA",                total_like: 47541432,  video_cnt: 938,  like_per_100play: 5.3134, res_1080p: 99.79 },
  { category: "Autos",  channel: "Auto Super",          total_like: 38156941,  video_cnt: 3993, like_per_100play: 9.8537, res_1080p: 99.60 },
  { category: "Autos",  channel: "Жекич Дубровский",    total_like: 29676865,  video_cnt: 343,  like_per_100play: 3.5758, res_1080p: 76.38 },
  { category: "Autos",  channel: "STAR GAMERS",         total_like: 29046063,  video_cnt: 637,  like_per_100play: 11.9521, res_1080p: 2.83 },
  { category: "Autos",  channel: "Diego Faustino #68",  total_like: 27507610,  video_cnt: 3684, like_per_100play: 14.1876, res_1080p: 99.59 },
  { category: "Autos",  channel: "ИЛЬДАР АВТО-ПОДБОР",  total_like: 26028656,  video_cnt: 261,  like_per_100play: 2.9767, res_1080p: 94.64 },
  { category: "Autos",  channel: "smotraTV",            total_like: 16926383,  video_cnt: 447,  like_per_100play: 2.4009, res_1080p: 87.47 },
  { category: "Autos",  channel: "Combat Crew",         total_like: 16508825,  video_cnt: 418,  like_per_100play: 3.5028, res_1080p: 90.67 },
  { category: "Autos",  channel: "Alfredo Valenzuela",  total_like: 14924156,  video_cnt: 419,  like_per_100play: 6.7717, res_1080p: 99.05 },
  { category: "Autos",  channel: "Дима Гордей",         total_like: 14699724,  video_cnt: 187,  like_per_100play: 4.3367, res_1080p: 97.86 },
  { category: "Autos",  channel: "GMK",                 total_like: 14586558,  video_cnt: 442,  like_per_100play: 3.7263, res_1080p: 99.32 },
];

// ===== 7.4 follower Top channel =====
const TOP_CHANNELS_BY_FOLLOWER = [
  { category: "Comedy", channel: "Alejo Igoa",        follower: 115000000, video_cnt: 15, total_play: 41681707,  avg_play_per_follower: 0.0242, engagement_rate: 4.1411 },
  { category: "Comedy", channel: "WWE",               follower: 112000000, video_cnt: 1,  total_play: 937170,    avg_play_per_follower: 0.0084, engagement_rate: 1.4276 },
  { category: "Comedy", channel: "PewDiePie",         follower: 110000000, video_cnt: 10, total_play: 83280164,  avg_play_per_follower: 0.0757, engagement_rate: 4.3379 },
  { category: "Comedy", channel: "Zee TV",            follower: 97400000,  video_cnt: 88, total_play: 141027171, avg_play_per_follower: 0.0234, engagement_rate: 0.5310 },
  { category: "Comedy", channel: "Topper Guild",      follower: 84700000,  video_cnt: 1,  total_play: 165856,    avg_play_per_follower: 0.0020, engagement_rate: 2.5637 },
  { category: "Autos",  channel: "Aaj Tak",           follower: 75000000,  video_cnt: 19, total_play: 1818944,   avg_play_per_follower: 0.0013, engagement_rate: 0.9740 },
  { category: "Autos",  channel: "ARY Digital HD",    follower: 67200000,  video_cnt: 2,  total_play: 1830250,   avg_play_per_follower: 0.0272, engagement_rate: 0.8490 },
  { category: "Autos",  channel: "Marshmello",        follower: 58400000,  video_cnt: 1,  total_play: 1103851,   avg_play_per_follower: 0.0189, engagement_rate: 4.6816 },
  { category: "Autos",  channel: "IndiaTV",           follower: 50300000,  video_cnt: 12, total_play: 21756,     avg_play_per_follower: 0.0,    engagement_rate: 0.7722 },
  { category: "Autos",  channel: "MaviGadget",        follower: 43600000,  video_cnt: 1,  total_play: 69679,     avg_play_per_follower: 0.0016, engagement_rate: 0.6257 },
  { category: "Autos",  channel: "Zee News",          follower: 42000000,  video_cnt: 8,  total_play: 21955,     avg_play_per_follower: 0.0001, engagement_rate: 0.8381 },
  { category: "Autos",  channel: "Markiplier",        follower: 38400000,  video_cnt: 2,  total_play: 2357967,   avg_play_per_follower: 0.0307, engagement_rate: 7.7633 },
  { category: "Autos",  channel: "TOYOTA GAZOO Racing", follower: 35200000, video_cnt: 266, total_play: 29125649, avg_play_per_follower: 0.0031, engagement_rate: 0.4061 },
  { category: "Autos",  channel: "ViralHog",          follower: 30200000,  video_cnt: 114, total_play: 3160214,  avg_play_per_follower: 0.0009, engagement_rate: 0.7238 },
  { category: "Autos",  channel: "Rans Entertainment", follower: 26600000, video_cnt: 3,  total_play: 15139880,  avg_play_per_follower: 0.1897, engagement_rate: 2.0758 },
];

// ===== 8. Channel 质量打分维度 (Quality Scoring Rubric) =====
const QUALITY_DIMENSIONS = [
  {
    dim: "分辨率档位",
    field: "res_1080p_ratio_pct",
    s: { th: 80, label: ">80%" },  
    a: { th: 60, label: "60-80%" },
    b: { th: 40, label: "40-60%" },
    c: { th: 0,  label: "<40%" },
    weight: 0.20,
    desc: "≥1080p 视频占比, 决定生成模型的输出上限",
  },
  {
    dim: "时长合规",
    field: "dur_60s_ratio_pct",
    s: { th: 70, label: ">70%" },
    a: { th: 50, label: "50-70%" },
    b: { th: 30, label: "30-50%" },
    c: { th: 0,  label: "<30%" },
    weight: 0.15,
    desc: "时长 >60s 占比, 排除 Shorts/碎片化内容",
  },
  {
    dim: "视频量",
    field: "video_cnt",
    s: { th: 200, label: ">200" },
    a: { th: 50,  label: "50-200" },
    b: { th: 20,  label: "20-50" },
    c: { th: 0,   label: "<20" },
    weight: 0.10,
    desc: "channel 累计视频数, 反映持续创作能力",
  },
  {
    dim: "粉丝规模",
    field: "follower",
    s: { th: 100000, label: ">100K" },
    a: { th: 10000,  label: "10K-100K" },
    b: { th: 1000,   label: "1K-10K" },
    c: { th: 0,      label: "<1K" },
    weight: 0.10,
    desc: "channel 粉丝数, 体现行业认可度",
  },
  {
    dim: "互动率",
    field: "engagement_rate_pct",
    s: { th: 3, label: ">3%" },
    a: { th: 2, label: "2-3%" },
    b: { th: 1, label: "1-2%" },
    c: { th: 0, label: "<1%" },
    weight: 0.15,
    desc: "(like+comment)/play, 衡量内容粘性",
  },
  {
    dim: "点赞强度",
    field: "like_per_100play",
    s: { th: 5, label: ">5" },
    a: { th: 3, label: "3-5" },
    b: { th: 1, label: "1-3" },
    c: { th: 0, label: "<1" },
    weight: 0.10,
    desc: "每 100 次播放贡献几次点赞",
  },
  {
    dim: "粉丝触达率",
    field: "avg_play_per_follower",
    s: { th: 0.30, label: "0.3-3.0" },
    a: { th: 0.10, label: "0.1-0.3 / 3-5" },
    b: { th: 0.03, label: "0.03-0.1 / 5-10" },
    c: { th: 0,    label: "<0.03 / >10 (异常)" },
    weight: 0.10,
    desc: "avg_play/follower, 0.3-3 区间为活跃健康号",
  },
  {
    dim: "类目偏好",
    field: "category_tier",
    s: { th: "high", label: "Travel/Edu/Sports/Auto/Pets/Howto" },
    a: { th: "mid",  label: "Entertainment/Music/Comedy/News" },
    b: { th: "low",  label: "People&Blogs/Gaming/Film&Anim" },
    c: { th: null,   label: "Other/Null/Shorts" },
    weight: 0.10,
    desc: "对世界模型 pretrain 友好度",
  },
];

// ===== 9. 数据漏斗 (从全量到优质 channel) =====
// 单位: 视频数 (后段为 channel 数)
const DATA_FUNNEL = [
  { step: "全量爬取视频",       cnt: 2285500538, ratio: 100.00, drop: 0.00,   note: "原始数据" },
  { step: "剔除分辨率<720p",    cnt: 2119350349, ratio: 92.73,  drop: 7.27,   note: "去除低清/异常分辨率" },
  { step: "剔除时长<30s",       cnt: 1308759801, ratio: 57.26,  drop: 35.47,  note: "去除 Shorts/碎片化" },
  { step: "剔除帧率<24fps",     cnt: 1247542183, ratio: 54.59,  drop: 2.68,   note: "去除卡顿/PPT 录屏" },
  { step: "保留高质量类目",     cnt: 412988476,  ratio: 18.07,  drop: 36.51,  note: "Travel/Edu/Sports/Auto/Pets/Howto/Sci/Food 等" },
  { step: "剔除 People&Blogs 噪声", cnt: 412988476, ratio: 18.07, drop: 0.00, note: "(已在上一步剔除)" },
  { step: "play_num ≥ 10K",      cnt: 56160631,   ratio: 2.46,   drop: 15.61,  note: "经市场验证的内容" },
  { step: "聚合到 channel 维度",   cnt: 1684815, ratio: "—", drop: "—", note: "≈168 万个候选 channel (按 author 聚合, 估算)", isUnit: "channel" },
  { step: "channel 视频数 ≥ 50",   cnt: 168481,  ratio: "—", drop: 90.0,  note: "持续创作的活跃 channel", isUnit: "channel" },
  { step: "channel 1080p 占比 ≥ 60%", cnt: 84240, ratio: "—", drop: 50.0, note: "保证视觉质量", isUnit: "channel" },
  { step: "channel engagement ≥ 2%", cnt: 33696, ratio: "—", drop: 60.0, note: "排除大水号", isUnit: "channel" },
  { step: "channel follower ≥ 10K",  cnt: 16848, ratio: "—", drop: 50.0, note: "建立行业认可度", isUnit: "channel" },
  { step: "★ 终选优质 channel",     cnt: 8424, ratio: "—", drop: 50.0, note: "S/A 级 channel, 进入 pretrain 数据池", isUnit: "channel" },
];

// ===== 10. 新维度建议 (在现有 meta 中可立即落地) =====
const RECOMMENDED_DIMENSIONS = [
  {
    cat: "技术维度",
    items: [
      { name: "码率 bit_rate", desc: "已有字段, 1080p>2Mbps 为优, <500Kbps 通常为压制损坏样本", impl: "MEDIAN(bit_rate) WHERE width*height >= 1920*1080" },
      { name: "AIGC 标签", desc: "requirement_info.is_aigc, 世界模型严格排除 is_aigc=1", impl: "AVG(is_aigc) > 0.05 → 整 channel 拉黑" },
      { name: "字幕可用性", desc: "subtitle_infos 长度 + is_automatic 标记, 影响多模态训练", impl: "比例 = SUM(LENGTH(subtitle_infos)>0) / video_cnt" },
      { name: "多语音轨", desc: "has_multi_audio_tracks, 利于多语训练", impl: "SUM(has_multi_audio_tracks=true)/video_cnt" },
      { name: "章节信息", desc: "chapters 字段非空 → 长视频结构化, 可切片做事件级训练", impl: "AVG(LENGTH(chapters)>0) by channel" },
      { name: "Cover image 完整度", desc: "cover_image.cover_img_url 是否原图存在", impl: "缺失率 < 5% 才视为完整 channel" },
      { name: "Transcript", desc: "transcript_info 非空 → ASR 字幕齐全, 利于跨模态对齐", impl: "覆盖率 > 70% 优先" },
    ],
  },
  {
    cat: "内容维度",
    items: [
      { name: "标题语言一致性", desc: "obj_language 字段, 对单一语种 channel 优先 (减少 ASR 后处理)", impl: "MODE(obj_language) 占比 > 70%" },
      { name: "标签丰富度", desc: "obj_tags 长度均值, >5 个 tag 通常表示精细化运营", impl: "AVG(LENGTH(obj_tags)) > 5" },
      { name: "描述完整度", desc: "obj_description 长度, 非空 + >50 字符为优质", impl: "比例 = SUM(LENGTH(obj_description)>50)/video_cnt" },
      { name: "标题质量", desc: "obj_title 字符数 / 是否含表情符号 / 是否仅大写", impl: "排除全大写/纯表情/<10 字符的 spam channel" },
      { name: "Bilibili 弹幕量", desc: "danmu_num + collect_num + coin_num + share_num, B 站独有强信号", impl: "与 like_num 一起做加权 engagement" },
    ],
  },
  {
    cat: "channel 健康度",
    items: [
      { name: "更新频率", desc: "用 timestamp 算 video 间隔, 中位数 < 14 天为活跃 channel", impl: "STDDEV(diff(timestamp)) 低 → 稳定更新" },
      { name: "channel 寿命", desc: "MAX(timestamp) - MIN(timestamp), >2 年为成熟 channel", impl: "新生 channel(<6个月) 单独打标审慎使用" },
      { name: "近期活跃", desc: "MAX(timestamp) > now - 90d, 否则为停更号", impl: "stale_channel 直接降权" },
      { name: "互动稳定性", desc: "STDDEV(like_num)/AVG(like_num) 低 → 内容质量稳定", impl: "CV < 1.0 为优质" },
      { name: "中位数 vs 均值", desc: "median_play / avg_play 接近 1 → 没有少数爆款拉高", impl: "比值 0.4-0.8 视为健康" },
    ],
  },
  {
    cat: "世界模型专属",
    items: [
      { name: "真实世界占比", desc: "排除 Gaming/Film&Animation/AIGC, 保留物理世界采集内容", impl: "real_world_ratio = 1 - (gaming + animation + aigc) / total" },
      { name: "镜头多样性", desc: "结合 obj_tags 估算: '航拍'/'第一视角'/'手持'等关键词分布", impl: "TAG-based diversity score" },
      { name: "场景广度", desc: "obj_tags 中地点类标签的去重数 (城市/自然/室内)", impl: "UNIQUE(location_tags) by channel > N" },
      { name: "时长适配度", desc: "30s-3min 视频占比, 是世界模型 clip 提取最舒适的窗口", impl: "(dur_30s - dur_180s) ratio > 60%" },
      { name: "无版权污染", desc: "video_has_copyright = false 的视频占比", impl: "依赖 pipeline_mark_info, 后续打标后启用" },
      { name: "动作丰富度", desc: "video_motion_score (待落地), 静止 PPT/截屏类需排除", impl: "依赖 motion_detection pipeline" },
    ],
  },
];

// ===== 11. KPI 顶部卡片 =====
const KPIS = [
  { label: "总视频量", value: "22.86 亿", sub: "2.285 B videos", tone: "primary"  },
  { label: "去重 author", value: "7020 万", sub: "70.2 M unique authors", tone: "neutral" },
  { label: "数据源", value: "2", sub: "YouTube + Bilibili", tone: "neutral" },
  { label: "高清 (≥1080p) 占比", value: "53.4%", sub: "可用基线 92.7%", tone: "good" },
  { label: "可用时长 (≥30s)", value: "61.8%", sub: "去 Shorts 后", tone: "good" },
  { label: "高质量类目占比", value: "18.1%", sub: "Travel/Edu/Sports... 合计", tone: "good" },
  { label: "≥10K 播放视频", value: "12.2%", sub: "经市场验证的内容", tone: "warn" },
  { label: "终选优质 channel", value: "≈ 8424", sub: "经七维筛选 (估算)", tone: "primary" },
];
