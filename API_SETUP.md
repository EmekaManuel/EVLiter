# API Keys Setup Guide for EV Lite

## Step 1: Create Environment File

Copy the example environment file:
```bash
cp .env.example .env.local
```

## Step 2: Get Your API Keys

### AI Service API Keys (Choose one or both)

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to `.env.local`:
   ```
   VITE_OPENAI_API_KEY=sk-your-openai-key-here
   ```

#### Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to `.env.local`:
   ```
   VITE_CLAUDE_API_KEY=sk-ant-your-claude-key-here
   ```

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to Credentials → Create Credentials → API Key
5. Copy the key and add it to `.env.local`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key-here
   ```

## Step 3: Configure Your .env.local File

Your `.env.local` file should look like this:

```env
# AI Service API Keys (choose one or both)
VITE_OPENAI_API_KEY=sk-your-openai-key-here
VITE_CLAUDE_API_KEY=sk-ant-your-claude-key-here

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key-here

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_AI_RECOGNITION=true
VITE_ENABLE_GOOGLE_MAPS=true
VITE_ENABLE_MOCK_DATA=true
```

## Step 4: Restart Your Development Server

After adding your API keys, restart your development server:

```bash
npm run dev
```

## Features Enabled by API Keys

- **OpenAI/Claude API**: Enables AI car recognition features
- **Google Maps API**: Enables charging station maps and location services
- **Mock Data**: Set to `true` to use mock data when APIs are not available

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure and don't share them
- Consider using environment-specific keys for production
- Monitor your API usage to avoid unexpected charges

## Troubleshooting

If you encounter issues:

1. Check that your API keys are correctly formatted
2. Ensure the APIs are enabled in your service provider's console
3. Verify that your `.env.local` file is in the project root
4. Restart your development server after making changes
5. Check the browser console for specific error messages
