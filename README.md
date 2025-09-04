# Funding Agent Reporting

A modern React TypeScript application for tracking and analyzing funding agent performance and email campaign responses.

## Features

- 📊 **Interactive Dashboards** - Real-time KPI tracking and performance metrics
- 📈 **Advanced Analytics** - Chart.js powered visualizations with responsive design
- 🔍 **Smart Filtering** - Multi-criteria search and filtering capabilities
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🎨 **Theme Support** - Light/dark mode with CSS variable theming
- ♿ **Accessibility** - ARIA labels, keyboard navigation, and screen reader support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Charts**: Chart.js v4 + react-chartjs-2 v5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Backend**: Supabase
- **Styling**: Tailwind CSS with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Funding-Agent-Reporting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Chart.js Integration

This project uses Chart.js v4 with react-chartjs-2 v5 for all data visualizations. The charts are fully responsive, accessible, and integrate seamlessly with the theme system.

### Available Chart Types

- **Bar Charts** - Vertical and horizontal layouts
- **Line Charts** - With optional area fill
- **Pie Charts** - Standard and doughnut variants
- **Area Charts** - Filled line charts with smooth curves

### Adding a New Chart

1. **Import the chart component**
   ```tsx
   import { BarChart, buildBarData } from '../charts';
   ```

2. **Transform your data**
   ```tsx
   const chartData = buildBarData(
     labels,
     [{ label: 'Series Name', data: values }]
   );
   ```

3. **Render the chart**
   ```tsx
   <BarChart
     data={chartData}
     height={300}
     ariaLabel="Description of the chart"
   />
   ```

### Data Builders

The project includes utility functions for common data transformations:

- `buildBarData()` - For bar charts
- `buildLineData()` - For line charts  
- `buildAreaData()` - For area charts
- `buildPieData()` - For pie charts
- `buildDoughnutData()` - For doughnut charts

### Theming

Charts automatically adapt to your theme using CSS variables:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
}
```

### Accessibility Features

- ARIA labels for screen readers
- Fallback data tables (visually hidden)
- Keyboard navigation support
- High contrast mode compatibility
- Reduced motion support

## Project Structure

```
src/
├── charts/                 # Chart.js components and utilities
│   ├── components/        # Chart wrapper components
│   ├── builders.ts        # Data transformation functions
│   ├── palette.ts         # Color management
│   ├── theme.ts           # Theme setup
│   └── index.ts           # Main exports
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
├── store/                 # State management
├── types/                 # TypeScript type definitions
└── integrations/          # External service integrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the [documentation](docs/)
- Review the [migration guide](MIGRATION_RECHARTS_TO_CHARTJS.md) for Chart.js details
