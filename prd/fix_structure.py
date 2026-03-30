#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRD结构修复脚本
将"验收标准"section从当前位置移到"详细方案"之后
"""

import re

def fix_prd_structure():
    file_path = r"d:\Project\vibe coding\webmodel\prd\prd_v1.0.html"

    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 定义正确的section顺序
    section_order = [
        "info",       # 项目基本信息
        "boundary",   # 0. 产品边界
        "background", # 一、需求背景
        "goals",      # 二、需求目标
        "users",      # 三、用户与场景
        "features",   # 四、需求功能清单
        "details",    # 五、详细方案
        "acceptance", # 六、验收标准
        "exception",  # 七、异常与边界
        "flowcharts"  # 八、业务流程图
    ]

    # 提取所有section的内容
    sections = {}
    pattern = r'<section id="([^"]+)"[^>]*>(.*?)</section>'
    matches = re.findall(pattern, content, re.DOTALL)

    for section_id, section_content in matches:
        sections[section_id] = f'<section id="{section_id}">{section_content}</section>'

    # 找到content div的位置
    content_start = content.find('<div class="content">')
    content_end = content.rfind('</div>')

    if content_start == -1 or content_end == -1:
        print("错误：找不到content div")
        return

    # 重新构建content部分
    header = content[:content_start + 21]  # 包含<div class="content">
    footer = content[content_end:]

    # 按正确顺序组合section
    new_content = header + "\n\n"
    for section_id in section_order:
        if section_id in sections:
            new_content += "        " + sections[section_id] + "\n\n"

    new_content += "    " + footer

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("PRD结构已修复完成！")
    print("Section顺序已调整为正确的逻辑顺序")
    print("\n正确的顺序：")
    for i, section_id in enumerate(section_order, 1):
        print(f"  {i}. {section_id}")

if __name__ == "__main__":
    fix_prd_structure()
