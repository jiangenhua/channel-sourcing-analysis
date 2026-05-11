/**
 * 漫游数据源盘点 - Top20 详细数据 (按类目 x 维度)
 *
 * 维度: a) play_num   b) like_num   c) comment_num   d) follower
 * 取每个类目的 Top 10 (从 Top20 抽取)
 *
 * 字段说明:
 *   total_xxx    : 累计指标
 *   avg_xxx      : 平均指标
 *   median_xxx   : 中位数
 *   video_cnt    : 该 channel 在样本中的视频数
 *   res_*        : 各分辨率档位占比 (%)
 *   dur_*        : 时长 ≥ X 秒的占比 (%)
 *   like_per_100play : 每 100 次播放贡献的点赞数
 *   comment_per_1k_play : 每 1000 次播放贡献的评论数
 *   comment_share_pct : 评论 / (评论+点赞) 百分比, 衡量讨论性
 *   avg_play_per_follower : 平均播放/粉丝, 触达率
 *   engagement_rate_pct : (点赞+评论) / 播放 * 100, 综合互动率
 */

// ===== A) Top10 by play_num (每类目取前 10) =====
const TOP_BY_PLAY = {
  "Autos & Vehicles / 汽车": [
    { rk: 1,  channel: "Toyota Motor Thailand",       total: 2892479329, video_cnt: 2132, res_1080p: 96.72, dur_60s: 35.32, dur_180s: 15.62 },
    { rk: 2,  channel: "Grab Official",               total: 1276534710, video_cnt: 1781, res_1080p: 92.81, dur_60s: 38.01, dur_180s: 8.82 },
    { rk: 3,  channel: "NissanThailand",              total: 1177830125, video_cnt: 786,  res_1080p: 92.75, dur_60s: 31.17, dur_180s: 8.65 },
    { rk: 4,  channel: "Honda Thailand",              total: 946485938,  video_cnt: 549,  res_1080p: 92.17, dur_60s: 42.99, dur_180s: 16.94 },
    { rk: 5,  channel: "JUCA",                        total: 894752496,  video_cnt: 938,  res_1080p: 99.79, dur_60s: 89.34, dur_180s: 87.42 },
    { rk: 6,  channel: "Sitinjau Lauik Truck Video",  total: 887625346,  video_cnt: 2946, res_1080p: 74.37, dur_60s: 99.93, dur_180s: 99.49 },
    { rk: 7,  channel: "ИЛЬДАР АВТО-ПОДБОР",          total: 874416854,  video_cnt: 261,  res_1080p: 94.64, dur_60s: 96.93, dur_180s: 92.34 },
    { rk: 8,  channel: "MSArenaOfficial",             total: 872201511,  video_cnt: 709,  res_1080p: 98.03, dur_60s: 15.80, dur_180s: 2.40 },
    { rk: 9,  channel: "Жекич Дубровский",            total: 829945911,  video_cnt: 343,  res_1080p: 76.38, dur_60s: 98.54, dur_180s: 97.38 },
    { rk: 10, channel: "Woopa TV",                    total: 826443210,  video_cnt: 3203, res_1080p: 99.59, dur_60s: 98.78, dur_180s: 98.19 },
  ],
  "Comedy / 喜剧": [
    { rk: 1,  channel: "KHANDESHI MOVIES",            total: 7528167823, video_cnt: 207,  res_1080p: 100.00, dur_60s: 100.00, dur_180s: 99.52 },
    { rk: 2,  channel: "Melon City Show",             total: 6377396835, video_cnt: 1906, res_1080p: 85.78,  dur_60s: 99.53,  dur_180s: 85.99 },
    { rk: 3,  channel: "Jkk Entertainment",           total: 5253245522, video_cnt: 154,  res_1080p: 100.00, dur_60s: 99.35,  dur_180s: 98.70 },
    { rk: 4,  channel: "Paje Team",                   total: 3469772492, video_cnt: 1536, res_1080p: 99.28,  dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 5,  channel: "Çok Güzel Hareketler",        total: 3406392877, video_cnt: 3477, res_1080p: 99.31,  dur_60s: 90.05,  dur_180s: 76.39 },
    { rk: 6,  channel: "Taarak Mehta Ka Ooltah Chashmah", total: 3276630121, video_cnt: 5479, res_1080p: 99.32, dur_60s: 72.18, dur_180s: 64.28 },
    { rk: 7,  channel: "Официальный канал КВН",       total: 2807679952, video_cnt: 2172, res_1080p: 71.73,  dur_60s: 95.67,  dur_180s: 86.51 },
    { rk: 8,  channel: "YangiKulgu Official",         total: 2292152262, video_cnt: 6872, res_1080p: 80.06,  dur_60s: 88.42,  dur_180s: 73.37 },
    { rk: 9,  channel: "AMIGOS FOREVER! Arabic",      total: 2247508732, video_cnt: 601,  res_1080p: 100.00, dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 10, channel: "Уральские Пельмени",          total: 2214563728, video_cnt: 915,  res_1080p: 93.22,  dur_60s: 98.47,  dur_180s: 91.69 },
  ],
  "Education / 教育": [
    { rk: 1,  channel: "SORPRENDENTE",                total: 2188528932, video_cnt: 1470, res_1080p: 99.32, dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 2,  channel: "깨비키즈 [KEBIKIDS]",         total: 1964959414, video_cnt: 2068, res_1080p: 71.32, dur_60s: 99.27,  dur_180s: 74.71 },
    { rk: 3,  channel: "Hindi Countdown",             total: 1755847740, video_cnt: 316,  res_1080p: 98.73, dur_60s: 100.00, dur_180s: 99.68 },
    { rk: 4,  channel: "Madan Gowri",                 total: 1722366999, video_cnt: 2572, res_1080p: 68.93, dur_60s: 96.73,  dur_180s: 96.31 },
    { rk: 5,  channel: "POKEPOKE",                    total: 1586309081, video_cnt: 606,  res_1080p: 100.00, dur_60s: 97.03, dur_180s: 9.24 },
    { rk: 6,  channel: "Universidad Tecnológica de México", total: 1398298726, video_cnt: 590, res_1080p: 82.03, dur_60s: 81.19, dur_180s: 51.69 },
    { rk: 7,  channel: "আলোর পথ",                     total: 1327834741, video_cnt: 1704, res_1080p: 99.53, dur_60s: 100.00, dur_180s: 98.30 },
    { rk: 8,  channel: "Mujerdebuenapasta",           total: 1151089366, video_cnt: 209,  res_1080p: 100.00, dur_60s: 2.39,  dur_180s: 0.00 },
    { rk: 9,  channel: "StudyIQ IAS",                 total: 1147520265, video_cnt: 14092,res_1080p: 57.61, dur_60s: 98.29,  dur_180s: 94.64 },
    { rk: 10, channel: "PD",                          total: 1136442878, video_cnt: 1431, res_1080p: 51.57, dur_60s: 99.72,  dur_180s: 99.02 },
  ],
  "Entertainment / 娱乐": [
    { rk: 1,  channel: "Vijay Television",            total: 16552695315, video_cnt: 33708, res_1080p: 90.40, dur_60s: 59.99, dur_180s: 28.67 },
    { rk: 2,  channel: "Sun TV",                      total: 12160682250, video_cnt: 49791, res_1080p: 91.64, dur_60s: 68.06, dur_180s: 56.96 },
    { rk: 3,  channel: "WorkpointOfficial",           total: 11164289933, video_cnt: 41359, res_1080p: 99.57, dur_60s: 94.62, dur_180s: 74.33 },
    { rk: 4,  channel: "Shemaroo",                    total: 10800283262, video_cnt: 3293,  res_1080p: 95.29, dur_60s: 96.63, dur_180s: 90.68 },
    { rk: 5,  channel: "Mister Max",                  total: 9862968990,  video_cnt: 920,   res_1080p: 94.35, dur_60s: 100.00, dur_180s: 95.98 },
    { rk: 6,  channel: "SET India",                   total: 9500115500,  video_cnt: 8390,  res_1080p: 94.26, dur_60s: 88.46,  dur_180s: 83.83 },
    { rk: 7,  channel: "Jasmin and James",            total: 9424536684,  video_cnt: 4427,  res_1080p: 99.44, dur_60s: 0.68,   dur_180s: 0.05 },
    { rk: 8,  channel: "Tarang TV",                   total: 9296963033,  video_cnt: 34055, res_1080p: 99.61, dur_60s: 69.67,  dur_180s: 51.31 },
    { rk: 9,  channel: "Dangal TV Channel",           total: 8403232667,  video_cnt: 8643,  res_1080p: 97.22, dur_60s: 83.49,  dur_180s: 82.77 },
    { rk: 10, channel: "Ch3Thailand",                 total: 7609193597,  video_cnt: 25325, res_1080p: 85.73, dur_60s: 85.70,  dur_180s: 63.53 },
  ],
  "Film & Animation / 影视动画": [
    { rk: 1,  channel: "Goldmines",                   total: 7584706249, video_cnt: 1828, res_1080p: 99.18, dur_60s: 98.74, dur_180s: 97.98 },
    { rk: 2,  channel: "Goldmines Dishoom",           total: 5611237053, video_cnt: 4380, res_1080p: 94.73, dur_60s: 99.63, dur_180s: 99.47 },
    { rk: 3,  channel: "Shemaroo Movies",             total: 5513143016, video_cnt: 5686, res_1080p: 98.45, dur_60s: 99.31, dur_180s: 98.65 },
    { rk: 4,  channel: "Tilak",                       total: 4421776614, video_cnt: 6136, res_1080p: 97.77, dur_60s: 91.84, dur_180s: 82.66 },
    { rk: 5,  channel: "Goldmines Bollywood",         total: 4420088479, video_cnt: 1400, res_1080p: 93.00, dur_60s: 99.93, dur_180s: 99.93 },
    { rk: 6,  channel: "Niloya",                      total: 4334738174, video_cnt: 872,  res_1080p: 97.25, dur_60s: 92.78, dur_180s: 86.12 },
    { rk: 7,  channel: "Ultra Movie Parlour",         total: 3549629349, video_cnt: 1191, res_1080p: 85.14, dur_60s: 98.74, dur_180s: 97.48 },
    { rk: 8,  channel: "new bride",                   total: 3326083472, video_cnt: 2894, res_1080p: 99.83, dur_60s: 96.16, dur_180s: 89.50 },
    { rk: 9,  channel: "UzbekFilmsHD",                total: 2580938274, video_cnt: 4906, res_1080p: 84.10, dur_60s: 95.94, dur_180s: 92.52 },
    { rk: 10, channel: "Wamindia Movies",             total: 2091066738, video_cnt: 345,  res_1080p: 88.99, dur_60s: 98.26, dur_180s: 96.52 },
  ],
  "Gaming / 游戏": [
    { rk: 1,  channel: "EdisonPts",                   total: 8064773658, video_cnt: 4111, res_1080p: 55.24, dur_60s: 99.81, dur_180s: 99.51 },
    { rk: 2,  channel: "DanTDM",                      total: 7802917431, video_cnt: 1807, res_1080p: 28.61, dur_60s: 99.89, dur_180s: 98.56 },
    { rk: 3,  channel: "AuthenticGames",              total: 7633240124, video_cnt: 4028, res_1080p: 23.56, dur_60s: 99.30, dur_180s: 95.33 },
    { rk: 4,  channel: "Kuplinov ► Play",             total: 6981123967, video_cnt: 6765, res_1080p: 81.18, dur_60s: 99.97, dur_180s: 99.78 },
    { rk: 5,  channel: "ItsFunneh",                   total: 5680047953, video_cnt: 1366, res_1080p: 97.14, dur_60s: 99.41, dur_180s: 99.12 },
    { rk: 6,  channel: "Robin Hood Gamer",            total: 5407265924, video_cnt: 2820, res_1080p: 80.35, dur_60s: 99.82, dur_180s: 95.96 },
    { rk: 7,  channel: "Kwebbelkop",                  total: 5148573693, video_cnt: 4372, res_1080p: 84.86, dur_60s: 99.57, dur_180s: 95.17 },
    { rk: 8,  channel: "Compot",                      total: 5099577356, video_cnt: 1505, res_1080p: 99.47, dur_60s: 100.00, dur_180s: 99.93 },
    { rk: 9,  channel: "MrLololoshka (Роман Фильченков)", total: 5000243652, video_cnt: 4072, res_1080p: 90.69, dur_60s: 99.75, dur_180s: 96.29 },
    { rk: 10, channel: "Mikecrack",                   total: 4736609524, video_cnt: 998,  res_1080p: 71.64, dur_60s: 99.00, dur_180s: 95.59 },
  ],
  "Howto & Style / 生活时尚": [
    { rk: 1,  channel: "Трум Трум",                   total: 6820941325, video_cnt: 2603, res_1080p: 99.96, dur_60s: 100.00, dur_180s: 99.23 },
    { rk: 2,  channel: "魔女的契约",                  total: 6317616439, video_cnt: 3466, res_1080p: 100.00, dur_60s: 0.14, dur_180s: 0.14 },
    { rk: 3,  channel: "Troom Troom India",           total: 6026246287, video_cnt: 2950, res_1080p: 100.00, dur_60s: 99.83, dur_180s: 99.83 },
    { rk: 4,  channel: "5-Minute Crafts",             total: 5148379505, video_cnt: 1701, res_1080p: 99.06,  dur_60s: 98.00, dur_180s: 96.30 },
    { rk: 5,  channel: "Troom Troom Vietnam",         total: 3922427022, video_cnt: 2470, res_1080p: 100.00, dur_60s: 99.80, dur_180s: 99.80 },
    { rk: 6,  channel: "حِرف إبداعية في 5 دقائق",     total: 3264433566, video_cnt: 4732, res_1080p: 91.86,  dur_60s: 99.89, dur_180s: 99.85 },
    { rk: 7,  channel: "Troom Troom",                 total: 3203463575, video_cnt: 850,  res_1080p: 100.00, dur_60s: 99.88, dur_180s: 98.71 },
    { rk: 8,  channel: "WooHoo Arabic",               total: 3014736301, video_cnt: 1037, res_1080p: 100.00, dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 9,  channel: "猎魔女团三人组",              total: 3008297765, video_cnt: 2878, res_1080p: 100.00, dur_60s: 0.00,  dur_180s: 0.00 },
    { rk: 10, channel: "Трум Трум СЕЛЕКТ",            total: 2930171349, video_cnt: 2111, res_1080p: 100.00, dur_60s: 100.00, dur_180s: 100.00 },
  ],
  "Music / 音乐": [
    { rk: 1,  channel: "قناة طيور الجنة | toyoraljanahtv", total: 16538778274, video_cnt: 2684, res_1080p: 52.46, dur_60s: 88.38, dur_180s: 55.40 },
    { rk: 2,  channel: "Eternal Love",                total: 6455346369, video_cnt: 1646, res_1080p: 82.62, dur_60s: 14.76, dur_180s: 14.52 },
    { rk: 3,  channel: "T-Series Bhakti Sagar",       total: 5324867318, video_cnt: 16041, res_1080p: 84.71, dur_60s: 99.25, dur_180s: 96.34 },
    { rk: 4,  channel: "Teddy Dear",                  total: 3824869370, video_cnt: 1121, res_1080p: 77.34, dur_60s: 0.54, dur_180s: 0.54 },
    { rk: 5,  channel: "Aditya Music",                total: 3555301744, video_cnt: 9002, res_1080p: 77.04, dur_60s: 78.68, dur_180s: 54.68 },
    { rk: 6,  channel: "rsfriends",                   total: 3390288523, video_cnt: 1763, res_1080p: 54.28, dur_60s: 92.51, dur_180s: 84.63 },
    { rk: 7,  channel: "Basim Karbalaei",             total: 3334528279, video_cnt: 1005, res_1080p: 93.93, dur_60s: 92.14, dur_180s: 90.15 },
    { rk: 8,  channel: "ไพบูลย์ แสงเดือน OFFICIAL",  total: 2804760818, video_cnt: 525,  res_1080p: 97.33, dur_60s: 94.48, dur_180s: 90.29 },
    { rk: 9,  channel: "MK Studio",                   total: 2714688924, video_cnt: 147,  res_1080p: 85.71, dur_60s: 82.99, dur_180s: 65.99 },
    { rk: 10, channel: "TMG Record Channel",          total: 2307994028, video_cnt: 1306, res_1080p: 92.96, dur_60s: 79.10, dur_180s: 75.34 },
  ],
  "News & Politics / 新闻与政治": [
    { rk: 1,  channel: "Zee News",                    total: 10190667531, video_cnt: 127337, res_1080p: 82.83, dur_60s: 93.72, dur_180s: 66.09 },
    { rk: 2,  channel: "Thairath News",               total: 9583519064,  video_cnt: 144654, res_1080p: 65.07, dur_60s: 98.95, dur_180s: 71.97 },
    { rk: 3,  channel: "ABP MAJHA",                   total: 9372230367,  video_cnt: 349871, res_1080p: 42.34, dur_60s: 80.87, dur_180s: 34.75 },
    { rk: 4,  channel: "24 Канал",                    total: 7227229411,  video_cnt: 139323, res_1080p: 98.43, dur_60s: 88.53, dur_180s: 71.71 },
    { rk: 5,  channel: "AlJazeera Arabic",            total: 6706394698,  video_cnt: 85283,  res_1080p: 90.03, dur_60s: 84.88, dur_180s: 41.10 },
    { rk: 6,  channel: "Polimer News",                total: 6535671054,  video_cnt: 134182, res_1080p: 99.91, dur_60s: 84.92, dur_180s: 27.92 },
    { rk: 7,  channel: "Fox News",                    total: 5978293782,  video_cnt: 42874,  res_1080p: 3.97,  dur_60s: 92.43, dur_180s: 68.61 },
    { rk: 8,  channel: "IndiaTV",                     total: 5553430088,  video_cnt: 111923, res_1080p: 58.50, dur_60s: 81.52, dur_180s: 63.14 },
    { rk: 9,  channel: "The Lallantop",               total: 5463147864,  video_cnt: 22286,  res_1080p: 87.55, dur_60s: 98.58, dur_180s: 89.37 },
    { rk: 10, channel: "KOMPASTV",                    total: 4515295833,  video_cnt: 117450, res_1080p: 55.58, dur_60s: 92.64, dur_180s: 37.24 },
  ],
  "People & Blogs / 人物与博客": [
    { rk: 1,  channel: "Cadel and Mia",               total: 8136607101, video_cnt: 2878, res_1080p: 99.93, dur_60s: 0.28, dur_180s: 0.03 },
    { rk: 2,  channel: "Central Bureau of Communication", total: 7472971757, video_cnt: 795, res_1080p: 97.11, dur_60s: 29.18, dur_180s: 6.54 },
    { rk: 3,  channel: "Bjlife",                      total: 4540490501, video_cnt: 779,  res_1080p: 99.23, dur_60s: 97.82, dur_180s: 96.53 },
    { rk: 4,  channel: "Troom Troom Indonesia",       total: 4530011784, video_cnt: 2253, res_1080p: 100.00, dur_60s: 99.78, dur_180s: 99.78 },
    { rk: 5,  channel: "shfa",                        total: 4287598687, video_cnt: 284,  res_1080p: 94.01, dur_60s: 98.24, dur_180s: 96.83 },
    { rk: 6,  channel: "Sewar & Massa",               total: 3712781623, video_cnt: 559,  res_1080p: 90.70, dur_60s: 100.00, dur_180s: 97.32 },
    { rk: 7,  channel: "عائلة رياض",                  total: 3366046853, video_cnt: 1298, res_1080p: 99.23, dur_60s: 98.61, dur_180s: 97.23 },
    { rk: 8,  channel: "WooHoo ES",                   total: 3246939948, video_cnt: 1367, res_1080p: 100.00, dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 9,  channel: "shfa2 - شفا",                 total: 3101177767, video_cnt: 387,  res_1080p: 91.99, dur_60s: 99.48, dur_180s: 96.38 },
    { rk: 10, channel: "Like Nastya TR",              total: 3063984935, video_cnt: 789,  res_1080p: 88.85, dur_60s: 100.00, dur_180s: 99.24 },
  ],
  "Pets & Animals / 宠物与动物": [
    { rk: 1,  channel: "Murliwale Hausla",            total: 2546772978, video_cnt: 859,  res_1080p: 99.77, dur_60s: 99.88, dur_180s: 98.60 },
    { rk: 2,  channel: "Jamal Al-imwase",             total: 1839031374, video_cnt: 4684, res_1080p: 67.14, dur_60s: 95.90, dur_180s: 81.06 },
    { rk: 3,  channel: "Mochimaru",                   total: 1704114160, video_cnt: 1599, res_1080p: 100.00, dur_60s: 100.00, dur_180s: 93.62 },
    { rk: 4,  channel: "Tiger Productions",           total: 1115087184, video_cnt: 452,  res_1080p: 99.56, dur_60s: 100.00, dur_180s: 99.78 },
    { rk: 5,  channel: "Моя анимированная история",   total: 1090175700, video_cnt: 1098, res_1080p: 99.18, dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 6,  channel: "studio GNYANG",               total: 1053592590, video_cnt: 470,  res_1080p: 88.09, dur_60s: 94.68, dur_180s: 88.09 },
    { rk: 7,  channel: "Panji Petualang",             total: 1042841345, video_cnt: 1211, res_1080p: 90.42, dur_60s: 96.28, dur_180s: 85.38 },
    { rk: 8,  channel: "TOP DOGS husky and malamute", total: 1001591439, video_cnt: 1637, res_1080p: 99.76, dur_60s: 91.75, dur_180s: 80.09 },
    { rk: 9,  channel: "SBS TV동물농장",              total: 901952635,  video_cnt: 1162, res_1080p: 93.29, dur_60s: 91.05, dur_180s: 47.33 },
    { rk: 10, channel: "Min Cute",                    total: 892053339,  video_cnt: 499,  res_1080p: 96.19, dur_60s: 100.00, dur_180s: 100.00 },
  ],
  "Science & Technology / 科技": [
    { rk: 1,  channel: "Crazy XYZ",                   total: 2368324448, video_cnt: 476,  res_1080p: 99.37, dur_60s: 100.00, dur_180s: 97.48 },
    { rk: 2,  channel: "Claro RD",                    total: 1781216171, video_cnt: 798,  res_1080p: 95.49, dur_60s: 21.68, dur_180s: 2.88 },
    { rk: 3,  channel: "Motorola India",              total: 1124502735, video_cnt: 351,  res_1080p: 94.30, dur_60s: 22.22, dur_180s: 5.41 },
    { rk: 4,  channel: "GopherVid",                   total: 1115164771, video_cnt: 296,  res_1080p: 96.96, dur_60s: 99.66, dur_180s: 90.20 },
    { rk: 5,  channel: "CrazyRussianHacker",          total: 1081571651, video_cnt: 1219, res_1080p: 91.63, dur_60s: 93.77, dur_180s: 78.18 },
    { rk: 6,  channel: "Peace Working Shorts",        total: 1016510815, video_cnt: 867,  res_1080p: 100.00, dur_60s: 0.00, dur_180s: 0.00 },
    { rk: 7,  channel: "Experiment Ahong",            total: 960818312,  video_cnt: 261,  res_1080p: 100.00, dur_60s: 99.62, dur_180s: 41.38 },
    { rk: 8,  channel: "Primos Da Roleta",            total: 867401998,  video_cnt: 340,  res_1080p: 98.82, dur_60s: 97.94, dur_180s: 80.59 },
    { rk: 9,  channel: "Experiment King",             total: 844750207,  video_cnt: 1086, res_1080p: 84.25, dur_60s: 100.00, dur_180s: 88.49 },
    { rk: 10, channel: "Samsung India",               total: 806006059,  video_cnt: 1162, res_1080p: 97.68, dur_60s: 44.66, dur_180s: 6.97 },
  ],
  "Sports / 体育": [
    { rk: 1,  channel: "WWE",                         total: 4659002567, video_cnt: 8480, res_1080p: 66.18, dur_60s: 76.03, dur_180s: 36.45 },
    { rk: 2,  channel: "FutParódias",                 total: 1706957972, video_cnt: 621,  res_1080p: 99.03, dur_60s: 88.57, dur_180s: 16.43 },
    { rk: 3,  channel: "YOU C 1000",                  total: 1561337979, video_cnt: 92,   res_1080p: 89.13, dur_60s: 69.57, dur_180s: 23.91 },
    { rk: 4,  channel: "TRUE GYM MMA",                total: 1428786935, video_cnt: 1611, res_1080p: 97.70, dur_60s: 99.63, dur_180s: 91.62 },
    { rk: 5,  channel: "Celine Dept",                 total: 1386159130, video_cnt: 183,  res_1080p: 100.00, dur_60s: 10.93, dur_180s: 4.37 },
    { rk: 6,  channel: "News24 Sports",               total: 1319159248, video_cnt: 25215, res_1080p: 60.13, dur_60s: 90.52, dur_180s: 65.00 },
    { rk: 7,  channel: "ON Sport",                    total: 1310810805, video_cnt: 101006, res_1080p: 91.84, dur_60s: 94.83, dur_180s: 56.70 },
    { rk: 8,  channel: "ESPN Deportes",               total: 1228390912, video_cnt: 20008, res_1080p: 4.36,  dur_60s: 96.63, dur_180s: 93.38 },
    { rk: 9,  channel: "Olympics",                    total: 1170586754, video_cnt: 2009, res_1080p: 83.33, dur_60s: 49.18, dur_180s: 33.00 },
    { rk: 10, channel: "YANA CHIRKINA",               total: 1136490201, video_cnt: 1527, res_1080p: 100.00, dur_60s: 0.52, dur_180s: 0.00 },
  ],
  "Travel & Events / 旅行": [
    { rk: 1,  channel: "Zack D. Films",               total: 3346433454, video_cnt: 449,  res_1080p: 100.00, dur_60s: 2.23, dur_180s: 0.00 },
    { rk: 2,  channel: "코이티비 KOITV",              total: 1247257574, video_cnt: 2630, res_1080p: 99.92, dur_60s: 99.81, dur_180s: 99.51 },
    { rk: 3,  channel: "EBS Documentary",             total: 1173812397, video_cnt: 12634, res_1080p: 92.95, dur_60s: 97.46, dur_180s: 94.97 },
    { rk: 4,  channel: "Орел и Решка",                total: 1011284404, video_cnt: 1924, res_1080p: 99.48, dur_60s: 68.35, dur_180s: 49.17 },
    { rk: 5,  channel: "HOA BAN FOOD",                total: 994276733,  video_cnt: 640,  res_1080p: 97.97, dur_60s: 99.69, dur_180s: 94.69 },
    { rk: 6,  channel: "12Go",                        total: 948060439,  video_cnt: 356,  res_1080p: 100.00, dur_60s: 1.69, dur_180s: 0.00 },
    { rk: 7,  channel: "teera47",                     total: 943059779,  video_cnt: 1259, res_1080p: 98.33, dur_60s: 92.53, dur_180s: 37.97 },
    { rk: 8,  channel: "Dek Jew Small World",         total: 698291813,  video_cnt: 1704, res_1080p: 90.96, dur_60s: 99.94, dur_180s: 98.24 },
    { rk: 9,  channel: "Fishing Freaks",              total: 656956890,  video_cnt: 644,  res_1080p: 99.07, dur_60s: 99.84, dur_180s: 97.20 },
    { rk: 10, channel: "Tech Travel Eat",             total: 643934390,  video_cnt: 2054, res_1080p: 97.32, dur_60s: 99.66, dur_180s: 97.22 },
  ],
  "Nonprofits & Activism / 公益": [
    { rk: 1,  channel: "marazm",                      total: 1055737975, video_cnt: 562,  res_1080p: 94.31, dur_60s: 100.00, dur_180s: 100.00 },
    { rk: 2,  channel: "Bispo Bruno Leonardo",        total: 601115928,  video_cnt: 666,  res_1080p: 81.98, dur_60s: 70.72, dur_180s: 62.61 },
    { rk: 3,  channel: "Саентология сегодня",         total: 585462768,  video_cnt: 348,  res_1080p: 63.22, dur_60s: 80.75, dur_180s: 49.43 },
    { rk: 4,  channel: "Posnavatel TV",               total: 574599619,  video_cnt: 613,  res_1080p: 98.53, dur_60s: 100.00, dur_180s: 95.76 },
    { rk: 5,  channel: "AIADMK Official",             total: 562260966,  video_cnt: 352,  res_1080p: 10.23, dur_60s: 57.39, dur_180s: 2.27 },
  ],
  "Food / 美食": [
    { rk: 1,  channel: "饭点兄弟",                    total: 428726727,  video_cnt: 1461, res_1080p: 0.00,  dur_60s: 68.93, dur_180s: 0.00 },
    { rk: 2,  channel: "账号已注销",                  total: 168253742,  video_cnt: 22530, res_1080p: 68.62, dur_60s: 78.81, dur_180s: 58.22 },
    { rk: 3,  channel: "太空仓鼠小乐队",              total: 116193097,  video_cnt: 1030, res_1080p: 0.00,  dur_60s: 10.97, dur_180s: 2.23 },
    { rk: 4,  channel: "杨小美",                      total: 61400816,   video_cnt: 89,   res_1080p: 85.39, dur_60s: 96.63, dur_180s: 0.00 },
    { rk: 5,  channel: "美食栏目",                    total: 57196178,   video_cnt: 131,  res_1080p: 4.58,  dur_60s: 0.76,  dur_180s: 0.00 },
  ],
  "Family / 家庭": [
    { rk: 1,  channel: "B站好物优选",                 total: 135684921, video_cnt: 502, res_1080p: 0.20, dur_60s: 6.37, dur_180s: 1.00 },
    { rk: 2,  channel: "视听你我他",                  total: 112984453, video_cnt: 1056, res_1080p: 0.28, dur_60s: 7.95, dur_180s: 4.07 },
    { rk: 3,  channel: "爱表演的三宝宝",              total: 82389325,  video_cnt: 2018, res_1080p: 9.91, dur_60s: 45.59, dur_180s: 1.88 },
    { rk: 4,  channel: "小麦的幸福生活",              total: 82269465,  video_cnt: 106,  res_1080p: 0.94, dur_60s: 30.19, dur_180s: 0.00 },
    { rk: 5,  channel: "YouTube精彩视频",             total: 63557409,  video_cnt: 153,  res_1080p: 1.31, dur_60s: 20.92, dur_180s: 0.65 },
  ],
  "Other / 其他": [
    { rk: 1,  channel: "Like Nastya TR",              total: 1042182756, video_cnt: 313, res_1080p: 75.40, dur_60s: 100.00, dur_180s: 99.36 },
    { rk: 2,  channel: "Vlad and Niki PRT",           total: 789184168,  video_cnt: 195, res_1080p: 70.77, dur_60s: 100.00, dur_180s: 98.46 },
    { rk: 3,  channel: "قناة بون بون",                total: 540455708,  video_cnt: 109, res_1080p: 82.57, dur_60s: 100.00, dur_180s: 38.53 },
    { rk: 4,  channel: "ExtraPolinesios",             total: 491163919,  video_cnt: 97,  res_1080p: 64.95, dur_60s: 94.85, dur_180s: 83.51 },
    { rk: 5,  channel: "Tiger Wong Entertainment",    total: 369879350,  video_cnt: 357, res_1080p: 79.27, dur_60s: 99.44, dur_180s: 98.88 },
  ],
};

// ===== B) Top10 by like_per_100play (engagement) =====
// 仅选取部分类目下 engagement 高的 channel
const TOP_BY_ENGAGEMENT = [
  // Comedy
  { category: "Comedy",    channel: "LUIZ DO SOM",       total_like: 84282967, video_cnt: 3531, like_per_100play: 10.41, res_1080p: 91.16 },
  { category: "Comedy",    channel: "BarryTube",         total_like: 59976332, video_cnt: 120,  like_per_100play: 8.40,  res_1080p: 96.67 },
  { category: "Comedy",    channel: "Barhom m3arawi",    total_like: 57576834, video_cnt: 428,  like_per_100play: 8.36,  res_1080p: 85.28 },
  { category: "Comedy",    channel: "Lucas Rangel",      total_like: 44284364, video_cnt: 310,  like_per_100play: 7.34,  res_1080p: 98.06 },
  { category: "Comedy",    channel: "Dosogas",           total_like: 69554838, video_cnt: 418,  like_per_100play: 7.07,  res_1080p: 99.04 },
  // Autos
  { category: "Autos",     channel: "Diego Faustino #68",total_like: 27507610, video_cnt: 3684, like_per_100play: 14.19, res_1080p: 99.59 },
  { category: "Autos",     channel: "STAR GAMERS",       total_like: 29046063, video_cnt: 637,  like_per_100play: 11.95, res_1080p: 2.83 },
  { category: "Autos",     channel: "Leandro Torneiro",  total_like: 12164534, video_cnt: 1109, like_per_100play: 8.53,  res_1080p: 42.65 },
  { category: "Autos",     channel: "ALN1001",           total_like: 13035435, video_cnt: 1027, like_per_100play: 8.08,  res_1080p: 16.46 },
  { category: "Autos",     channel: "Bulkin Drive",      total_like: 13720121, video_cnt: 243,  like_per_100play: 7.26,  res_1080p: 37.45 },
  // Music
  { category: "Music",     channel: "Maicon Küster",     total_like: 98328598, video_cnt: 704,  like_per_100play: 12.65, res_1080p: 99.43 },
  { category: "Music",     channel: "Frei Gilson",       total_like: 44072075, video_cnt: 1404, like_per_100play: 13.76, res_1080p: 98.65 },
  { category: "Music",     channel: "BLACKPINK",         total_like: 24212146, video_cnt: 71,   like_per_100play: 9.14,  res_1080p: 98.59 },
  { category: "Music",     channel: "HYBE LABELS",       total_like: 53442045, video_cnt: 352,  like_per_100play: 9.60,  res_1080p: 96.88 },
  { category: "Music",     channel: "BANGTANTV",         total_like: 88142572, video_cnt: 269,  like_per_100play: 8.48,  res_1080p: 97.03 },
  // News & Politics
  { category: "News",      channel: "서정욱TV",          total_like: 63744908, video_cnt: 6199, like_per_100play: 16.99, res_1080p: 99.39 },
  { category: "News",      channel: "Plantão Brasil",    total_like: 114930964, video_cnt: 6846, like_per_100play: 16.26, res_1080p: 64.26 },
  { category: "News",      channel: "이봉규TV",          total_like: 76537724, video_cnt: 11267, like_per_100play: 13.84, res_1080p: 99.54 },
  { category: "News",      channel: "RazaGraphyUnscripted", total_like: 79096043, video_cnt: 2066, like_per_100play: 13.29, res_1080p: 98.84 },
  { category: "News",      channel: "Tiago Brunet",      total_like: 22282290, video_cnt: 1119, like_per_100play: 13.31, res_1080p: 99.55 },
  // Education
  { category: "Education", channel: "Padre Paulo Ricardo", total_like: 34623173, video_cnt: 3986, like_per_100play: 19.80, res_1080p: 99.90 },
  { category: "Education", channel: "Очаков ТВ",        total_like: 19067588, video_cnt: 2817, like_per_100play: 14.65, res_1080p: 99.79 },
  { category: "Education", channel: "Tiago Brunet (Edu)", total_like: 22282290, video_cnt: 1119, like_per_100play: 13.31, res_1080p: 99.55 },
  { category: "Education", channel: "Aktien mit Kopf",   total_like: 44963670, video_cnt: 4919, like_per_100play: 8.55,  res_1080p: 99.43 },
  // People & Blogs
  { category: "People&Blogs", channel: "Padre Alex Nogueira", total_like: 72683024, video_cnt: 2429, like_per_100play: 18.04, res_1080p: 45.90 },
  { category: "People&Blogs", channel: "Christian Figueiredo", total_like: 80165525, video_cnt: 906, like_per_100play: 13.40, res_1080p: 98.12 },
  { category: "People&Blogs", channel: "STERNENKO",      total_like: 134870302, video_cnt: 2114, like_per_100play: 11.88, res_1080p: 98.01 },
  { category: "People&Blogs", channel: "LubaTV",         total_like: 117697813, video_cnt: 564, like_per_100play: 11.90, res_1080p: 91.49 },
];

// ===== C) Top10 by comment_per_1k_play (讨论性) =====
const TOP_BY_COMMENT_RATE = [
  // News (评论密度天然高)
  { category: "News",     channel: "Black Conservative Perspective", total_comment: 9582625,  video_cnt: 3832, comment_per_1k_play: 19.03, comment_share_pct: 18.82 },
  { category: "News",     channel: "Secular Talk",     total_comment: 11581059, video_cnt: 14836, comment_per_1k_play: 11.77, comment_share_pct: 19.36 },
  { category: "News",     channel: "Os Pingos nos Is", total_comment: 9789614,  video_cnt: 10697, comment_per_1k_play: 6.83, comment_share_pct: 8.23 },
  { category: "News",     channel: "Imran Riaz Khan",  total_comment: 0,        video_cnt: 1863, comment_per_1k_play: 7.62, comment_share_pct: 0 },
  // Nonprofits (祷告内容容易刷评论)
  { category: "Nonprofits", channel: "Pastor Wilson Passos", total_comment: 1565189, video_cnt: 2838, comment_per_1k_play: 231.49, comment_share_pct: 54.98 },
  { category: "Nonprofits", channel: "Pastor Bruno Souza",   total_comment: 1657132, video_cnt: 399,  comment_per_1k_play: 219.89, comment_share_pct: 45.22 },
  { category: "Nonprofits", channel: "Bispo Bruno Leonardo", total_comment: 91439943, video_cnt: 666, comment_per_1k_play: 152.12, comment_share_pct: 45.46 },
  { category: "Nonprofits", channel: "Hội Thánh Đức Chúa Trời", total_comment: 804666, video_cnt: 554, comment_per_1k_play: 48.88, comment_share_pct: 33.08 },
  // People & Blogs (祷告/争议性)
  { category: "People&Blogs", channel: "Pastor Diego Frances", total_comment: 14417115, video_cnt: 1283, comment_per_1k_play: 215.49, comment_share_pct: 45.87 },
  { category: "People&Blogs", channel: "Pr Fernando Branco",   total_comment: 12451639, video_cnt: 3868, comment_per_1k_play: 215.38, comment_share_pct: 50.10 },
  { category: "People&Blogs", channel: "Isac Souza Oficial",   total_comment: 6802822,  video_cnt: 1893, comment_per_1k_play: 146.77, comment_share_pct: 33.06 },
  { category: "People&Blogs", channel: "Vinicius Iracet",      total_comment: 7400194,  video_cnt: 947,  comment_per_1k_play: 50.96, comment_share_pct: 22.97 },
  // Family (家庭主题, 高争议)
  { category: "Family",  channel: "辉哥是男神",     total_comment: 56289, video_cnt: 44,  comment_per_1k_play: 39.62, comment_share_pct: 47.46 },
  { category: "Family",  channel: "超人小潘",       total_comment: 60191, video_cnt: 62,  comment_per_1k_play: 29.09, comment_share_pct: 5.42 },
  { category: "Family",  channel: "彤爸来了",       total_comment: 184209, video_cnt: 241, comment_per_1k_play: 24.21, comment_share_pct: 46.66 },
  // Education (讨论性)
  { category: "Education", channel: "Ivan Saraiva",   total_comment: 1450565, video_cnt: 889,  comment_per_1k_play: 117.86, comment_share_pct: 31.70 },
  { category: "Education", channel: "ALRA TV",        total_comment: 2360854, video_cnt: 2489, comment_per_1k_play: 16.38,  comment_share_pct: 27.50 },
];

// ===== D) Top10 by follower (头部账号) =====
const TOP_BY_FOLLOWER = [
  // Comedy (大头部)
  { category: "Comedy",      channel: "Alejo Igoa",        follower: 115000000, video_cnt: 15, total_play: 41681707,  avg_play_per_follower: 0.0242, engagement_rate: 4.14 },
  { category: "Comedy",      channel: "WWE",               follower: 112000000, video_cnt: 1,  total_play: 937170,    avg_play_per_follower: 0.0084, engagement_rate: 1.43 },
  { category: "Comedy",      channel: "PewDiePie",         follower: 110000000, video_cnt: 10, total_play: 83280164,  avg_play_per_follower: 0.0757, engagement_rate: 4.34 },
  { category: "Comedy",      channel: "Zee TV",            follower: 97400000,  video_cnt: 88, total_play: 141027171, avg_play_per_follower: 0.0234, engagement_rate: 0.53 },
  { category: "Comedy",      channel: "Topper Guild",      follower: 84700000,  video_cnt: 1,  total_play: 165856,    avg_play_per_follower: 0.0020, engagement_rate: 2.56 },
  { category: "Comedy",      channel: "YOLO AVENTURAS",    follower: 67500000,  video_cnt: 47, total_play: 18217805,  avg_play_per_follower: 0.0057, engagement_rate: 4.37 },
  { category: "Comedy",      channel: "ToRung",            follower: 59600000,  video_cnt: 25, total_play: 193171871, avg_play_per_follower: 0.1296, engagement_rate: 0.45 },
  { category: "Comedy",      channel: "Mikecrack (Cmd)",   follower: 58200000,  video_cnt: 4,  total_play: 4466412,   avg_play_per_follower: 0.0192, engagement_rate: 2.95 },
  { category: "Comedy",      channel: "Juan De Dios Pantoja", follower: 55500000, video_cnt: 2, total_play: 14526847, avg_play_per_follower: 0.1309, engagement_rate: 5.56 },
  // Entertainment
  { category: "Entertainment", channel: "MrBeast",          follower: 481000000, video_cnt: 43, total_play: 1916272416, avg_play_per_follower: 0.0926, engagement_rate: 2.28 },
  { category: "Entertainment", channel: "T-Series",         follower: 311000000, video_cnt: 65, total_play: 68788582,   avg_play_per_follower: 0.0037, engagement_rate: 0.47 },
  { category: "Entertainment", channel: "Cocomelon",        follower: 200000000, video_cnt: 3,  total_play: 5770828,    avg_play_per_follower: 0.0144, engagement_rate: null },
  { category: "Entertainment", channel: "SET India",        follower: 189000000, video_cnt: 8390, total_play: 9500115500, avg_play_per_follower: 0.0067, engagement_rate: 0.84 },
  { category: "Entertainment", channel: "Vlad and Niki",    follower: 149000000, video_cnt: 2,  total_play: 4983259,    avg_play_per_follower: 0.0334, engagement_rate: null },
  { category: "Entertainment", channel: "Kids Diana Show",  follower: 138000000, video_cnt: 8,  total_play: 2797744,    avg_play_per_follower: 0.0029, engagement_rate: null },
  // Gaming
  { category: "Gaming",      channel: "MrBeast (Gaming)",  follower: 469000000, video_cnt: 4, total_play: 1147774, avg_play_per_follower: 0.0006, engagement_rate: 4.06 },
  { category: "Gaming",      channel: "Mikecrack (Gaming)", follower: 58300000, video_cnt: 998, total_play: 4736609524, avg_play_per_follower: 0.0842, engagement_rate: 2.51 },
  { category: "Gaming",      channel: "IShowSpeed",        follower: 53600000, video_cnt: 269, total_play: 1130183245, avg_play_per_follower: 0.0820, engagement_rate: 2.89 },
  { category: "Gaming",      channel: "Jess No Limit",     follower: 54500000, video_cnt: 707, total_play: 929978761, avg_play_per_follower: 0.0241, engagement_rate: 5.21 },
  { category: "Gaming",      channel: "AboFlah (Gaming)",  follower: 49000000, video_cnt: 60,  total_play: 317545672, avg_play_per_follower: 0.108,  engagement_rate: 10.04 },
  // Travel & Events
  { category: "Travel",      channel: "Aaj Tak (Trvl)",    follower: 75100000, video_cnt: 64, total_play: 21434558, avg_play_per_follower: 0.0045, engagement_rate: 0.54 },
  { category: "Travel",      channel: "Zack D. Films",     follower: 26700000, video_cnt: 449, total_play: 3346433454, avg_play_per_follower: 0.2817, engagement_rate: 4.89 },
  // Pets
  { category: "Pets",        channel: "That Little Puff",  follower: 38100000, video_cnt: 60, total_play: 311724527, avg_play_per_follower: 0.1364, engagement_rate: 0.65 },
  { category: "Pets",        channel: "Markiplier (Pets)", follower: 38400000, video_cnt: 11, total_play: 43282324, avg_play_per_follower: 0.1025, engagement_rate: 5.45 },
];

// ===== E) 不同类目 channel 的平均 engagement (用于 boxplot/heatmap) =====
const CATEGORY_ENGAGEMENT_AVG = [
  { category: "Travel & Events / 旅行", avg_engagement: 3.78, avg_like_per_100: 4.21, avg_comment_per_1k: 3.84, hint: "户外/Vlog 互动率较高" },
  { category: "Education / 教育",       avg_engagement: 5.21, avg_like_per_100: 5.97, avg_comment_per_1k: 5.05, hint: "教育内容引发讨论" },
  { category: "News & Politics / 新闻", avg_engagement: 6.10, avg_like_per_100: 7.04, avg_comment_per_1k: 5.94, hint: "政治讨论高热度" },
  { category: "Comedy / 喜剧",          avg_engagement: 4.85, avg_like_per_100: 5.62, avg_comment_per_1k: 3.97, hint: "Comedy 是 like 驱动" },
  { category: "People & Blogs / 人物",  avg_engagement: 5.83, avg_like_per_100: 6.41, avg_comment_per_1k: 4.62, hint: "强 KOL 效应" },
  { category: "Howto & Style / 生活",   avg_engagement: 4.05, avg_like_per_100: 4.85, avg_comment_per_1k: 3.58, hint: "教程类有粘性" },
  { category: "Music / 音乐",           avg_engagement: 3.81, avg_like_per_100: 4.63, avg_comment_per_1k: 2.18, hint: "Music 主要靠 like" },
  { category: "Sports / 体育",          avg_engagement: 3.06, avg_like_per_100: 3.42, avg_comment_per_1k: 1.86, hint: "赛事直播刷量大" },
  { category: "Autos & Vehicles / 汽车",avg_engagement: 3.95, avg_like_per_100: 4.52, avg_comment_per_1k: 2.91, hint: "评测/测速吸引互动" },
  { category: "Gaming / 游戏",          avg_engagement: 3.43, avg_like_per_100: 3.95, avg_comment_per_1k: 2.42, hint: "游戏直播弹幕多" },
  { category: "Pets & Animals / 宠物",  avg_engagement: 3.21, avg_like_per_100: 3.74, avg_comment_per_1k: 1.84, hint: "情绪型 like 居多" },
  { category: "Film & Animation / 影视",avg_engagement: 1.65, avg_like_per_100: 2.06, avg_comment_per_1k: 0.96, hint: "搬运为主, 互动弱" },
  { category: "Entertainment / 娱乐",   avg_engagement: 2.42, avg_like_per_100: 2.78, avg_comment_per_1k: 1.55, hint: "TV 频道刷量明显" },
  { category: "Family / 家庭",          avg_engagement: 5.86, avg_like_per_100: 7.04, avg_comment_per_1k: 4.31, hint: "亲子类强讨论性" },
  { category: "Food / 美食",            avg_engagement: 5.21, avg_like_per_100: 5.86, avg_comment_per_1k: 4.84, hint: "美食评价积极" },
  { category: "Science & Technology / 科技", avg_engagement: 5.97, avg_like_per_100: 6.84, avg_comment_per_1k: 4.27, hint: "测评类高互动" },
  { category: "Nonprofits & Activism / 公益", avg_engagement: 12.42, avg_like_per_100: 10.5, avg_comment_per_1k: 45.21, hint: "宗教/争议 noisy" },
  { category: "Other / 其他",           avg_engagement: 4.78, avg_like_per_100: 5.36, avg_comment_per_1k: 5.91, hint: "未分类, 噪声较多" },
];

// ===== F) 横屏 vs 竖屏的视频 channel 偏好 (CSV 视频样本概览) =====
const ORIENTATION_BY_PLATFORM = [
  { platform: "YouTube (横屏占主导)",   horizontal: 76.4, vertical: 22.1, square: 1.5 },
  { platform: "Bilibili (竖屏崛起)",    horizontal: 38.6, vertical: 59.7, square: 1.7 },
  { platform: "全量平均",                horizontal: 75.04, vertical: 67.77, square: 1.74 },
];

// ===== G) channel 视频数 vs 平均播放散点数据 =====
// (用于发现"高频 low-quality" vs "精品 channel")
const CHANNEL_SCATTER = [
  // (video_cnt, total_play, channel_name, category)
  { vcnt: 207,   tplay: 7528167823, name: "KHANDESHI MOVIES",   cat: "Comedy", elite: true },
  { vcnt: 154,   tplay: 5253245522, name: "Jkk Entertainment",  cat: "Comedy", elite: true },
  { vcnt: 1906,  tplay: 6377396835, name: "Melon City Show",    cat: "Comedy", elite: true },
  { vcnt: 1828,  tplay: 7584706249, name: "Goldmines",          cat: "Film",   elite: true },
  { vcnt: 33708, tplay: 16552695315, name: "Vijay Television",  cat: "Entertainment", elite: false },
  { vcnt: 49791, tplay: 12160682250, name: "Sun TV",            cat: "Entertainment", elite: false },
  { vcnt: 107438, tplay: 7568832427, name: "Zadruga",           cat: "Entertainment", elite: false },
  { vcnt: 349871, tplay: 9372230367, name: "ABP MAJHA",         cat: "News",   elite: false },
  { vcnt: 144654, tplay: 9583519064, name: "Thairath News",     cat: "News",   elite: false },
  { vcnt: 14092, tplay: 1147520265, name: "StudyIQ IAS",        cat: "Education", elite: false },
  { vcnt: 13100, tplay: 624864361, name: "Dump Truck",          cat: "Autos",  elite: false },
  { vcnt: 261,   tplay: 874416854, name: "ИЛЬДАР АВТО-ПОДБОР",  cat: "Autos",  elite: true },
  { vcnt: 343,   tplay: 829945911, name: "Жекич Дубровский",    cat: "Autos",  elite: true },
  { vcnt: 47,    tplay: 18217805, name: "YOLO AVENTURAS",       cat: "Comedy", elite: true },
  { vcnt: 78,    tplay: 780157357, name: "Alejo Igoa",          cat: "Entertainment", elite: true },
  { vcnt: 998,   tplay: 4736609524, name: "Mikecrack",          cat: "Gaming", elite: true },
  { vcnt: 1366,  tplay: 5680047953, name: "ItsFunneh",          cat: "Gaming", elite: true },
  { vcnt: 8480,  tplay: 4659002567, name: "WWE",                cat: "Sports", elite: false },
  { vcnt: 449,   tplay: 3346433454, name: "Zack D. Films",      cat: "Travel", elite: true },
  { vcnt: 12634, tplay: 1173812397, name: "EBS Documentary",    cat: "Travel", elite: false },
  { vcnt: 1599,  tplay: 1704114160, name: "Mochimaru",          cat: "Pets",   elite: true },
  { vcnt: 859,   tplay: 2546772978, name: "Murliwale Hausla",   cat: "Pets",   elite: true },
  { vcnt: 476,   tplay: 2368324448, name: "Crazy XYZ",          cat: "Sci",    elite: true },
  { vcnt: 296,   tplay: 1115164771, name: "GopherVid",          cat: "Sci",    elite: true },
];
