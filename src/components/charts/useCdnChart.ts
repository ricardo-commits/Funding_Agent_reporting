import { useEffect, useRef } from 'react';

type AnyObj = Record<string, any>;

export function useCdnChart(config: AnyObj) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof window === 'undefined' || !window.Chart) return;

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(el, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [JSON.stringify(config)]);

  return canvasRef;
}
