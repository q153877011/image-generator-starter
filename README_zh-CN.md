# 🎨 AI Image Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

一个现代化的AI图像生成Web应用，支持多个AI平台，提供实时图像生成、下载和管理功能。

## 🚀 部署

部署到腾讯云 EdgeOne Pages。

[![EdgeOne Pages deploy](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?template=ai-image-generator-template)

## ✨ 功能特性

- 🎯 **多平台支持** - 集成Hugging Face、Nebius、Replicate等主流AI平台
- 🚀 **实时生成** - 支持实时图像生成，带进度显示
- 💾 **一键下载** - 支持图像下载，自动生成文件名
- 🎨 **多种模型** - 支持多种AI模型，包括SDXL、Flux、Pixel Art等
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠 技术栈

### 前端
- **Next.js 15.3.4** - React全栈框架
- **React 19.0.0** - 用户界面库
- **TypeScript 5.0** - 类型安全的JavaScript
- **Tailwind CSS 4.0** - 实用优先的CSS框架
- **TDesign React** - 企业级UI组件库

### 后端
- **EdgeOne Functions** - 边缘计算函数
- **多平台API集成** - Hugging Face、Nebius、Replicate

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- 有效的AI平台API令牌

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd generate-graph
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **配置环境变量**
   创建 `.env` 文件并添加以下配置（可以不完全添加）：
   ```env
   # Hugging Face API Token
   HF_TOKEN=your_huggingface_token_here
   
   # Nebius API Token  
   NEBIUS_TOKEN=your_nebius_token_here
   
   # Replicate API Token
   REPLICATE_TOKEN=your_replicate_token_here
   ```

      EdgeOne Pages 部署控制台环境变量配置同上述 `.env` 文件保持一致。

4. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

5. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🔧 环境配置

### API令牌获取

#### Hugging Face
1. 访问 [Hugging Face](https://huggingface.co/)
2. 注册并登录账户
3. 进入 [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. 创建新的访问令牌
5. 复制令牌到 `HF_TOKEN` 环境变量

#### Nebius
1. 访问 [Nebius Studio](https://studio.nebius.com/)
2. 注册并登录账户
3. 进入API设置页面
4. 生成API密钥
5. 复制密钥到 `NEBIUS_TOKEN` 环境变量

#### Replicate
1. 访问 [Replicate](https://replicate.com/)
2. 注册并登录账户
3. 进入 [Account Settings](https://replicate.com/account)
4. 创建API令牌
5. 复制令牌到 `REPLICATE_TOKEN` 环境变量

### 令牌状态检查

应用会自动检查各平台令牌的可用性，并在界面上显示状态：
- ✅ **可用** - 令牌已配置且有效
- ❌ **缺失** - 令牌未配置或无效

## 📖 使用指南

### 基本操作流程

1. **选择模型**
   - 在左侧面板中选择可用的AI模型
   - 不同模型支持不同的图像风格和生成效果

2. **输入提示词**
   - 在文本框中输入图像描述
   - 支持中英文描述
   - 系统会自动添加模型风格后缀

3. **生成图像**
   - 点击"Generate"按钮开始生成
   - 实时显示生成进度和时间
   - 生成完成后自动显示结果

4. **下载图像**
   - 鼠标悬停在图像上显示下载按钮
   - 点击下载按钮保存图像
   - 自动生成包含提示词的文件名

## 🔌 API文档

### 图像生成接口

**端点**: `POST /v1/generate`

**请求体**:
```json
{
  "image": "图像描述文本",
  "platform": "huggingface",
  "model": "模型标识符"
}
```

**响应**:
```json
{
  "success": true,
  "prompt": "原始提示词",
  "imageData": "base64编码的图像数据或URL",
  "message": "生成成功消息"
}
```

### 令牌状态接口

**端点**: `GET /v1/token-status`

**响应**:
```json
{
  "hfToken": true,
  "nebiusToken": true,
  "replicateToken": false
}
```

### 错误处理

所有API接口都包含统一的错误处理：
- `400` - 请求参数错误或内容违规
- `429` - 请求频率超限
- `500` - 服务器内部错误

## 📁 项目结构

```
generate-graph/
├── functions/                 # EdgeOne函数
│   ├── v1/
│   │   ├── generate/         # 图像生成API
│   │   │   ├── index.js      # 主处理逻辑
│   │   │   ├── fetch_utils.js # API调用工具
│   │   │   └── nfsw_limit.js # 内容过滤
│   │   └── token-status/     # 令牌状态API
│   └── helloworld/           # 示例函数
├── src/
│   ├── components/           # React组件
│   │   ├── ImageDisplay.tsx  # 图像显示组件
│   │   └── ModelDropdown.tsx # 模型选择组件
│   ├── pages/               # Next.js页面
│   │   ├── _app.tsx         # 应用入口
│   │   ├── _document.tsx    # 文档配置
│   │   └── index.tsx        # 主页面
│   └── styles/              # 样式文件
│       └── globals.css      # 全局样式
├── public/                  # 静态资源
├── package.json             # 项目配置
├── next.config.ts           # Next.js配置
├── tailwind.config.js       # Tailwind配置
└── README.md               # 项目文档
```