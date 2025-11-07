import React from 'react';

interface CostComparisonChartProps {
  baselineCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
}

const CostComparisonChart: React.FC<CostComparisonChartProps> = ({
  baselineCost,
  optimizedCost,
  savings,
  savingsPercentage
}) => {
  const maxCost = Math.max(baselineCost, optimizedCost);
  const baselineHeight = (baselineCost / maxCost) * 100;
  const optimizedHeight = (optimizedCost / maxCost) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
        Visual Cost Comparison
      </h3>
      
      {/* Bar Chart */}
      <div className="flex items-end justify-center space-x-8 mb-6" style={{ height: '300px' }}>
        {/* Baseline Cost Bar */}
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col justify-end" style={{ height: '250px', width: '80px' }}>
            <div 
              className="bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg relative transition-all duration-1000 ease-out"
              style={{ height: `${baselineHeight}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                ₹{baselineCost.toFixed(0)}
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white">Without</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Optimization</div>
          </div>
        </div>

        {/* Optimized Cost Bar */}
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col justify-end" style={{ height: '250px', width: '80px' }}>
            <div 
              className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg relative transition-all duration-1000 ease-out"
              style={{ height: `${optimizedHeight}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                ₹{optimizedCost.toFixed(0)}
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white">With</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Optimization</div>
          </div>
        </div>

        {/* Savings Indicator */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 border-2 border-dashed border-blue-300 dark:border-blue-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{savings.toFixed(0)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Saved
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {savingsPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-gray-900 dark:text-white">Total</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Savings</div>
          </div>
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white text-center">
          Cost Efficiency Trend
        </h4>
        
        <div className="relative">
          {/* Chart Background */}
          <svg width="100%" height="120" className="overflow-visible">
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Baseline Line */}
            <line 
              x1="10%" 
              y1="30" 
              x2="50%" 
              y2="30" 
              stroke="#ef4444" 
              strokeWidth="3"
              strokeDasharray="5,5"
            />
            
            {/* Optimization Line */}
            <line 
              x1="50%" 
              y1="30" 
              x2="90%" 
              y2="70" 
              stroke="#10b981" 
              strokeWidth="3"
            />
            
            {/* Data Points */}
            <circle cx="30%" cy="30" r="4" fill="#ef4444" />
            <circle cx="70%" cy="70" r="4" fill="#10b981" />
            
            {/* Labels */}
            <text x="30%" y="50" textAnchor="middle" className="text-xs fill-red-600 dark:fill-red-400 font-medium">
              Before
            </text>
            <text x="70%" y="90" textAnchor="middle" className="text-xs fill-green-600 dark:fill-green-400 font-medium">
              After
            </text>
            
            {/* Improvement Arrow */}
            <path 
              d="M 50% 35 L 65% 35 L 60% 30 M 65% 35 L 60% 40" 
              stroke="#3b82f6" 
              strokeWidth="2" 
              fill="none"
              markerEnd="url(#arrowhead)"
            />
            
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Traditional Cost</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Optimized Cost</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Improvement</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {((baselineCost / optimizedCost) * 100 - 100).toFixed(1)}%
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">Higher Cost</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Without AI</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {savingsPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">Cost Reduction</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">With AI</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {(optimizedCost / baselineCost * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Efficiency Ratio</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Cost Effectiveness</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostComparisonChart;