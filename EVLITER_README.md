# EVLiter - EV Charging Station Locator

A comprehensive EV charging station locator app with AI-powered car recognition and smart charging recommendations.

## Features

### 🚗 AI Car Recognition

- **VIN Recognition**: Automatically identify EV specifications using Vehicle Identification Number
- **Model Recognition**: Input make, model, and year for instant car identification
- **AI-Powered Analysis**: Uses Claude or OpenAI API to determine charging specifications
- **Compatible Connectors**: Automatically identifies supported charging connector types

### 📍 Charging Station Locator

- **Real-time Map**: Interactive Google Maps integration showing nearby stations
- **Live Availability**: Real-time connector availability and pricing
- **Advanced Filters**: Filter by connector type, power level, distance, and amenities
- **Station Details**: Comprehensive information including ratings, amenities, and operating hours

### 🧠 Smart Charging Advisor

- **AI Recommendations**: Intelligent suggestions based on cost, time, and distance
- **Preference Settings**: Customize priorities for cost savings vs. charging speed
- **Battery Management**: Track current battery level and target charging goals
- **Factor Analysis**: Detailed breakdown of recommendation factors

### ⚡ My Charging Dashboard

- **Session History**: Complete charging session tracking and analytics
- **Usage Statistics**: Energy consumption, costs, and charging patterns
- **Active Sessions**: Real-time monitoring of ongoing charging sessions
- **Favorites**: Save frequently used stations for quick access

### 🛠️ Admin Dashboard

- **Analytics Overview**: Comprehensive usage statistics and revenue tracking
- **Station Management**: Add, edit, and monitor charging stations
- **User Insights**: User growth and engagement metrics
- **System Health**: Monitor station uptime and performance

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives
- **Maps**: Google Maps JavaScript API
- **AI Integration**: Claude API / OpenAI API
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v7

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# AI Service API Keys (choose one)
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Keys Setup

#### Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account and generate an API key
3. Add the key to your `.env` file

#### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add the key to your `.env` file

#### Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Create credentials and generate an API key
4. Add the key to your `.env` file

### 4. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix UI)
│   └── GoogleMap.tsx   # Google Maps integration
├── pages/              # Page components
│   ├── dashboard/      # Main app pages
│   └── auth/          # Authentication pages
├── services/           # API services
│   └── api/           # API client and services
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── router/             # Routing configuration
└── utils/              # Utility functions
```

## Key Components

### AI Car Recognition (`/dashboard/ai-car-recognition`)

- VIN and model-based car identification
- Automatic charging specification detection
- Connector compatibility analysis

### Charging Stations (`/dashboard/charging-stations`)

- Interactive map with real-time station data
- Advanced filtering and search capabilities
- Station details and availability tracking

### Smart Advisor (`/dashboard/smart-advisor`)

- AI-powered charging recommendations
- Preference-based optimization
- Cost and time analysis

### My Charging (`/dashboard/my-charging`)

- Personal charging history and statistics
- Active session monitoring
- Usage analytics and insights

### Admin Dashboard (`/dashboard/admin`)

- System-wide analytics and monitoring
- Station management tools
- User and revenue insights

## API Integration

The app integrates with multiple APIs:

1. **AI Services**: Claude/OpenAI for car recognition and recommendations
2. **Google Maps**: For mapping and geocoding services
3. **Backend API**: Custom API for charging station data and user management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Adding New Features

1. Define types in `src/types/ev.ts`
2. Create API services in `src/services/api/ev.ts`
3. Build components in `src/components/`
4. Add pages in `src/pages/dashboard/`
5. Update routing in `src/router/routes.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
