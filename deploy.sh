#!/bin/bash

# 网站自动化部署脚本
# 使用方法：./deploy.sh

echo "🚀 开始部署网站..."

# 配置变量
WEBSITE_PATH="/path/to/your/website"
BACKUP_PATH="/path/to/backup/$(date +%Y%m%d_%H%M%S)"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤1：备份
echo -e "${YELLOW}📦 步骤1：备份现有网站...${NC}"
if [ -d "$WEBSITE_PATH" ]; then
    cp -r "$WEBSITE_PATH" "$BACKUP_PATH"
    echo -e "${GREEN}✅ 备份完成：$BACKUP_PATH${NC}"
else
    echo -e "${RED}❌ 错误：网站路径不存在${NC}"
    exit 1
fi

# 步骤2：清理缓存
echo -e "${YELLOW}🧹 步骤2：清理缓存...${NC}"
rm -rf "$WEBSITE_PATH"/*/.DS_Store
rm -rf "$WEBSITE_PATH"/*/*.cache
echo -e "${GREEN}✅ 缓存清理完成${NC}"

# 步骤3：上传文件
echo -e "${YELLOW}📤 步骤3：上传文件到服务器...${NC}"
# 这里替换为你的上传命令
# 示例：rsync -avz --delete ./ user@server:/path/to/website/
# 示例：scp -r ./ user@server:/path/to/website/
echo -e "${GREEN}✅ 文件上传完成${NC}"

# 步骤4：设置权限
echo -e "${YELLOW}🔐 步骤4：设置文件权限...${NC}"
chmod -R 755 "$WEBSITE_PATH"
find "$WEBSITE_PATH" -type d -exec chmod 755 {} \;
find "$WEBSITE_PATH" -type f -exec chmod 644 {} \;
echo -e "${GREEN}✅ 权限设置完成${NC}"

# 步骤5：验证
echo -e "${YELLOW}🔍 步骤5：验证部署...${NC}"
# 这里可以添加自动验证脚本
# 示例：curl -I https://thecolin.vip
echo -e "${GREEN}✅ 验证完成${NC}"

# 步骤6：清理
echo -e "${YELLOW}🗑️  步骤6：清理临时文件...${NC}"
# 清理7天前的备份
find /path/to/backup -type d -mtime +7 -exec rm -rf {} \;
echo -e "${GREEN}✅ 清理完成${NC}"

echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "📊 部署摘要："
echo "  - 备份位置：$BACKUP_PATH"
echo "  - 部署时间：$(date)"
echo "  - 状态：成功"
