#!/usr/bin/env python3
"""
解析 4 个 Top20 txt 文件 -> 输出 assets/data-top20.js (全量 19 类 × 20 channel × 4 维度)
"""
import json
import os
import re
import sys

SRC = "/Users/ehjiang/Desktop/漫游数据源盘点/7、各obj_category下的各维度（播放、点赞、评论、订阅）top20的uploader统计分布"
OUT = "/Users/ehjiang/Desktop/channel-sourcing-analysis/assets/data-top20.js"

FILES = {
    "play":       "a)play_num Top20 uploader.txt",
    "like":       "b)like_num Top20 uploader.txt",
    "comment":    "c)comment_num Top20 uploader.txt",
    "follower":   "d)follower Top20 uploader.txt",
}

# 列名 (从原 txt 文件首行解析得到)
COLUMNS = {
    "play": [
        "unified_category", "author", "total_play", "avg_play", "median_play",
        "video_cnt", "res_720p", "res_1080p", "res_4k",
        "dur_30s", "dur_60s", "dur_180s", "dur_600s", "rk",
    ],
    "like": [
        "unified_category", "author", "total_like", "avg_like", "median_like",
        "video_cnt", "like_per_100play", "res_720p", "res_1080p", "res_4k",
        "dur_30s", "dur_60s", "dur_180s", "dur_600s", "rk",
    ],
    "comment": [
        "unified_category", "author", "total_comment", "avg_comment", "median_comment",
        "video_cnt", "comment_per_1k_play", "comment_share_pct",
        "res_720p", "res_1080p", "res_4k",
        "dur_30s", "dur_60s", "dur_180s", "dur_600s", "rk",
    ],
    "follower": [
        "unified_category", "author", "follower", "video_cnt",
        "total_play", "avg_play", "median_play",
        "avg_play_per_follower", "engagement_rate_pct",
        "res_720p", "res_1080p", "res_4k",
        "dur_30s", "dur_60s", "dur_180s", "dur_600s", "rk",
    ],
}


def parse_value(s, key):
    """转换字符串为合适类型"""
    s = s.strip()
    if s in ("", "NULL", "null"):
        return None
    if key in ("unified_category", "author"):
        return s
    # try int first then float
    try:
        if "." in s or "e" in s.lower() or "E" in s:
            return float(s)
        return int(s)
    except ValueError:
        # 可能是 E7 等科学计数法
        try:
            return float(s)
        except ValueError:
            return s


def parse_file(path, columns):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    rows = []
    header = lines[0].strip().split("\t")
    # 校验列数大致一致
    for ln in lines[1:]:
        if not ln.strip():
            continue
        parts = ln.rstrip("\n").split("\t")
        if len(parts) < len(columns):
            # 兼容偶发的缺列
            parts = parts + [None] * (len(columns) - len(parts))
        elif len(parts) > len(columns):
            parts = parts[:len(columns)]
        row = {k: parse_value(parts[i] if parts[i] is not None else "", k) for i, k in enumerate(columns)}
        rows.append(row)
    return rows


def group_by_category(rows):
    """{category: [rows sorted by rk]}"""
    grouped = {}
    for r in rows:
        cat = r.get("unified_category") or "Unknown"
        grouped.setdefault(cat, []).append(r)
    for cat in grouped:
        grouped[cat].sort(key=lambda x: x.get("rk") or 9999)
    return grouped


# ============ 解析 4 个文件 ============
data = {}
for dim, fname in FILES.items():
    path = os.path.join(SRC, fname)
    rows = parse_file(path, COLUMNS[dim])
    data[dim] = group_by_category(rows)
    total_chs = sum(len(v) for v in data[dim].values())
    print(f"[{dim}] {fname}: {len(data[dim])} 类 / {total_chs} 行")

# 全量类目集合
all_cats = sorted(set().union(*[set(d.keys()) for d in data.values()]))
print(f"\n全量类目 ({len(all_cats)}):")
for c in all_cats:
    print(f"  - {c}")

# ============ 写出 JS 数据文件 ============
def js_repr(obj):
    """简单转换 None->null, True/False->true/false, str 加引号"""
    if obj is None:
        return "null"
    if obj is True:
        return "true"
    if obj is False:
        return "false"
    if isinstance(obj, str):
        s = obj.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{s}"'
    if isinstance(obj, (int, float)):
        # 防止 inf
        return repr(obj)
    if isinstance(obj, dict):
        items = [f"{js_repr(k)}: {js_repr(v)}" for k, v in obj.items()]
        return "{" + ", ".join(items) + "}"
    if isinstance(obj, list):
        items = [js_repr(x) for x in obj]
        return "[" + ", ".join(items) + "]"
    return f'"{str(obj)}"'


def dump_js_block(varname, data_by_dim):
    """data_by_dim = {category: [row, row, ...]}"""
    lines = [f"const {varname} = {{"]
    for cat in sorted(data_by_dim.keys()):
        rows = data_by_dim[cat]
        # 类目名转义
        safe_cat = cat.replace('"', '\\"')
        lines.append(f'  "{safe_cat}": [')
        for r in rows:
            lines.append(f"    {js_repr(r)},")
        lines.append("  ],")
    lines.append("};")
    return "\n".join(lines)


# ============ 生成 综合质量分 总榜 (跨类目) ============
# v2 评分体系 (10 维, 总权重 100%):
#   - 去除: 粉丝触达率 (reach) · 类目偏好 (category) · 旧的粉丝规模 band
#   - 新增: 横屏比例 (horizontal) + 4 个绝对值维度 (play/like/comment/follower)
#
# 各维度 S=100, A=75, B=50, C=25 (统一映射)
WEIGHTS_V2 = {
    "res":          0.20,  # 分辨率档位 (1080p+)
    "horizontal":   0.10,  # 横屏比例 (NEW, 类目估算)
    "dur":          0.15,  # 时长 ≥60s 比例
    "engage":       0.15,  # 综合互动率
    "vcnt":         0.10,  # 视频量
    "like_rate":    0.10,  # 点赞强度 (like/100play)
    # 4 个绝对值维度, 合计 20%
    "play_abs":     0.07,  # 总播放绝对值
    "like_abs":     0.06,  # 总点赞绝对值
    "comment_abs":  0.04,  # 总评论绝对值
    "follower_abs": 0.03,  # 订阅数绝对值
}
assert abs(sum(WEIGHTS_V2.values()) - 1.0) < 1e-6, "权重之和必须等于 1.0"


# 横屏比例的类目估算 (因为 channel 级 horizontal_ratio 没有直接 SQL 输出)
# 基线来自 PDF 的全量分布 + 行业经验. 后续若有更精确 SQL 可替换为 channel-level 实际值.
CATEGORY_HORIZONTAL_RATIO = {
    "ASMR":                                 50,
    "Autos & Vehicles / 汽车":              90,
    "Comedy / 喜剧":                        75,
    "Education / 教育":                     90,
    "Entertainment / 娱乐":                 85,
    "Family / 家庭":                        65,
    "Film & Animation / 影视动画":          95,
    "Food / 美食":                          75,
    "Gaming / 游戏":                        95,
    "Howto & Style / 生活时尚":             70,
    "Music / 音乐":                         60,
    "News & Politics / 新闻与政治":         85,
    "Nonprofits & Activism / 公益":         85,
    "Other / 其他":                         70,
    "People & Blogs / 人物与博客":          50,
    "Pets & Animals / 宠物与动物":          75,
    "Science & Technology / 科技":          90,
    "Shorts / 短视频":                      5,
    "Sports / 体育":                        90,
    "Travel & Events / 旅行":               80,
    "Null / 未分类":                        50,
}


def score_band(value, thresholds):
    """thresholds = [(s_thr, 100), (a_thr, 75), (b_thr, 50)] 否则 25"""
    if value is None:
        return 25  # 缺失数据按 C 级
    for thr, score in thresholds:
        if value >= thr:
            return score
    return 25


def compute_quality_score(merged):
    """
    v2 评分: 10 维加权
    merged: 一个 channel 的合并数据, 含
       res_1080p, dur_60s, engagement_rate_pct, video_cnt,
       follower, like_per_100play,
       total_play, total_like, total_comment,
       unified_category (用来推算 horizontal_ratio)
    """
    parts = {}
    parts["res"]       = score_band(merged.get("res_1080p"),    [(80, 100), (60, 75), (40, 50)])
    parts["dur"]       = score_band(merged.get("dur_60s"),       [(70, 100), (50, 75), (30, 50)])
    parts["engage"]    = score_band(merged.get("engagement_rate_pct"),     [(3, 100), (2, 75), (1, 50)])
    parts["vcnt"]      = score_band(merged.get("video_cnt"),     [(200, 100), (50, 75), (20, 50)])
    parts["like_rate"] = score_band(merged.get("like_per_100play"), [(5, 100), (3, 75), (1, 50)])

    # 横屏比例 (类目估算)
    cat = merged.get("unified_category", "")
    h_ratio = CATEGORY_HORIZONTAL_RATIO.get(cat, 50)
    merged["horizontal_ratio_est"] = h_ratio
    parts["horizontal"] = score_band(h_ratio, [(70, 100), (50, 75), (30, 50)])

    # 4 个绝对值维度
    parts["play_abs"]     = score_band(merged.get("total_play"),    [(1_000_000_000, 100), (100_000_000, 75), (10_000_000, 50)])
    parts["like_abs"]     = score_band(merged.get("total_like"),    [(50_000_000, 100), (5_000_000, 75), (500_000, 50)])
    parts["comment_abs"]  = score_band(merged.get("total_comment"), [(1_000_000, 100), (100_000, 75), (10_000, 50)])
    parts["follower_abs"] = score_band(merged.get("follower"),      [(50_000_000, 100), (10_000_000, 75), (1_000_000, 50)])

    total = sum(parts[k] * WEIGHTS_V2[k] for k in WEIGHTS_V2)
    return round(total, 2), parts


def merge_channel_rows(channel, category):
    """把 4 个维度的同 channel 数据合并"""
    m = {"unified_category": category, "author": channel}
    # 取各维度第一次出现的字段值
    for dim in ("play", "like", "comment", "follower"):
        if category not in data[dim]:
            continue
        for r in data[dim][category]:
            if r.get("author") == channel:
                for k, v in r.items():
                    if k not in m or m.get(k) is None:
                        m[k] = v
                break
    return m


# 收集所有 (category, channel) 组合, 计算总分
quality_scores = []
seen = set()
for dim in ("play", "like", "comment", "follower"):
    for cat, rows in data[dim].items():
        for r in rows:
            key = (cat, r.get("author"))
            if key in seen:
                continue
            seen.add(key)
            merged = merge_channel_rows(r.get("author"), cat)
            score, parts = compute_quality_score(merged)
            quality_scores.append({
                "category": cat,
                "channel": r.get("author"),
                "score": score,
                "parts": parts,
                "res_1080p": merged.get("res_1080p"),
                "horizontal_ratio_est": merged.get("horizontal_ratio_est"),
                "dur_60s": merged.get("dur_60s"),
                "video_cnt": merged.get("video_cnt"),
                "follower": merged.get("follower"),
                "engagement_rate_pct": merged.get("engagement_rate_pct"),
                "like_per_100play": merged.get("like_per_100play"),
                "avg_play_per_follower": merged.get("avg_play_per_follower"),
                "total_play": merged.get("total_play"),
                "total_like": merged.get("total_like"),
                "total_comment": merged.get("total_comment"),
            })

quality_scores.sort(key=lambda x: -x["score"])
print(f"\n候选 channel 总数: {len(quality_scores)}")
print(f"Top 20 by quality score:")
for i, q in enumerate(quality_scores[:20], 1):
    print(f"  #{i} {q['score']:.1f}  {q['category'][:30]:30s}  {q['channel']}")

# 按类目分组的质量分 Top 20
quality_by_cat = {}
for q in quality_scores:
    cat = q["category"]
    quality_by_cat.setdefault(cat, []).append(q)
for cat in quality_by_cat:
    quality_by_cat[cat].sort(key=lambda x: -x["score"])
    quality_by_cat[cat] = quality_by_cat[cat][:20]

print(f"\n各类目候选 channel 数:")
for cat in sorted(quality_by_cat.keys()):
    print(f"  {cat:35s} {len(quality_by_cat[cat]):3d} 个 (top1 = {quality_by_cat[cat][0]['score']:.1f})")

# ============ 计算 elite vs bulk 散点数据 ============
# 规则:
#  elite = score >= 65 AND video_cnt < 5000 AND res_1080p >= 80 (or null) AND dur_60s >= 60 (or null)
#  bulk  = video_cnt > 5000 OR (dur_60s != null AND dur_60s < 30) OR score < 50
def classify(q):
    if (q["video_cnt"] or 0) > 5000:
        return "bulk"
    if q["score"] < 50:
        return "bulk"
    if (q["dur_60s"] is not None and q["dur_60s"] < 30):
        return "bulk"
    if q["score"] >= 65:
        return "elite"
    return "normal"


scatter_rows = []
for q in quality_scores:
    if q["video_cnt"] in (None, 0):
        continue
    if q["total_play"] in (None, 0):
        continue
    typ = classify(q)
    if typ == "normal":
        continue
    scatter_rows.append({
        "vcnt": q["video_cnt"],
        "tplay": q["total_play"],
        "name": q["channel"],
        "cat": q["category"].split(" / ")[0] if " / " in q["category"] else q["category"],
        "score": q["score"],
        "elite": typ == "elite",
    })

# 仅保留 90 个 elite 和 60 个 bulk 用于散点
scatter_rows.sort(key=lambda x: (-x["elite"], -x["score"]))
elite_rows = [r for r in scatter_rows if r["elite"]][:90]
bulk_rows  = [r for r in scatter_rows if not r["elite"]][:60]
scatter_final = elite_rows + bulk_rows

# ============ 写文件 ============
out = []
out.append("/**")
out.append(" * 漫游数据源盘点 - Top20 全量数据 (按 4 维度 × 19 类目 × 各 ≤ 20 channel)")
out.append(" * Auto-generated by scripts/parse_top20.py, do NOT edit by hand.")
out.append(" * Source: 漫游数据源盘点/7、.../a-d txt files")
out.append(" *")
out.append(" * 公共字段:")
out.append(" *   unified_category, author, video_cnt, res_720p, res_1080p, res_4k,")
out.append(" *   dur_30s, dur_60s, dur_180s, dur_600s, rk")
out.append(" * 各维度独有字段:")
out.append(" *   - play:     total_play, avg_play, median_play")
out.append(" *   - like:     total_like, avg_like, median_like, like_per_100play")
out.append(" *   - comment:  total_comment, avg_comment, median_comment, comment_per_1k_play, comment_share_pct")
out.append(" *   - follower: follower, total_play, avg_play, median_play, avg_play_per_follower, engagement_rate_pct")
out.append(" */")
out.append("")

# TOP_BY_PLAY
out.append("// ===== A) Top20 by play_num =====")
out.append(dump_js_block("TOP_BY_PLAY", data["play"]))
out.append("")

# TOP_BY_LIKE
out.append("// ===== B) Top20 by like_num =====")
out.append(dump_js_block("TOP_BY_LIKE", data["like"]))
out.append("")

# TOP_BY_COMMENT
out.append("// ===== C) Top20 by comment_num =====")
out.append(dump_js_block("TOP_BY_COMMENT", data["comment"]))
out.append("")

# TOP_BY_FOLLOWER
out.append("// ===== D) Top20 by follower =====")
out.append(dump_js_block("TOP_BY_FOLLOWER", data["follower"]))
out.append("")

# QUALITY TOP (cross-category)
out.append("// ===== E) 综合质量分排行 (跨类目 Top 50) =====")
out.append("// 公式: score = Σ(dim_score_i × weight_i), 各维度分: S=100/A=75/B=50/C=25")
out.append("// 详见 README/REPORT.md 评分体系章节")
out.append("const QUALITY_TOP = [")
for q in quality_scores[:50]:
    line = {
        "rk": quality_scores.index(q) + 1,
        "category": q["category"],
        "channel": q["channel"],
        "score": q["score"],
        "res_1080p": q["res_1080p"],
        "dur_60s": q["dur_60s"],
        "video_cnt": q["video_cnt"],
        "follower": q["follower"],
        "engagement": q["engagement_rate_pct"],
        "like_per_100play": q["like_per_100play"],
        "apf": q["avg_play_per_follower"],
        "total_play": q["total_play"],
        "total_like": q.get("total_like"),
        "total_comment": q.get("total_comment"),
        "horizontal_ratio_est": q.get("horizontal_ratio_est"),
        "parts": q["parts"],
    }
    out.append(f"  {js_repr(line)},")
out.append("];")
out.append("")

# QUALITY TOP_BY_CAT (per-category Top 20, ensures no category is omitted)
out.append("// ===== E.2) 各类目质量分 Top 20 (确保所有 19 类目都有展示) =====")
out.append("// 与 QUALITY_TOP 同一公式, 但按 unified_category 分组后各取 Top 20")
out.append("const QUALITY_TOP_BY_CAT = {")
for cat in sorted(quality_by_cat.keys()):
    safe_cat = cat.replace('"', '\\"')
    out.append(f'  "{safe_cat}": [')
    for i, q in enumerate(quality_by_cat[cat], 1):
        line = {
            "rk": i,
            "channel": q["channel"],
            "score": q["score"],
            "res_1080p": q["res_1080p"],
            "dur_60s": q["dur_60s"],
            "video_cnt": q["video_cnt"],
            "follower": q["follower"],
            "engagement": q["engagement_rate_pct"],
            "like_per_100play": q["like_per_100play"],
            "apf": q["avg_play_per_follower"],
            "total_play": q["total_play"],
            "total_like": q.get("total_like"),
            "total_comment": q.get("total_comment"),
            "horizontal_ratio_est": q.get("horizontal_ratio_est"),
            "parts": q["parts"],
        }
        out.append(f"    {js_repr(line)},")
    out.append("  ],")
out.append("};")
out.append("")

# CHANNEL_SCATTER
out.append("// ===== F) Channel 规模 vs 总播放 散点 (精品 vs 大水号) =====")
out.append("// 分类公式:")
out.append("//   bulk(大水号) = video_cnt > 5000  OR  score < 50  OR  (dur_60s != null AND dur_60s < 30)")
out.append("//   elite(精品)  = score >= 65  AND  video_cnt <= 5000  AND  NOT bulk")
out.append("const CHANNEL_SCATTER = [")
for r in scatter_final:
    out.append(f"  {js_repr(r)},")
out.append("];")
out.append("")

# CATEGORY_ENGAGEMENT_AVG: 直接基于 d) 维度求每个类目 avg engagement
cat_engagement = {}
for cat, rows in data["follower"].items():
    vals = [r.get("engagement_rate_pct") for r in rows if r.get("engagement_rate_pct") is not None]
    if vals:
        cat_engagement[cat] = sum(vals) / len(vals)

# 同步推断 like/comment 平均
cat_like = {}
for cat, rows in data["like"].items():
    vals = [r.get("like_per_100play") for r in rows if r.get("like_per_100play") is not None]
    if vals:
        cat_like[cat] = sum(vals) / len(vals)

cat_comment = {}
for cat, rows in data["comment"].items():
    vals = [r.get("comment_per_1k_play") for r in rows if r.get("comment_per_1k_play") is not None]
    if vals:
        cat_comment[cat] = sum(vals) / len(vals)

out.append("// ===== G) 各类目互动指标均值 (基于 Top20 样本估算) =====")
out.append("const CATEGORY_ENGAGEMENT_AVG = [")
for cat in sorted(set(list(cat_engagement.keys()) + list(cat_like.keys()) + list(cat_comment.keys()))):
    line = {
        "category": cat,
        "avg_engagement": round(cat_engagement.get(cat, 0) or 0, 2),
        "avg_like_per_100": round(cat_like.get(cat, 0) or 0, 2),
        "avg_comment_per_1k": round(cat_comment.get(cat, 0) or 0, 2),
    }
    out.append(f"  {js_repr(line)},")
out.append("];")
out.append("")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(out))

print(f"\n✓ 写入: {OUT}")
print(f"  文件大小: {os.path.getsize(OUT) / 1024:.1f} KB")
