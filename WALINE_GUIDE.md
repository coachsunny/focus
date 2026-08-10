# Waline 评论系统部署指南（Supabase 免费替代方案）

> 💡 **系统说明**：当前【学员心得分享区】已配置为 **双引擎架构**。默认自动启用 **【免部署·本地静心模式】**，无需配置任何后端即可在本地或 GitHub Pages 上发布心得与交流。  
> 若你需要跨设备/多用户云端实时同步留言，可按照下述 5 分钟教程部署 Waline Vercel 数据库。

---

## 🛠️ Step 1：在 Supabase 创建免费数据库（2 分钟）

1. 打开 [Supabase 官网](https://supabase.com)。
2. 点击 **“Start your project”**，直接选择 **“Continue with GitHub”**（用你的 GitHub 账号一键登录）。
3. 点击 **“New Project”**（新建项目）：
   - **Name（项目名）**：填 `waline`
   - **Database Password（数据库密码）**：自行设置一个密码（建议记下）
   - **Region（节点）**：选择离你近的节点（如 Singapore 或 Tokyo）
4. 点击 **“Create new project”**，等待 1~2 分钟项目初始化完毕。
5. 在左侧菜单点击 **Project Settings（项目设置） -> API**：
   - 复制 **Project URL**（例如 `https://xyzabc.supabase.co`）
   - 复制 **API Keys** 下方的 **`anon` `public`** 密钥（长字符串）

---

## 🚀 Step 2：一键部署 Waline 到 Vercel（2 分钟）

1. 登录 [Vercel 官网](https://vercel.com)（直接用 GitHub 账号登录）。
2. 打开 Waline 官方一键部署链接：
   👉 [点击一键部署 Waline 到 Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample)
3. 在部署页面的 **Environment Variables（环境变量）** 中添加以下两项：
   - `SUPABASE_URL` = 刚才复制的 **Project URL**
   - `SUPABASE_KEY` = 刚才复制的 **`anon` `public`** 密钥
4. 点击 **Deploy（部署）**，等待 1 分钟即可部署成功！
5. 部署完成后，Vercel 会分配给你一个二级域名（如 `https://my-waline.vercel.app`），这就是你的 **ServerURL**。

---

## 🔗 Step 3：在网站中绑定域名

1. 打开你网站中的 [学员心得页 (`community.html`)](file:///D:/focus/community.html)。
2. 在页面顶部的配置栏中，将你的域名 `https://my-waline.vercel.app` 粘贴到输入框中。
3. 点击 **“保存并应用”** 即可！

---

## ⚙️ 管理后台注册

部署完成后，访问你的后端地址并在末尾加上 `/ui/register`（例如 `https://my-waline.vercel.app/ui/register`）：
- **注册的第一个账号将自动成为最高管理员**。
- 以后访问 `https://my-waline.vercel.app/ui` 即可登录管理后台审核或删除留言。
