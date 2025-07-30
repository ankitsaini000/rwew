import React from 'react';

interface PerformanceChartProps {
  data: number[];
  color: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, color }) => {
  const max = Math.max(...data) || 1;
  const height = 100;

  return (
    <div className="flex items-end h-[100px] gap-1 w-full">
      {data.map((value, i) => (
        <div 
          key={i} 
          className="flex-1"
          style={{
            height: `${(value / max) * height}px`,
            backgroundColor: color,
            minWidth: '8px',
            borderRadius: '3px'
          }}
        />
      ))}
    </div>
  );
};

export default PerformanceChart; 