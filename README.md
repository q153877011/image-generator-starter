# 🎨 AI Image Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/github/choosealicense.com/blob/gh-pages/_licenses/mit.txt)

A modern AI image generation web application that supports multiple AI platforms, providing real-time image generation, download, and management features.

## Deploy

Deploy with EdgeOne Pages.

[![EdgeOne Pages deploy](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?template=ai-image-generator-template)

## ✨ Features

- 🎯 **Multi-Platform Support** - Integrated with mainstream AI platforms like Hugging Face, Nebius, Replicate
- 🚀 **Real-time Generation** - Support for real-time image generation with progress indicators
- 💾 **One-Click Download** - Support for image download with automatic filename generation
- 🎨 **Multiple Models** - Support for various AI models including SDXL, Flux, Pixel Art, and more
- 📱 **Responsive Design** - Perfect adaptation for desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **Next.js 15.3.4** - React full-stack framework
- **React 19.0.0** - User interface library
- **TypeScript 5.0** - Type-safe JavaScript
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **TDesign React** - Enterprise-class UI component library

### Backend
- **EdgeOne Functions** - Edge computing functions
- **Multi-Platform API Integration** - Hugging Face, Nebius, Replicate

## 🚀 Quick Start

### Requirements

- Node.js 18.0 or higher
- npm or yarn package manager
- Valid AI platform API tokens

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd generate-graph
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   Create a `.env` file and add the following configuration (not all required):
   ```env
   # Hugging Face API Token
   HF_TOKEN=your_huggingface_token_here
   
   # Nebius API Token  
   NEBIUS_TOKEN=your_nebius_token_here
   
   # Replicate API Token
   REPLICATE_TOKEN=your_replicate_token_here

   # OPENAI API Key
   OPENAI_API_KEY=your_openai_api_key_here   

   # FAL API Key
   FAL_KEY=your_fal_key_here
   ```

    The EdgeOne Pages deployment console environment variable configuration is consistent with the above `.env` file.

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the Application**
   Open your browser and visit [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

### API Token Setup

#### Hugging Face
1. Visit [Hugging Face](https://huggingface.co/)
2. Register and login to your account
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new access token
5. Copy the token to the `HF_TOKEN` environment variable

#### Nebius
1. Visit [Nebius Studio](https://studio.nebius.com/)
2. Register and login to your account
3. Go to API settings page
4. Generate an API key
5. Copy the key to the `NEBIUS_TOKEN` environment variable

#### Replicate
1. Visit [Replicate](https://replicate.com/)
2. Register and login to your account
3. Go to [Account Settings](https://replicate.com/account)
4. Create an API token
5. Copy the token to the `REPLICATE_TOKEN` environment variable

#### OpenAI
1. Visit [OpenAI](https://platform.openai.com/)
2. Register and login to your account
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the key to the `OPENAI_API_KEY` environment variable

#### FAL
1. Visit [FAL](https://fal.ai/)
2. Register and login to your account
3. Go to [API Keys](https://fal.ai/dashboard/keys)
4. Create an API key
5. Copy the key to the `FAL_KEY` environment variable

### Token Status Check

The application automatically checks the availability of tokens for each platform and displays the status in the interface:
- ✅ **Available** - Token is configured and valid
- ❌ **Missing** - Token is not configured or invalid

## 📖 User Guide

### Basic Operation Flow

1. **Select Model**
   - Choose from available AI models in the left panel
   - Different models support different image styles and generation effects

2. **Enter Prompt**
   - Input image description in the text box
   - Supports both Chinese and English descriptions
   - The system automatically adds model style suffixes

3. **Generate Image**
   - Click the "Generate" button to start generation
   - Real-time display of generation progress and time
   - Automatically displays results when generation is complete

4. **Download Image**
   - Hover over the image to show download button
   - Click download button to save the image
   - Automatically generates filename containing the prompt

## 🔌 API Documentation

### Image Generation Endpoint

**Endpoint**: `POST /v1/generate`

**Request Body**:
```json
{
  "image": "Image description text",
  "platform": "huggingface",
  "model": "Model identifier"
}
```

**Response**:
```json
{
  "success": true,
  "prompt": "Original prompt",
  "imageData": "Base64 encoded image data or URL",
  "message": "Generation success message"
}
```

### Token Status Endpoint

**Endpoint**: `GET /v1/token-status`

**Response**:
```json
{
  "hfToken": true,
  "nebiusToken": true,
  "replicateToken": false
}
```

### Error Handling

All API endpoints include unified error handling:
- `400` - Request parameter errors or content violations
- `429` - Request rate limit exceeded
- `500` - Internal server error

## 📁 Project Structure

```
generate-graph/
├── functions/                 # EdgeOne Functions
│   ├── v1/
│   │   ├── generate/         # Image generation API
│   │   │   ├── index.js      # Main processing logic
│   │   │   ├── fetch_utils.js # API call utilities
│   │   │   └── nfsw_limit.js # Content filtering
│   │   └── token-status/     # Token status API
│   └── helloworld/           # Example function
├── src/
│   ├── components/           # React components
│   │   ├── ImageDisplay.tsx  # Image display component
│   │   └── ModelDropdown.tsx # Model selection component
│   ├── pages/               # Next.js pages
│   │   ├── _app.tsx         # Application entry
│   │   ├── _document.tsx    # Document configuration
│   │   └── index.tsx        # Main page
│   └── styles/              # Style files
│       └── globals.css      # Global styles
├── public/                  # Static assets
├── package.json             # Project configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── README.md               # Project documentation
```