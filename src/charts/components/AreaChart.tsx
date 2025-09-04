import React from 'react';
import { LineChart, LineChartProps } from './LineChart';

export interface AreaChartProps extends Omit<LineChartProps, 'fill'> {
  // AreaChart is just LineChart with fill enabled
}

export const AreaChart: React.FC<AreaChartProps> = (props) => {
  return <LineChart {...props} fill={true} />;
};
