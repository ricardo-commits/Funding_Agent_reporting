import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Chart.js registration and theme setup
import './charts/registerChartJS'
import { setupChartTheme } from './charts/theme'

// Setup Chart.js theme
setupChartTheme()

createRoot(document.getElementById("root")!).render(<App />);
