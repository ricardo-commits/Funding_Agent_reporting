import { ChartData } from 'chart.js';
import { getSeriesColours } from './palette';

export interface SeriesData {
  label: string;
  data: number[];
}

export interface PieData {
  labels: string[];
  data: number[];
  label?: string;
}

export function buildBarData(
  labels: string[], 
  series: SeriesData[]
): ChartData<'bar'> {
  return {
    labels,
    datasets: series.map((s, index) => ({
      label: s.label,
      data: s.data,
      backgroundColor: getSeriesColours(series.length)[index],
      borderColor: getSeriesColours(series.length)[index],
      borderWidth: 1,
      borderRadius: 4,
    })),
  };
}

export function buildLineData(
  labels: string[], 
  series: SeriesData[]
): ChartData<'line'> {
  return {
    labels,
    datasets: series.map((s, index) => ({
      label: s.label,
      data: s.data,
      borderColor: getSeriesColours(series.length)[index],
      backgroundColor: getSeriesColours(series.length)[index],
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointBackgroundColor: getSeriesColours(series.length)[index],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };
}

// Enhanced builders for date/time data
export interface DateSeriesData {
  label: string;
  data: Array<{ x: string; y: number; date?: Date; weekday?: number }>;
}

export function buildTimelineData(
  dateSeries: DateSeriesData[],
  options?: {
    displayWeekdays?: boolean;
    dateFormat?: 'short' | 'long' | 'iso';
  }
): ChartData<'line'> {
  const { displayWeekdays = false, dateFormat = 'short' } = options || {};
  
  // Sort data by date and create proper labels
  const processedSeries = dateSeries.map(series => {
    const sortedData = [...series.data].sort((a, b) => 
      new Date(a.x).getTime() - new Date(b.x).getTime()
    );
    
    return {
      ...series,
      data: sortedData
    };
  });
  
  // Get all unique dates from all series
  const allDates = new Set<string>();
  processedSeries.forEach(series => {
    series.data.forEach(point => allDates.add(point.x));
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  // Create labels with proper formatting
  const labels = sortedDates.map(dateStr => {
    const date = new Date(dateStr);
    if (displayWeekdays) {
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${weekdays[date.getDay()]} ${formatDate(date, dateFormat)}`;
    }
    return formatDate(date, dateFormat);
  });
  
  // Create datasets with proper data alignment
  const datasets = processedSeries.map((series, index) => {
    const dataMap = new Map(series.data.map(point => [point.x, point.y]));
    const alignedData = sortedDates.map(date => dataMap.get(date) || 0);
    
    return {
      label: series.label,
      data: alignedData,
      borderColor: getSeriesColours(processedSeries.length)[index],
      backgroundColor: getSeriesColours(processedSeries.length)[index],
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointBackgroundColor: getSeriesColours(processedSeries.length)[index],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });
  
  return { labels, datasets };
}

export function buildWeekdayData(
  weekdayData: Array<{ weekday: number; count: number; label?: string }>,
  seriesLabel = 'Responses'
): ChartData<'bar'> {
  const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Create array with all weekdays (1-7), filling missing ones with 0
  const fullWeekData = Array.from({ length: 7 }, (_, i) => {
    const weekdayIndex = i + 1; // 1-7
    const existingData = weekdayData.find(item => item.weekday === weekdayIndex);
    return {
      label: weekdayNames[i],
      value: existingData ? existingData.count : 0,
      weekdayIndex
    };
  });
  
  return {
    labels: fullWeekData.map(item => item.label),
    datasets: [{
      label: seriesLabel,
      data: fullWeekData.map(item => item.value),
      backgroundColor: getSeriesColours(1)[0],
      borderColor: getSeriesColours(1)[0],
      borderWidth: 1,
      borderRadius: 4,
    }],
  };
}

function formatDate(date: Date, format: 'short' | 'long' | 'iso'): string {
  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'short':
    default:
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
  }
}

export function buildAreaData(
  labels: string[], 
  series: SeriesData[]
): ChartData<'line'> {
  return {
    labels,
    datasets: series.map((s, index) => ({
      label: s.label,
      data: s.data,
      borderColor: getSeriesColours(series.length)[index],
      backgroundColor: getSeriesColours(series.length)[index],
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: getSeriesColours(series.length)[index],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };
}

export function buildPieData(
  labels: string[], 
  data: number[], 
  label?: string
): ChartData<'pie'> {
  const colours = getSeriesColours(labels.length);
  
  return {
    labels,
    datasets: [{
      label: label || 'Data',
      data,
      backgroundColor: colours,
      borderColor: colours,
      borderWidth: 0,
    }],
  };
}

export function buildDoughnutData(
  labels: string[], 
  data: number[], 
  label?: string
): ChartData<'doughnut'> {
  const colours = getSeriesColours(labels.length);
  
  return {
    labels,
    datasets: [{
      label: label || 'Data',
      data,
      backgroundColor: colours,
      borderColor: colours,
      borderWidth: 0,
    }],
  };
}

export function buildRadarData(
  labels: string[], 
  series: SeriesData[]
): ChartData<'radar'> {
  return {
    labels,
    datasets: series.map((s, index) => ({
      label: s.label,
      data: s.data,
      borderColor: getSeriesColours(series.length)[index],
      backgroundColor: getSeriesColours(series.length)[index],
      borderWidth: 2,
      fill: false,
      pointBackgroundColor: getSeriesColours(series.length)[index],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };
}

export function buildScatterData(
  data: Array<{ x: number; y: number }>, 
  label?: string
): ChartData<'scatter'> {
  return {
    datasets: [{
      label: label || 'Data',
      data,
      backgroundColor: getSeriesColours(1)[0],
      borderColor: getSeriesColours(1)[0],
      borderWidth: 1,
      pointBackgroundColor: getSeriesColours(1)[0],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };
}

// Helper to transform Recharts-style data to Chart.js format
export function transformRechartsData(
  data: any[], 
  xKey: string, 
  yKey: string, 
  seriesKey?: string
): ChartData<'line' | 'bar'> {
  if (!data || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  if (seriesKey) {
    // Multiple series
    const series = new Map<string, number[]>();
    const labels: string[] = [];
    
    data.forEach(item => {
      const xValue = item[xKey];
      const yValue = item[yKey];
      const seriesName = item[seriesKey];
      
      if (!labels.includes(xValue)) {
        labels.push(xValue);
      }
      
      if (!series.has(seriesName)) {
        series.set(seriesName, []);
      }
      
      const seriesData = series.get(seriesName)!;
      const labelIndex = labels.indexOf(xValue);
      
      // Fill gaps with null
      while (seriesData.length < labelIndex) {
        seriesData.push(null as any);
      }
      
      if (seriesData.length === labelIndex) {
        seriesData.push(yValue);
      } else {
        seriesData[labelIndex] = yValue;
      }
    });
    
    const datasets = Array.from(series.entries()).map(([name, values], index) => ({
      label: name,
      data: values,
      backgroundColor: getSeriesColours(series.size)[index],
      borderColor: getSeriesColours(series.size)[index],
      borderWidth: 2,
    }));
    
    return { labels, datasets };
  } else {
    // Single series
    const labels = data.map(item => item[xKey]);
    const values = data.map(item => item[yKey]);
    
    return {
      labels,
      datasets: [{
        label: yKey,
        data: values,
        backgroundColor: getSeriesColours(1)[0],
        borderColor: getSeriesColours(1)[0],
        borderWidth: 2,
      }],
    };
  }
}
