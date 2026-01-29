# Git 本地和远程仓库操作指南

## 简介

本指南介绍 Git 的基本操作，包括本地仓库和远程仓库（GitHub）的常用命令。

---

## 一、基础配置

### 设置用户名和邮箱
```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 查看配置
```bash
git config --list
```

---

## 二、本地仓库操作

### 初始化本地仓库
```bash
git init
```

### 查看仓库状态
```bash
git status
```

### 添加文件到暂存区
```bash
# 添加单个文件
git add 文件名

# 添加所有文件
git add .
```

### 提交文件
```bash
git commit -m "提交说明"
```

### 查看提交历史
```bash
git log
git log --oneline    # 简洁模式
```

### 查看差异
```bash
git diff             # 工作区 vs 暂存区
git diff --cached    # 暂存区 vs 最新提交
```

### 撤销操作
```bash
# 撤销工作区修改（危险）
git checkout -- 文件名

# 取消暂存
git reset HEAD 文件名

# 回退版本
git reset --hard 提交ID
git reset --hard HEAD~1    # 回退1个版本
```

---

## 三、分支操作

### 查看分支
```bash
git branch              # 本地分支
git branch -r           # 远程分支
git branch -a           # 所有分支
```

### 创建分支
```bash
git branch 分支名
```

### 切换分支
```bash
git checkout 分支名
git switch 分支名       # 新语法
```

### 创建并切换分支
```bash
git checkout -b 分支名
git switch -c 分支名    # 新语法
```

### 删除分支
```bash
git branch -d 分支名    # 删除本地分支
git push origin --delete 分支名  # 删除远程分支
```

### 合并分支
```bash
git merge 分支名        # 合并到当前分支
```

---

## 四、远程仓库操作

### 添加远程仓库
```bash
git remote add origin 远程仓库地址
```

### 查看远程仓库
```bash
git remote -v
```

### 修改远程仓库地址
```bash
git remote set-url origin 新地址
```

### 推送到远程
```bash
# 推送并设置上游分支
git push -u origin 分支名

# 日常推送
git push

# 强制推送（谨慎使用）
git push -f
```

### 从远程拉取
```bash
git pull origin 分支名
git pull                 # 拉取当前分支关联的远程分支
```

### 克隆远程仓库
```bash
git clone 仓库地址
```

---

## 五、远程分支同步

### 本地分支关联远程分支
```bash
git branch --set-upstream-to=origin/分支名
```

### 获取远程分支列表
```bash
git fetch -p
```

### 删除远程分支
```bash
git push origin --delete 分支名
```

---

## 六、标签操作

### 创建标签
```bash
git tag 标签名           # 轻量标签
git tag -a 标签名 -m "说明"   # 附注标签
```

### 推送标签
```bash
git push origin 标签名
git push origin --tags   # 推送所有标签
```

### 删除标签
```bash
git tag -d 标签名        # 删除本地标签
git push origin --delete tag/标签名   # 删除远程标签
```

---

## 七、暂存工作

### 暂存当前工作
```bash
git stash
git stash save "说明"
```

### 查看暂存列表
```bash
git stash list
```

### 恢复暂存
```bash
git stash pop           # 恢复并删除
git stash apply         # 恢复但保留
```

### 删除暂存
```bash
git stash drop          # 删除最新暂存
```

---

## 八、常见工作流程

### 日常开发流程
```bash
# 1. 切换到开发分支
git checkout dev

# 2. 拉取最新代码
git pull

# 3. 创建功能分支
git checkout -b feature/xxx

# 4. 开发并提交
git add .
git commit -m "feat: 添加新功能"

# 5. 推送功能分支
git push -u origin feature/xxx
```

### 合并到主分支
```bash
# 1. 切换到主分支
git checkout main

# 2. 拉取最新
git pull origin main

# 3. 合并功能分支
git merge feature/xxx

# 4. 推送到远程
git push origin main
```

---

## 九、常见问题

### Q: 合并冲突怎么办？
```bash
# 1. 查看冲突文件
git status

# 2. 手动解决冲突（编辑文件）
# 3. 添加解决后的文件
git add 文件名
# 4. 完成合并
git commit
```

### Q: 忘记提交直接推送了？
```bash
# 强制推送覆盖远程（谨慎！）
git push -f
```

### Q: 文件太大无法推送？
在项目根目录创建 `.gitignore` 文件：
```
node_modules/
dist/
*.log
*.pdf
uploads/*
!uploads/.gitkeep
```

### Q: 误删文件怎么恢复？
```bash
git checkout -- 文件名
```

---

## 十、GitHub 常用操作

### 创建 Pull Request
1. 在 GitHub 上进入仓库
2. 点击 "Pull requests" → "New pull request"
3. 选择源分支和目标分支
4. 填写说明并创建

### Fork 仓库后同步原仓库
```bash
# 1. 添加上游仓库
git remote add upstream 原仓库地址

# 2. 同步最新代码
git fetch upstream
git checkout main
git merge upstream/main

# 3. 推送到自己的仓库
git push origin main
```

---

## 快捷命令速查

| 操作 | 命令 |
|------|------|
| 查看状态 | `git status` |
| 添加所有 | `git add .` |
| 提交 | `git commit -m "说明"` |
| 推送 | `git push` |
| 拉取 | `git pull` |
| 查看分支 | `git branch` |
| 切换分支 | `git checkout 分支名` |
| 创建并切换 | `git checkout -b 分支名` |
| 查看日志 | `git log --oneline` |
| 暂存工作 | `git stash` |
| 恢复暂存 | `git stash pop` |

---

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 官方指南](https://guides.github.com/)
- [Git 简明指南](https://rogerdudler.github.io/git-guide/index.zh.html)
