#!/usr/bin/env python3
import subprocess
import os

os.chdir("/Users/colinying/Desktop/Personal Blog Website")

print("=== Git Push Script ===")
print()

# 1. 查看状态
print("1. Checking git status...")
result = subprocess.run(["git", "status"], capture_output=True, text=True)
print(result.stdout)

# 2. 添加所有修改
print("2. Adding all changes...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True)
if result.returncode != 0:
    print(f"Error: {result.stderr}")
    exit(1)
print("✓ Changes added")

# 3. 提交
print()
print("3. Committing changes...")
commit_msg = "修复导航栏：统一结构，移除内联样式，修正 lang-switcher 和 theme-switcher 位置"
result = subprocess.run(["git", "commit", "-m", commit_msg], capture_output=True, text=True)
if result.returncode != 0:
    print(f"Error: {result.stderr}")
    exit(1)
print("✓ Changes committed")
print(result.stdout)

# 4. 推送
print()
print("4. Pushing to remote...")
result = subprocess.run(["git", "push"], capture_output=True, text=True)
if result.returncode != 0:
    print(f"Error: {result.stderr}")
    exit(1)
print("✓ Changes pushed successfully")
print(result.stdout)

print()
print("=== All done! ===")
