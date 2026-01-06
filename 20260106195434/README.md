# YouTube 视频关键亮点工具

一个智能的 YouTube 视频亮点提取工具，能够提取视频字幕并自动生成覆盖整个视频的关键时间节点。

## ⚠️ 重要提示：必须使用 HTTP 服务器运行

**由于浏览器的安全限制，不能直接双击打开 `index.html` 文件！**

### 原因说明

Chrome 和其他现代浏览器默认禁止从 `file://` 协议访问外部资源（如 YouTube iframe）。这是浏览器的安全策略，无法通过纯前端代码绕过。

### ✅ 正确的运行方式

#### 方法 1：使用提供的批处理脚本（推荐）

1. **双击运行 `start-server.bat`**
2. 会自动启动本地 HTTP 服务器（端口 8000）
3. 在浏览器中打开：`http://localhost:8000`
4. 开始使用工具

#### 方法 2：使用 Python 启动服务器

如果已安装 Python，可以在项目目录运行：

```bash
# Windows
python -m http.server 8000

# Mac/Linux  
python3 -m http.server 8000
```

然后访问：`http://localhost:8000`

#### 方法 3：使用 VS Code Live Server 插件

1. 安装 VS Code 插件 "Live Server"
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"
4. 自动在浏览器中打开（通常端口 5500）

#### 方法 4：使用 Node.js http-server

```bash
# 安装
npm install -g http-server

# 运行
http-server -p 8000
```

#### 方法 5：使用 PHP 内置服务器

```bash
php -S localhost:8000
```

### 🚫 错误的运行方式

❌ 直接双击 `index.html` → 导致 `file:///C:/Users/.../index.html`  
❌ 使用 Chrome 的 `--allow-file-access-from-files` 参数 → 不安全且不稳定

## 功能特性

- 🎬 **视频字幕提取**: 使用 Supadata API 自动提取 YouTube 视频字幕
- 🤖 **AI 智能分析**: 支持 Gemini API 进行智能内容分析
- ⏱️ **智能亮点生成**: 根据视频长度自动生成合适数量的亮点，覆盖整个视频
  - 短视频（< 3分钟）：3 个亮点
  - 中等视频（3-10分钟）：5 个亮点
  - 长视频（10-30分钟）：8 个亮点
  - 超长视频（> 30分钟）：10 个亮点
- 🎯 **规则引擎**: 即使没有 Gemini API Key 也能生成亮点
- 🎨 **美观界面**: 现代化、响应式的设计

## 使用方法

### 1. 启动本地服务器

按照上面的方法启动 HTTP 服务器。

### 2. 打开浏览器

访问 `http://localhost:8000`（或对应的端口）

### 3. 输入 YouTube 链接

在输入框中粘贴 YouTube 视频链接，例如：
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 4. (可选) 输入 Gemini API Key

如果需要使用 AI 智能分析，可以输入您的 Gemini API Key。如果不提供，系统会使用规则引擎生成基础分析。

#### 如何获取 Gemini API Key：

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录 Google 账号
3. 点击 "Create API key" 创建 API Key
4. 复制 API Key 并粘贴到工具中

**支持的模型：**
- gemini-1.5-pro-latest (推荐，功能最强)
- gemini-1.5-pro
- gemini-1.5-flash (速度快)
- gemini-2.0-flash-exp (实验性)

**注意：**
- Gemini API 目前免费使用（可能有调用次数限制）
- 需要翻墙访问 Google 服务

### 5. 点击"开始分析"

系统将：
- 自动获取视频字幕
- 分析内容生成关键亮点（数量根据视频长度自动调整）
- 显示视频播放器
- 展示关键亮点（点击可跳转到对应时间）

## 技术实现

### API 使用

- **Supadata API**: 用于提取 YouTube 视频字幕
  - API 端点: `https://api.supadata.ai/v1/transcript`
  - 认证方式: Header `x-api-key`
  - 响应格式: JSON (包含时间戳的文本分段)

- **Gemini API**: 用于智能内容分析 (可选)
  - 支持多个模型: gemini-1.5-pro-latest, gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
  - 用于生成更有意义的亮点和引用

- **YouTube IFrame Player API**: 用于视频播放控制
  - 支持时间跳转
  - 支持播放/暂停控制
  - 提供错误处理

### 核心功能

1. **视频 ID 提取**: 从各种格式的 YouTube URL 中提取 video_id
2. **字幕获取**: 调用 Supadata API 获取带时间戳的转录文本
3. **内容分析**:
   - AI 模式: 使用 Gemini 分析语义内容
   - 规则模式: 基于文本长度和时间分布生成亮点
4. **结果展示**: 美观的可视化展示
5. **时间跳转**: 通过 YouTube Player API 实现时间跳转

## 文件结构

```
.
├── index.html          # 主页面，包含 UI 和布局
├── app.js              # 核心逻辑，包含 API 调用和分析功能
├── start-server.bat    # Windows 启动脚本（推荐使用）
├── README.md           # 项目说明文档（本文件）
```

## 配置说明

### Supadata API Key

已在 `app.js` 中预配置：
```javascript
const SUPADATA_API_KEY = 'sd_c1507bf28e4801999ae8868799c6b00d';
```

### Gemini API Key

在页面上的输入框中手动输入您的 Gemini API Key。

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari

## 常见问题

### Q: 为什么不能直接双击打开 index.html？

A: 浏览器的安全策略禁止 `file://` 协议访问 YouTube 等外部资源。必须使用 HTTP 服务器。

### Q: 使用 Python 启动服务器提示找不到命令？

A: 需要先安装 Python：
- Windows: 从 python.org 下载安装
- Mac: `brew install python3`
- Linux: `sudo apt-get install python3`

### Q: 视频无法播放？

A: 可能的原因：
1. 视频作者设置了"不允许嵌入"
2. 视频被删除或设为私有
3. 视频有地区限制
4. 没有使用 HTTP 服务器运行（检查浏览器地址栏是否是 `http://` 而不是 `file://`）

### Q: 字幕获取失败？

A: 检查：
1. 视频是否有字幕
2. 网络连接是否正常
3. Supadata API 是否正常工作

### Q: AI 分析失败 "models/gemini-pro is not found"？

A: 这是因为 `gemini-pro` 模型已被弃用。解决方案：

1. **系统会自动尝试多个模型**：
   - gemini-1.5-pro-latest (优先)
   - gemini-1.5-pro
   - gemini-1.5-flash
   - gemini-2.0-flash-exp

2. **如果仍然失败，可能的原因**：
   - API Key 无效或过期
   - 未正确配置 Google Cloud 项目
   - 网络无法访问 Google 服务（需要翻墙）

3. **可以不使用 AI 分析**：
   - 留空 Gemini API Key 输入框
   - 使用规则引擎生成基础分析（速度更快）

## 注意事项

1. 部分视频可能没有字幕或字幕质量较差
2. 字幕提取速度取决于视频长度和网络状况
3. 使用 Gemini API 可能产生费用，请注意使用量
4. 首次使用建议使用测试视频验证功能
5. **必须使用 HTTP 服务器运行，不能直接打开 HTML 文件**

## 示例视频

已预置测试视频链接：
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 开发说明

如需修改或扩展功能，主要关注：

- `app.js` 中的 API 调用逻辑
- `app.js` 中的分析算法
- `index.html` 中的 UI 样式和布局

## 许可证

MIT License
