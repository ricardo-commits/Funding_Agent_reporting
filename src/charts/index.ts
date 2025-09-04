// Chart.js components and utilities
export { ChartBase, type ChartBaseProps, type ChartTypeUnion } from './components/ChartBase';
export { BarChart, type BarChartProps } from './components/BarChart';
export { LineChart, type LineChartProps } from './components/LineChart';
export { AreaChart, type AreaChartProps } from './components/AreaChart';
export { PieChart, type PieChartProps } from './components/PieChart';
export { DoughnutChart, type DoughnutChartProps } from './components/DoughnutChart';

// Data builders
export {
  buildBarData,
  buildLineData,
  buildAreaData,
  buildPieData,
  buildDoughnutData,
  buildRadarData,
  buildScatterData,
  buildTimelineData,
  buildWeekdayData,
  transformRechartsData,
  type SeriesData,
  type PieData,
  type DateSeriesData,
} from './builders';

// Color palette
export {
  getSeriesColours,
  getColor,
  bg,
  border,
} from './palette';

// Theme setup
export { setupChartTheme } from './theme';

// Chart.js registration
export { default as Chart } from './registerChartJS';
