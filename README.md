# YouTube Content Automation Platform

A modern, AI-powered platform for automating YouTube content creation workflows built entirely on Bolt. This application provides end-to-end automation for faceless YouTube channels, including content ideation, script generation, voice synthesis, video assembly, and analytics tracking.

## 🚀 Features

- **AI-Powered Content Generation**: Automated content ideas and script generation using OpenAI GPT-4
- **Voice Synthesis**: Text-to-speech conversion with ElevenLabs integration
- **Video Assembly**: Automated video creation with professional templates and effects
- **Analytics Dashboard**: Comprehensive performance tracking and insights
- **Automation Engine**: Configurable workflows for hands-free content creation
- **Secure Authentication**: User management with Supabase Auth
- **Real-time Updates**: Live progress tracking and notifications

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase Edge Functions (JavaScript/TypeScript)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: OpenAI GPT-4, ElevenLabs TTS
- **State Management**: TanStack Query, React Hooks
- **Testing**: Vitest, React Testing Library
- **Deployment**: Bolt Hosting

## 📋 Prerequisites

- Supabase account and project
- OpenAI API key
- ElevenLabs API key (for voice synthesis)

## 🔧 Setup Instructions

### 1. Database Setup

First, you need to set up the Supabase database by running the migration:

1. Click the "Connect to Supabase" button in the top right
2. Set up your Supabase project connection
3. The database tables will be created automatically

### 2. Environment Configuration

Set up your API keys in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions → Settings
3. Add these environment variables:

```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### 3. Deploy Edge Functions

The Edge Functions are automatically deployed when you connect to Supabase. The following functions will be available:

- `generate-content-ideas` - AI content idea generation
- `generate-script` - AI script generation  
- `text-to-speech` - Voice synthesis
- `generate-thumbnail` - Thumbnail generation
- `optimize-seo` - SEO optimization
- `video-assembly` - Video processing and assembly

## 🎯 How It Works

### 1. Content Planning
- Generate AI-powered content ideas based on your niche
- Analyze competition and estimated views
- Schedule content for production

### 2. Script Generation
- Create detailed scripts from content ideas
- Multiple styles: Educational, Storytelling, Documentary
- Real-time metrics: word count, reading time, readability

### 3. Voice Synthesis
- Convert scripts to natural-sounding voice narration
- Multiple voice options with speed control
- High-quality audio generation

### 4. Video Assembly
- Professional video templates with advanced effects
- Batch processing for multiple videos
- Smart audio-visual synchronization
- Multiple quality outputs (720p, 1080p, 4K)

### 5. Analytics & Automation
- Track video performance and revenue
- Automated workflows for hands-free content creation
- Real-time progress monitoring

## 🔒 Security Features

- Row Level Security (RLS) enabled on all database tables
- Input validation and sanitization
- Rate limiting for AI API calls
- Secure authentication with Supabase Auth
- Environment variable protection for API keys

## 📊 Professional Video Features

### OpenCut-Inspired Engine
- **Timeline-based editing**: Multi-track composition
- **Professional transitions**: Fade, crossfade, wipe, slide, zoom
- **Smart automation**: Auto-sync voice timing with visuals
- **Batch processing**: Create multiple videos simultaneously
- **Professional quality**: Multiple resolution and frame rate options

### Templates
- **Minimal Clean**: Simple and professional
- **Scientific**: Technical and educational
- **Storytelling**: Cinematic narrative flow
- **Educational**: Learning-focused design

## 🚀 Getting Started

1. **Connect to Supabase**: Click the button in the top right to set up your database
2. **Configure API Keys**: Add your OpenAI and ElevenLabs keys in Supabase settings
3. **Generate Content Ideas**: Start with the Content Planning tab
4. **Create Scripts**: Use the Script Generator to create detailed scripts
5. **Generate Voices**: Convert scripts to audio in Voice Studio
6. **Assemble Videos**: Create professional videos in Video Assembly
7. **Monitor Performance**: Track success in Analytics

## 🔧 Troubleshooting

### Common Issues

1. **Database Tables Missing**: Make sure you've connected to Supabase and the migration has run
2. **API Key Errors**: Verify your OpenAI and ElevenLabs API keys are set in Supabase Edge Functions settings
3. **CORS Errors**: Edge Functions should handle CORS automatically - try refreshing if you see CORS issues

### Getting Help

- Check the browser console for detailed error messages
- Verify your Supabase project is properly connected
- Ensure all API keys are configured in Supabase settings

## 📈 Performance

The application is optimized for performance with:
- Code splitting and lazy loading
- Efficient state management
- Rate limiting for API calls
- Batch processing for video creation
- Professional video encoding

## 🎯 Next Steps

1. **Content Creation**: Start generating content ideas and scripts
2. **Voice Library**: Build a library of voice generations
3. **Video Production**: Create your first automated videos
4. **Analytics**: Monitor performance and optimize
5. **Automation**: Set up automated workflows for hands-free operation

---

**Ready to automate your YouTube channel?** Connect to Supabase and start creating professional content with AI!