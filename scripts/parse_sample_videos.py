#!/usr/bin/env python3
"""
解析 Top20_sample_video_url.txt → assets/sample-videos.js

支持两种格式:
  v1 (tab 分隔, 无 resolution): unified_category, author, obj_title, sample_video_url, sample_channel_url, rk
  v2 (逗号分隔, 有 resolution):  unified_category, author, obj_title, sample_video_url, sample_channel_url, resolution, rk

v2 的 obj_title 可能未做 CSV 转义 (含逗号会列错位),
所以采用"右对齐"鲁棒解析: rk 一定是数字, resolution 一定是 WxH,
url 字段一定以 http 开头, 中间余下的字段全部 join 回 obj_title.

输出: SAMPLE_VIDEOS = { "category|author": [{rk, title, video_url, channel_url, resolution}, ...] }
"""
import csv
import json
import os
import re
from collections import defaultdict

SRC = "/Users/ehjiang/Desktop/漫游数据源盘点/Top20_sample_video_url.txt"
OUT = "/Users/ehjiang/Desktop/channel-sourcing-analysis/assets/sample-videos.js"

RES_RE = re.compile(r'^\d{2,5}x\d{2,5}$')


def js_repr(v):
    """JSON-safe repr for JS (handles None, str, number, list, dict)."""
    return json.dumps(v, ensure_ascii=False)


def detect_format(path):
    """Sniff delimiter ('\\t' or ',') and whether resolution column exists."""
    with open(path, "rb") as fb:
        raw = fb.read(4096)
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    head = raw.decode("utf-8", errors="ignore").split("\n", 1)[0]
    if "\t" in head and "," not in head:
        delim = "\t"
    else:
        delim = ","
    has_res = "resolution" in head.lower()
    return delim, has_res


def normalize_row(parts, has_res):
    """
    把 csv.reader 切出的 parts 列表归一化到 7 列 (或 6 列 v1):
      cat, author, title, video_url, channel_url, [resolution], rk
    使用右对齐 + 字段类型识别修复 obj_title 含逗号引起的错位.
    """
    if has_res:
        expected = 7
        if len(parts) == expected:
            cat, author, title, video_url, channel_url, resolution, rk = parts
        elif len(parts) > expected:
            # rk 必为数字, resolution 必为 WxH, channel_url/video_url 必为 URL or NULL
            rk = parts[-1]
            resolution = parts[-2]
            channel_url = parts[-3]
            video_url = parts[-4]
            # 验证右侧 4 列符合预期类型, 不符则放弃这行
            if not rk.strip().isdigit():
                return None
            if resolution != "NULL" and not RES_RE.match(resolution):
                return None
            cat = parts[0]
            author = parts[1]
            # 中间剩余的全部拼回 title (逗号还原)
            title = ",".join(parts[2:-4])
        else:
            return None
    else:
        expected = 6
        if len(parts) == expected:
            cat, author, title, video_url, channel_url, rk = parts
            resolution = None
        elif len(parts) > expected:
            rk = parts[-1]
            channel_url = parts[-2]
            video_url = parts[-3]
            if not rk.strip().isdigit():
                return None
            cat = parts[0]
            author = parts[1]
            title = ",".join(parts[2:-3])
            resolution = None
        else:
            return None
    return {
        "cat": cat.strip(),
        "author": author.strip(),
        "title": title.strip(),
        "video_url": video_url.strip(),
        "channel_url": channel_url.strip() if channel_url else "",
        "resolution": resolution.strip() if resolution else "",
        "rk": rk.strip(),
    }


def main():
    delim, has_res = detect_format(SRC)
    print(f"格式: delim={'TAB' if delim=='\t' else 'COMMA'}, resolution 列={'有' if has_res else '无'}")

    grouped = defaultdict(list)
    total = 0
    skipped = 0
    fixed = 0
    with open(SRC, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=delim)
        header = next(reader, None)
        for parts in reader:
            if not parts or not parts[0].strip():
                continue
            expected_len = 7 if has_res else 6
            if len(parts) != expected_len:
                fixed += 1
            row = normalize_row(parts, has_res)
            if row is None:
                skipped += 1
                continue
            try:
                rk = int(row["rk"])
            except ValueError:
                skipped += 1
                continue
            cat = row["cat"]
            author = row["author"]
            if not cat or not author:
                continue
            key = f"{cat}|{author}"
            grouped[key].append({
                "rk": rk,
                "title": row["title"],
                "video_url": row["video_url"],
                "channel_url": (row["channel_url"]
                                if row["channel_url"] and row["channel_url"].upper() != "NULL"
                                else None),
                "resolution": (row["resolution"]
                               if row["resolution"] and row["resolution"].upper() != "NULL"
                               else None),
            })
            total += 1

    # 每组内按 rk 排序
    for key in grouped:
        grouped[key].sort(key=lambda r: r["rk"])

    # 统计信息
    cats = set(k.split("|", 1)[0] for k in grouped.keys())
    print(f"\n读取 {total} 行采样数据")
    print(f"列错位修复行数: {fixed}")
    print(f"跳过无效行数: {skipped}")
    print(f"覆盖 {len(grouped)} 个 (类目, channel) 对")
    print(f"覆盖 {len(cats)} 个类目")

    # 输出 JS 文件
    lines = [
        "/**",
        " * 漫游数据源盘点 - 每个 channel 的随机采样视频示例 (v2: 含 resolution)",
        " * Auto-generated by scripts/parse_sample_videos.py",
        " * Source: 漫游数据源盘点/Top20_sample_video_url.txt",
        " *",
        " * 结构: SAMPLE_VIDEOS[\"<unified_category>|<author>\"] = [",
        " *   { rk, title, video_url, channel_url, resolution }, ...",
        " * ]",
        " *",
        f" * 共 {total} 行采样视频, 覆盖 {len(grouped)} 个 channel, {len(cats)} 个类目",
        " * (所有视频均为横屏 width > height; resolution 字段为 'WxH' 格式)",
        " */",
        "",
        "const SAMPLE_VIDEOS = {",
    ]
    for key in sorted(grouped.keys()):
        safe_key = key.replace("\\", "\\\\").replace('"', '\\"')
        rows = grouped[key]
        lines.append(f'  "{safe_key}": [')
        for r in rows:
            lines.append(f"    {js_repr(r)},")
        lines.append("  ],")
    lines.append("};")
    lines.append("")
    # 辅助函数
    lines.append("// 查询函数: 给定 category + author, 返回采样视频数组 (没有则空数组)")
    lines.append("function getSampleVideos(category, author) {")
    lines.append("  if (!category || !author) return [];")
    lines.append("  return SAMPLE_VIDEOS[category + '|' + author] || [];")
    lines.append("}")
    lines.append("")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\n✓ 写入: {OUT}")
    print(f"  文件大小: {os.path.getsize(OUT) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
