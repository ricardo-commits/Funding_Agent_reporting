import React from 'react';
import { useCdnChart } from './useCdnChart';

type BasicProps = {
  title: string;
  labels: string[];
  values: number[];
  className?: string;
};

export const BarBasic: React.FC<BasicProps> = ({ title, labels, values, className }) => {
  const ref = useCdnChart({
    type: 'bar',
    data: { labels, datasets: [{ label: title, data: values }] },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: title }, legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={ref} /></div>;
};

export const LineBasic: React.FC<BasicProps> = ({ title, labels, values, className }) => {
  const ref = useCdnChart({
    type: 'line',
    data: { labels, datasets: [{ label: title, data: values, tension: 0.3, pointRadius: 2 }] },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: title }, legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={ref} /></div>;
};

export const DoughnutBasic: React.FC<BasicProps> = ({ title, labels, values, className }) => {
  const ref = useCdnChart({
    type: 'doughnut',
    data: { labels, datasets: [{ data: values }] },
    options: {
      responsive: true,
      plugins: { 
        title: { display: true, text: title }, 
        legend: { 
          position: 'bottom',
          align: 'center',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 11
            },
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                
                return data.labels.map((label, i) => {
                  const value = dataset.data[i] as number;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  
                  return {
                    text: `${label}: ${value} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor?.[i] || '#000',
                    strokeStyle: dataset.borderColor?.[i] || '#000',
                    lineWidth: dataset.borderWidth || 0,
                    pointStyle: 'circle',
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        }
      }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={ref} /></div>;
};

type MultiBarProps = {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
  className?: string;
};

export const BarMulti: React.FC<MultiBarProps> = ({ title, labels, datasets, className }) => {
  const ref = useCdnChart({
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { 
        title: { display: true, text: title },
        legend: { 
          display: true,
          position: 'top',
          align: 'center'
        }
      },
      scales: { 
        y: { 
          beginAtZero: true, 
          ticks: { precision: 0 },
          title: {
            display: true,
            text: 'Count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Sequence'
          }
        }
      }
    }
  });
  return <div className={`flex items-center justify-center ${className ?? ''}`}><canvas ref={ref} /></div>;
};