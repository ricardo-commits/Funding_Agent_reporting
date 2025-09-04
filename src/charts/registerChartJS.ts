import {
  Chart,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
  SubTitle,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  // Import controllers explicitly
  LineController,
  BarController,
  PieController,
  DoughnutController,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

// Register all the components we need for comprehensive chart support
// Controllers must be registered for charts to work
Chart.register(
  // Controllers
  LineController,
  BarController,
  PieController,
  DoughnutController,
  // Scales
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  // Elements
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  // Plugins
  Filler,
  Tooltip,
  Legend,
  Title,
  SubTitle,
  // Time scales
  TimeScale,
  TimeSeriesScale,
  Decimation,
  annotationPlugin
);

// Verify registration - removed console.log for production

export default Chart;
