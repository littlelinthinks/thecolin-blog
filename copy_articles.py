#!/usr/bin/env python3
import os
import shutil

# 源目录
source_dir = r"/Users/colinying/Desktop/公众号/小Lin思考公众号文章_完整版_20260116"

# 目标目录
target_dir = "/Users/colinying/Desktop/Personal Blog Website/articles"

# 创建目标目录
os.makedirs(target_dir, exist_ok=True)

# 遍历源目录
for root, dirs, files in os.walk(source_dir):
    for file in files:
        if file.endswith('.md'):
            # 源文件路径
            src_file = os.path.join(root, file)
            
            # 目标文件路径 (直接放在articles目录,简化结构)
            dst_file = os.path.join(target_dir, file)
            
            # 复制文件
            shutil.copy2(src_file, dst_file)
            print(f"Copied: {file}")

print(f"\n✅ Total {len([f for f in os.listdir(target_dir) if f.endswith('.md')])} Markdown articles copied!")
