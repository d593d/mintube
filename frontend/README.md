# YouTube Content Automation Platform

A modern, AI-powered platform for automating YouTube content creation workflows. This application provides end-to-end automation for faceless YouTube channels, including content ideation, script generation, voice synthesis, video assembly, and analytics tracking.

## 🚀 Features

- **AI-Powered Content Generation**: Automated content ideas and script generation using OpenAI GPT-4
- **Voice Synthesis**: Text-to-speech conversion with ElevenLabs integration
- **Video Assembly**: Automated video creation and thumbnail generation
- **Analytics Dashboard**: Comprehensive performance tracking and insights
- **Automation Engine**: Configurable workflows for hands-free content creation
- **Secure Authentication**: User management with Supabase Auth
- **Real-time Updates**: Live progress tracking and notifications

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI Services**: OpenAI GPT-4, ElevenLabs TTS
- **State Management**: TanStack Query, React Hooks
- **Testing**: Vitest, React Testing Library
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key
- ElevenLabs API key (for voice synthesis)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <project-name>
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration (for Edge Functions)
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Development
VITE_APP_ENV=development
```

### 3. Database Setup

Run the Supabase migrations to set up the database schema:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production

Set the following secrets in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase Edge Functions

Deploy the Edge Functions for AI integrations:

```bash
supabase functions deploy generate-content-ideas
supabase functions deploy generate-script
supabase functions deploy text-to-speech
supabase functions deploy generate-thumbnail
supabase functions deploy optimize-seo
```

Set the required environment variables in Supabase:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
supabase secrets set ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## 📚 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
├── integrations/       # External service integrations
└── test/               # Test utilities and setup

supabase/
├── migrations/         # Database migrations
└── functions/          # Edge Functions for AI services
```

## 🔒 Security Features

- Row Level Security (RLS) enabled on all database tables
- Input validation and sanitization
- Environment variable configuration for sensitive data
- Error boundaries for graceful error handling
- Comprehensive logging system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required environment variables are set
2. **Supabase Connection**: Verify your Supabase URL and keys are correct
3. **API Keys**: Check that your OpenAI and ElevenLabs API keys are valid
4. **Database**: Run migrations if you encounter database errors

### Getting Help

- Check the [GitHub Issues](link-to-issues) for known problems
- Review the [Supabase Documentation](https://supabase.com/docs)
- Check the [OpenAI API Documentation](https://platform.openai.com/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
