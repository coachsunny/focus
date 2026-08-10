# 觉察归位｜注意力静心训练站

> **全网唯一心理需求代偿式觉察训练平台**  
> 不以自律对抗沉迷，只以觉察夺回注意力。不用意志力硬扛内耗，只用真实满足替换假性空虚。

---

## 📁 目录结构说明

```
D:\focus
├── index.html            # 页面 1：首页（全站入口、理念、铁律、四大入口）
├── handbook.html         # 页面 2：觉察手册（完整收录《短视频自我觉察练习手册》）
├── tools.html            # 页面 3：辅助工具中心（包含 6 大在线轻量觉察工具）
├── community.html        # 页面 4：学员心得分享区（挂载 Waline 极简留言系统）
├── training.html         # 页面 5：阶梯静心训练体系（四阶段渐进式训练课程）
├── css/
│   └── style.css         # 全站治愈系低饱和 Zen 风格设计系统样式表
├── js/
│   ├── main.js           # 导航、Toast 提示、全局基础 JS
│   ├── tools.js          # 6 大辅助工具交互逻辑
│   └── waline-config.js  # Waline 评论区极简静心模式配置
├── images/
│   └── banner.jpg        # 首页静心 Banner 插画
├── WALINE_GUIDE.md       # Waline 评论系统新手部署手把手教程
└── README.md             # 本项目说明文件
```

---

## 🚀 GitHub Pages 部署指南

因为本项目采用纯正原生 HTML5 + Vanilla CSS + JavaScript 编写，没有任何复杂的打包步骤，**可以直接上传推送至 GitHub Pages 部署**：

### 1. 初始化 Git 仓库并提交
在终端（或 VS Code 终端）运行以下命令：

```bash
cd D:\focus
git init
git add .
git commit -m "feat: 觉察归位注意力静心训练站完整源码"
```

### 2. 连接 GitHub 仓库并推送
在 GitHub 上创建一个新的公开仓库（例如 `focus`），然后运行：

```bash
git branch -M main
git remote add origin https://github.com/<你的GitHub用户名>/focus.git
git push -u origin main
```

### 3. 开启 GitHub Pages
1. 打开 GitHub 仓库页面，点击 **Settings (设置)** -> **Pages**.
2. 在 **Branch** 处选择 `main` 分支，目录选择 `/ (root)`.
3. 点击 **Save (保存)**.
4. 稍等 1~2 分钟，GitHub 会生成访问链接（如 `https://<你的用户名>.github.io/focus/`），网站即部署成功！

---

## 🔒 四大防悖论铁律在代码中的落实
1. **去算法**：无推荐瀑布流，无无限下滑，用户主动点击翻章。
2. **去攀比**：无打卡排名，无打卡连胜天数，无勋章，无数据追踪。
3. **去碎片**：沉浸式大行高大留白排版，收录深度长文。
4. **去焦虑**：所有复发正常，提供复发接纳日志与温柔觉察认知。
